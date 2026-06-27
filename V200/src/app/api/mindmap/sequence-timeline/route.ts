import { NextRequest, NextResponse } from 'next/server'
import { getUserTier } from '@/lib/user-tier'
import { generateText } from '@/lib/ai'
import { AREA_BY_ID, type AreaId } from '@/lib/mindmap-areas'
import type { Candidate, SequencedMilestone, SequenceTimelineRequest } from '@/lib/mindmap'

// gen2 — replaces the 1.6s fake "Weaving your timeline…" timer in
// /app/mindmap/new. Takes the milestones the user kept and intelligently
// SEQUENCES them across the horizon: foundational/prerequisite milestones
// earlier, ambitious/dependent ones later, spread sensibly. The model only
// orders + places (assigns a bucket); the milestone TEXT stays authoritative
// from gen1, so we merge its placement back onto the original candidates by id.

const VALID_AREAS: AreaId[] = ['career', 'health', 'relationship', 'personal', 'finance']

// Horizons ≤ 1 month are planned in weeks (4 buckets); everything else in
// months (capped so a 5-year plan stays sane).
function timeline(horizonMonths: number): { unit: 'week' | 'month'; buckets: number } {
  if (horizonMonths <= 1) return { unit: 'week', buckets: 4 }
  return { unit: 'month', buckets: Math.min(horizonMonths, 60) }
}

function buildSystem(unit: 'week' | 'month', buckets: number): string {
  return [
    'You are a goal-sequencing coach for MindShift.',
    'The user picked a set of milestones for one life area over a fixed time horizon. Order them into a sensible plan and place each one on the timeline.',
    '',
    'Principles:',
    '- Put foundational, habit-forming, or prerequisite milestones EARLIER; ambitious or dependent ones LATER.',
    '- Spread them across the whole horizon — do not cram everything into the first bucket, and do not leave the back half empty.',
    '- Every milestone the user picked must appear EXACTLY ONCE. Do not invent, drop, or merge milestones.',
    '',
    `Respond with ONLY a JSON object: {"milestones":[{"id":"<id>","${unit}":<int>}]}`,
    `where ${unit} is the ${unit} index from 1 to ${buckets} the milestone belongs in. Multiple milestones may share the same ${unit}.`,
    'Use the exact id strings given. Output every id.',
  ].join('\n')
}

function buildPrompt(b: SequenceTimelineRequest, unit: string, buckets: number): string {
  const area = AREA_BY_ID[b.category]
  const list = b.picked
    .map(c => `- id ${c.id}: ${c.headline} — ${c.outcome}`)
    .join('\n')
  return [
    `Life area: ${area?.label ?? b.category}`,
    `Time horizon: ${b.horizonLabel} → plan across ${buckets} ${unit}${buckets === 1 ? '' : 's'} (${unit} 1 = soonest).`,
    '',
    'Milestones the user kept:',
    list,
    '',
    `Sequence and place all ${b.picked.length} milestones as JSON.`,
  ].join('\n')
}

// Parse {milestones:[{id, week|month}]} tolerating fences/prose, returning a
// map of id → bucket for ids we recognize.
function parsePlacement(raw: string, unit: 'week' | 'month', buckets: number, validIds: Set<string>): Map<string, number> {
  let text = raw.trim()
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) text = fence[1].trim()
  if (!text.startsWith('{')) {
    const s = text.indexOf('{')
    const e = text.lastIndexOf('}')
    if (s !== -1 && e > s) text = text.slice(s, e + 1)
  }
  const placement = new Map<string, number>()
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return placement
  }
  const arr = (parsed as { milestones?: unknown })?.milestones
  if (!Array.isArray(arr)) return placement
  for (const item of arr) {
    const o = item as Record<string, unknown>
    const id = typeof o?.id === 'string' ? o.id : ''
    const rawBucket = o?.[unit]
    const bucket = typeof rawBucket === 'number' ? rawBucket : Number(rawBucket)
    if (!id || !validIds.has(id) || !Number.isFinite(bucket)) continue
    // Clamp into range; first occurrence of an id wins.
    if (!placement.has(id)) placement.set(id, Math.min(buckets, Math.max(1, Math.round(bucket))))
  }
  return placement
}

// Even-distribution fallback (mirrors the frontend's original placement) for any
// milestone the model didn't place, so the timeline is never missing a card.
function evenBucket(index: number, count: number, buckets: number): number {
  return Math.min(buckets, 1 + Math.floor((index / Math.max(1, count)) * buckets))
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as SequenceTimelineRequest | null
  if (!body || !VALID_AREAS.includes(body.category) || !Array.isArray(body.picked) || body.picked.length === 0) {
    return NextResponse.json({ error: 'Missing category, horizon, or picked milestones.' }, { status: 400 })
  }

  const { userId } = await getUserTier()
  if (!userId) return NextResponse.json({ error: 'Sign in to build a mind map.' }, { status: 401 })

  const picked: Candidate[] = body.picked
  const { unit, buckets } = timeline(body.horizonMonths)
  const validIds = new Set(picked.map(c => c.id))

  let placement = new Map<string, number>()
  try {
    const raw = await generateText({
      system: buildSystem(unit, buckets),
      prompt: buildPrompt(body, unit, buckets),
      temperature: 0.4,
      maxTokens: 900,
      timeoutMs: 25_000,
      json: true,
    })
    placement = parsePlacement(raw, unit, buckets, validIds)
  } catch (err) {
    // Sequencing is an enhancement, not load-bearing — if the AI call fails we
    // fall back to even distribution rather than blocking the user's save.
    console.error('[mindmap/sequence-timeline] AI call failed, falling back to even spread:', err)
  }

  // Merge AI placement onto the authoritative candidate text; fill any gaps with
  // the even-distribution fallback, then order by bucket (stable within bucket).
  const sequenced: SequencedMilestone[] = picked
    .map((c, i) => ({ ...c, month: placement.get(c.id) ?? evenBucket(i, picked.length, buckets) }))
    .sort((a, b2) => a.month - b2.month)

  return NextResponse.json({ unit, buckets, milestones: sequenced })
}
