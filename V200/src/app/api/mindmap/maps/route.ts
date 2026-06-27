import { NextRequest, NextResponse } from 'next/server'
import { getUserTier } from '@/lib/user-tier'
import { getSupabaseAdmin } from '@/lib/supabase'
import { type AreaId } from '@/lib/mindmap-areas'
import type { SaveMapRequest, SavedGoal, SavedMap, SavedMilestone } from '@/lib/mindmap'

// POST — persists a whole map (map → goals → milestones) in one call and
// enforces the tier cap (1 free / 3 pro) HERE, not in RLS (RLS can't cheaply
// count rows per user — see 005_mindmap.sql).
// GET  — returns the signed-in user's active maps as a tree, for the /map view
// and the gate's "do I have a map?" check.
//
// SECURITY: both use the service-role client (getSupabaseAdmin), which BYPASSES
// RLS — so every query MUST filter by user_id explicitly, the same as the
// journal API. Never trust a client-supplied user id.

const VALID_AREAS: AreaId[] = ['career', 'health', 'relationship', 'personal', 'finance']
const FREE_MAP_CAP = 1
const PRO_MAP_CAP = 3

// First-words title fallback when the client doesn't send one (mirrors how
// vent_sessions derive a title) — the first goal's identity or outcome.
function deriveTitle(body: SaveMapRequest): string | null {
  const g = body.goals[0]
  const seed = g?.woop?.identity?.trim() || g?.woop?.outcome?.trim() || ''
  if (!seed) return null
  return seed.length > 80 ? `${seed.slice(0, 77)}…` : seed
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as SaveMapRequest | null
  if (!body || !body.horizonLabel?.trim() || !Array.isArray(body.goals) || body.goals.length === 0) {
    return NextResponse.json({ error: 'Missing horizon or goals.' }, { status: 400 })
  }
  for (const g of body.goals) {
    if (!VALID_AREAS.includes(g.category) || !g.woop?.outcome?.trim()) {
      return NextResponse.json({ error: 'Each goal needs a valid area and a WOOP outcome.' }, { status: 400 })
    }
  }

  const { tier, userId } = await getUserTier()
  if (!userId) return NextResponse.json({ error: 'Sign in to save a mind map.' }, { status: 401 })

  const admin = getSupabaseAdmin()

  // Tier cap — count the user's existing active maps.
  const cap = tier === 'pro' ? PRO_MAP_CAP : FREE_MAP_CAP
  const { count, error: countErr } = await admin
    .from('mindmaps')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'active')
  if (countErr) {
    console.error('[mindmap/maps POST] count failed:', countErr.message)
    return NextResponse.json({ error: 'Could not save your map right now.' }, { status: 500 })
  }
  if ((count ?? 0) >= cap) {
    return NextResponse.json(
      {
        error:
          tier === 'pro'
            ? 'You have reached the maximum of 3 maps. Archive one to make room.'
            : 'Your free plan includes 1 map. Upgrade to Pro for up to 3.',
        limitType: 'maps',
        tier,
      },
      { status: 403 }
    )
  }

  // 1) the container
  const { data: map, error: mapErr } = await admin
    .from('mindmaps')
    .insert({
      user_id: userId,
      title: body.title?.trim() || deriveTitle(body),
      horizon_label: body.horizonLabel.trim(),
      horizon_date: body.horizonDate ?? null,
      theme: body.theme ?? 'notepad',
      status: 'active',
    })
    .select('id')
    .single()
  if (mapErr || !map) {
    console.error('[mindmap/maps POST] map insert failed:', mapErr?.message)
    return NextResponse.json({ error: 'Could not save your map right now.' }, { status: 500 })
  }
  const mapId = map.id as string

  // 2) goals + 3) milestones. supabase-js has no multi-statement transaction, so
  // on any failure we delete the map (FK cascade removes goals + milestones)
  // rather than leaving a half-written tree behind.
  try {
    const goalRows = body.goals.map((g, i) => ({
      map_id: mapId,
      user_id: userId,
      category: g.category,
      outcome: g.woop.outcome.trim(),
      obstacle: g.woop.obstacle?.trim() || null,
      identity: g.woop.identity?.trim() || null,
      position: i,
    }))
    const { data: goals, error: goalErr } = await admin
      .from('mindmap_goals')
      .insert(goalRows)
      .select('id, category')
    if (goalErr || !goals) throw goalErr ?? new Error('goal insert returned no rows')

    const goalIdByCategory = new Map(goals.map(g => [g.category as string, g.id as string]))
    const msRows = body.goals.flatMap(g => {
      const goalId = goalIdByCategory.get(g.category)
      if (!goalId) return []
      return (g.milestones ?? []).map((m, j) => ({
        goal_id: goalId,
        user_id: userId,
        position: j,
        month: typeof m.month === 'number' ? m.month : null,
        headline: m.headline?.trim() || null,
        // outcome is NOT NULL — fall back to the headline if a milestone somehow
        // arrives without a measurable outcome.
        outcome: m.outcome?.trim() || m.headline?.trim() || 'Milestone',
        first_action: m.firstAction?.trim() || null,
        if_then: m.ifThen?.trim() || null,
        status: 'pending',
      }))
    })
    if (msRows.length) {
      const { error: msErr } = await admin.from('mindmap_milestones').insert(msRows)
      if (msErr) throw msErr
    }
  } catch (err) {
    await admin.from('mindmaps').delete().eq('id', mapId).eq('user_id', userId)
    console.error('[mindmap/maps POST] goal/milestone insert failed, rolled back map:', err)
    return NextResponse.json({ error: 'Could not save your map right now.' }, { status: 500 })
  }

  return NextResponse.json({ id: mapId })
}

export async function GET() {
  const { userId } = await getUserTier()
  if (!userId) return NextResponse.json({ error: 'Sign in to view your maps.' }, { status: 401 })

  const admin = getSupabaseAdmin()

  const { data: maps, error: mapsErr } = await admin
    .from('mindmaps')
    .select('id, title, horizon_label, horizon_date, theme, status, created_at')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
  if (mapsErr) {
    console.error('[mindmap/maps GET] maps query failed:', mapsErr.message)
    return NextResponse.json({ error: 'Could not load your maps.' }, { status: 500 })
  }
  if (!maps || maps.length === 0) return NextResponse.json({ maps: [] })

  const mapIds = maps.map(m => m.id as string)
  const { data: goals, error: goalsErr } = await admin
    .from('mindmap_goals')
    .select('id, map_id, category, outcome, obstacle, identity, position')
    .eq('user_id', userId)
    .in('map_id', mapIds)
    .order('position', { ascending: true })
  if (goalsErr) {
    console.error('[mindmap/maps GET] goals query failed:', goalsErr.message)
    return NextResponse.json({ error: 'Could not load your maps.' }, { status: 500 })
  }

  const goalIds = (goals ?? []).map(g => g.id as string)
  let milestones: Record<string, unknown>[] = []
  if (goalIds.length) {
    const { data: ms, error: msErr } = await admin
      .from('mindmap_milestones')
      .select('id, goal_id, headline, outcome, first_action, if_then, month, position, status')
      .eq('user_id', userId)
      .in('goal_id', goalIds)
      .order('position', { ascending: true })
    if (msErr) {
      console.error('[mindmap/maps GET] milestones query failed:', msErr.message)
      return NextResponse.json({ error: 'Could not load your maps.' }, { status: 500 })
    }
    milestones = ms ?? []
  }

  // Assemble the tree (camelCase for the client).
  const msByGoal = new Map<string, SavedMilestone[]>()
  for (const m of milestones) {
    const goalId = m.goal_id as string
    const list = msByGoal.get(goalId) ?? []
    list.push({
      id: m.id as string,
      headline: (m.headline as string | null) ?? null,
      outcome: m.outcome as string,
      firstAction: (m.first_action as string | null) ?? null,
      ifThen: (m.if_then as string | null) ?? null,
      month: (m.month as number | null) ?? null,
      position: m.position as number,
      status: m.status as string,
    })
    msByGoal.set(goalId, list)
  }

  const goalsByMap = new Map<string, SavedGoal[]>()
  for (const g of goals ?? []) {
    const mapId = g.map_id as string
    const list = goalsByMap.get(mapId) ?? []
    list.push({
      id: g.id as string,
      category: g.category as AreaId,
      outcome: g.outcome as string,
      obstacle: (g.obstacle as string | null) ?? null,
      identity: (g.identity as string | null) ?? null,
      position: g.position as number,
      milestones: msByGoal.get(g.id as string) ?? [],
    })
    goalsByMap.set(mapId, list)
  }

  const tree: SavedMap[] = maps.map(m => ({
    id: m.id as string,
    title: (m.title as string | null) ?? null,
    horizonLabel: m.horizon_label as string,
    horizonDate: (m.horizon_date as string | null) ?? null,
    theme: m.theme as string,
    status: m.status as string,
    createdAt: m.created_at as string,
    goals: goalsByMap.get(m.id as string) ?? [],
  }))

  return NextResponse.json({ maps: tree })
}
