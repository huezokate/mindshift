// Sunday weekly-reminder cron.
//
// Vercel Cron hits this GET every Sunday evening (see vercel.json). It:
//   1. authorizes via CRON_SECRET (Vercel sends it as a Bearer header)
//   2. scans every ACTIVE mindmap (service-role → bypasses RLS, all users)
//   3. computes each map's current week from created_at; skips finished plans
//   4. for each area (goal) with no weekly goal yet for THIS week, AI-generates
//      one from the plan + the user's last reflection, and persists it
//   5. groups by user, resolves the email via Clerk, sends one digest per user
//
// The "send" step is intentionally isolated (Resend today) so an SMS channel can
// be slotted in later without touching the generation/grouping logic.
//
// DEFERRED: per-user timezone (fixed send for everyone); real unsubscribe
// suppression (link points at settings); pulling the last reflection from the
// journal (the /reflect capture UI isn't wired yet — passed as null for now).

import { NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { buildWeeklyReminderEmail, type WeeklyMapDigest } from '@/lib/emails/weekly-reminder'
import { getResend, FROM } from '@/lib/resend'
import { generateWeeklyGoal, weeksForHorizon } from '@/lib/mindmap-weekly'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

type MilestoneRow = { headline: string | null; outcome: string; first_action: string | null; if_then: string | null }
type GoalRow = { id: string; category: string; outcome: string; identity: string | null; mindmap_milestones: MilestoneRow[] | null }
type WeeklyGoalRow = { id: string; goal_id: string | null; week_index: number; goal_text: string }
type MapRow = {
  id: string
  user_id: string
  title: string | null
  horizon_label: string
  horizon_date: string | null
  created_at: string
  mindmap_goals: GoalRow[] | null
  mindmap_weekly_goals: WeeklyGoalRow[] | null
}

/** 1-based week the user is currently in, from when the map was created. */
function currentWeek(createdAt: string, now: number): number {
  return Math.max(1, Math.floor((now - new Date(createdAt).getTime()) / WEEK_MS) + 1)
}

export async function GET(req: Request) {
  // ── 1. Authorize ──────────────────────────────────────────────────────────
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = Date.now()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.minds-shift.com'
  const db = getSupabaseAdmin()

  // ── 2. Every active map + its goals/milestones + any weekly goals ──────────
  const { data, error } = await db
    .from('mindmaps')
    .select(`
      id, user_id, title, horizon_label, horizon_date, created_at,
      mindmap_goals ( id, category, outcome, identity, mindmap_milestones ( headline, outcome, first_action, if_then ) ),
      mindmap_weekly_goals ( id, goal_id, week_index, goal_text )
    `)
    .eq('status', 'active')

  if (error) {
    console.error('[sunday-reminder] load maps failed:', error.message)
    return NextResponse.json({ error: 'Failed to load maps.' }, { status: 500 })
  }

  const maps = (data ?? []) as unknown as MapRow[]
  if (maps.length === 0) return NextResponse.json({ sent: 0, skipped: 0, generated: 0, note: 'no active maps' })

  let generated = 0

  // ── 3 + 4. Per user: build THIS week's digest, generating goals as needed ──
  const byUser = new Map<string, WeeklyMapDigest[]>()
  for (const m of maps) {
    const week = currentWeek(m.created_at, now)
    const totalWeeks = weeksForHorizon(m.horizon_label, m.created_at, m.horizon_date)
    if (week > totalWeeks) continue // plan complete — nothing to send

    const goals = m.mindmap_goals ?? []
    const existing = m.mindmap_weekly_goals ?? []
    const weeklyGoals: { category: string; goalText: string }[] = []

    for (const goal of goals) {
      // Already have this area's goal for this week? Use it (idempotent).
      const have = existing.find(w => w.goal_id === goal.id && w.week_index === week)
      if (have) {
        weeklyGoals.push({ category: goal.category, goalText: have.goal_text })
        continue
      }
      // Otherwise generate it. TODO: pass the user's last reflection once /reflect saves to the journal.
      try {
        const goalText = await generateWeeklyGoal({
          areaLabel: goal.category,
          outcome: goal.outcome,
          identity: goal.identity,
          milestones: (goal.mindmap_milestones ?? []).map(ms => ({ headline: ms.headline, outcome: ms.outcome })),
          weekIndex: week,
          totalWeeks,
          lastReflection: null,
        })
        if (!goalText) continue
        const { error: insErr } = await db.from('mindmap_weekly_goals').insert({
          map_id: m.id,
          goal_id: goal.id,
          user_id: m.user_id,
          week_index: week,
          goal_text: goalText,
          status: 'pending',
        })
        if (insErr) {
          console.error('[sunday-reminder] weekly goal insert failed:', insErr.message)
          continue
        }
        generated++
        weeklyGoals.push({ category: goal.category, goalText })
      } catch (e) {
        console.error('[sunday-reminder] weekly goal generation failed:', e instanceof Error ? e.message : e)
      }
    }

    const milestones = goals.flatMap(g => g.mindmap_milestones ?? [])
    if (weeklyGoals.length === 0 && milestones.length === 0) continue // nothing to say

    const digest: WeeklyMapDigest = {
      mapTitle: m.title,
      horizonLabel: m.horizon_label,
      weekIndex: week,
      weeklyGoals,
      milestones,
    }
    const list = byUser.get(m.user_id) ?? []
    list.push(digest)
    byUser.set(m.user_id, list)
  }

  // ── 5. Resolve email per user, send the digest ─────────────────────────────
  const clerk = await clerkClient()
  let sent = 0
  let skipped = 0
  const errors: string[] = []

  for (const [userId, userMaps] of byUser) {
    try {
      const user = await clerk.users.getUser(userId)
      const to = user.primaryEmailAddress?.emailAddress
      if (!to) { skipped++; continue }

      const { subject, html } = buildWeeklyReminderEmail({
        firstName: user.firstName,
        appUrl,
        unsubscribeUrl: `${appUrl}/app/settings`,
        maps: userMaps,
      })

      const { error: sendErr } = await getResend().emails.send({ from: FROM, to, subject, html })
      if (sendErr) { errors.push(`${userId}: ${JSON.stringify(sendErr)}`); skipped++; continue }
      sent++
    } catch (e) {
      errors.push(`${userId}: ${e instanceof Error ? e.message : 'unknown'}`)
      skipped++
    }
  }

  return NextResponse.json({ sent, skipped, generated, errors: errors.slice(0, 20) })
}
