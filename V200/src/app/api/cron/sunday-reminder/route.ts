// Sunday weekly-reminder cron (M5).
//
// Vercel Cron hits this GET on a schedule (see vercel.json). It:
//   1. authorizes the call via CRON_SECRET (Vercel sends it as a Bearer header)
//   2. scans every ACTIVE mindmap (service-role → bypasses RLS, all users)
//   3. computes each map's current week from created_at
//   4. groups by user, resolves the email via Clerk backend
//   5. sends one digest per user (aggregates their maps — pro can have up to 3)
//
// SCOPE TONIGHT (deliberately deferred — see TODOs):
//   • Fixed send time for everyone; per-user timezone is a later feature.
//   • Unsubscribe link points at settings; real suppression (a prefs table)
//     isn't built yet, so no one is filtered out.
//   • Untested end-to-end until M4 puts real maps in the DB (data is stubbed).

import { NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { buildWeeklyReminderEmail, type WeeklyMapDigest } from '@/lib/emails/weekly-reminder'
import { getResend, FROM } from '@/lib/resend'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

type MilestoneRow = { outcome: string; first_action: string | null; if_then: string | null }
type GoalRow = { category: string; outcome: string; mindmap_milestones: MilestoneRow[] | null }
type WeeklyGoalRow = { week_index: number; goal_text: string }
type MapRow = {
  id: string
  user_id: string
  title: string | null
  horizon_label: string
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

  // ── 2. Every active map + its goals/milestones + weekly goals ──────────────
  const { data, error } = await db
    .from('mindmaps')
    .select(`
      id, user_id, title, horizon_label, created_at,
      mindmap_goals ( category, outcome, mindmap_milestones ( outcome, first_action, if_then ) ),
      mindmap_weekly_goals ( week_index, goal_text )
    `)
    .eq('status', 'active')

  if (error) {
    return NextResponse.json({ error: 'Failed to load maps.' }, { status: 500 })
  }

  const maps = (data ?? []) as unknown as MapRow[]
  if (maps.length === 0) {
    return NextResponse.json({ sent: 0, skipped: 0, note: 'no active maps' })
  }

  // ── 3. Group maps by user → a per-user digest of THIS week's content ───────
  const byUser = new Map<string, WeeklyMapDigest[]>()
  for (const m of maps) {
    const week = currentWeek(m.created_at, now)
    const weeklyGoals = (m.mindmap_weekly_goals ?? [])
      .filter(w => w.week_index === week)
      // weekly_goals don't carry category on this row; pair by goal order isn't
      // reliable, so we render the area label from the goal list when present.
      .map(w => ({ category: m.mindmap_goals?.[0]?.category ?? '', goalText: w.goal_text }))
    const milestones = (m.mindmap_goals ?? []).flatMap(g => g.mindmap_milestones ?? [])

    // Skip a map with nothing to say this week (plan exhausted, none generated).
    if (weeklyGoals.length === 0 && milestones.length === 0) continue

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

  // ── 4 & 5. Resolve email per user, send the digest ─────────────────────────
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
        // TODO(M5): real unsubscribe — needs an email-prefs table + token route.
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

  return NextResponse.json({ sent, skipped, errors: errors.slice(0, 20) })
}
