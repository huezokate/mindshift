import { NextRequest, NextResponse } from 'next/server'
import { getUserTier } from '@/lib/user-tier'
import { generateText } from '@/lib/ai'
import { AREA_BY_ID, type AreaId } from '@/lib/mindmap-areas'
import type { Candidate, GenerateCandidatesRequest } from '@/lib/mindmap'

// gen1 — replaces the 1.8s fake timer + SAMPLE_CANDIDATES in /app/mindmap/new.
// Takes the user's area + horizon + WOOP answers and returns 12 distinct
// milestone candidates in the house voice (identity headline / measurable
// outcome / tiny first action / if-then). Mirrors generate-response: Groq via
// `generateText`, tier resolved server-side, fail loud on provider error.

// Primary areas request the full set to curate from; supporting ("light")
// areas request just a few auto-kept milestones (no curate screen).
const DEFAULT_COUNT = 12
const MAX_COUNT = 12

function buildSystem(count: number): string {
  return [
    'You are a goal-design coach for MindShift.',
    'A user picked a life area and answered a WOOP exercise (their desired outcome, their main obstacle, and the identity they want to grow into).',
    `Propose exactly ${count} DISTINCT milestone candidates they could commit to, all scaled to their time horizon.`,
    '',
    'Each candidate has four parts:',
    '- headline: an IDENTITY statement phrased "Become someone who …" — short, present tense.',
    '- outcome: a concrete, measurable target tied to the horizon (use numbers/cadence where natural). State the target itself with NO time-span filler — the horizon is already known. Write "Run a 10k without stopping" NOT "Run a 10k over the next year"; write "Drink 8 glasses of water a day" NOT "Drink 8 glasses of water a day for the next 12 months".',
    '- firstAction: ONE concrete micro-step doable in under 3 minutes, right now, in a single sitting. Start with a verb. It must be genuinely tiny (e.g. "Text one friend one question", "Open a doc and write one sentence") — never a prep-heavy or multi-part task like "gather all my documents" or "research options".',
    '- ifThen: an implementation intention in the exact form "If <cue>, then I <action>."',
    '',
    'Voice: warm, direct, no fluff, no markdown, no emoji. Each field is ONE sentence.',
    "Do NOT assume the user's gender, sexual orientation, relationship status, age, or background. Take their outcome, obstacle, and identity literally and honor the cues in their own words (e.g. who they want to date) — never default to heteronormative or other stereotyped assumptions. When their goal involves other people, keep it inclusive of who they actually named.",
    `Make all ${count} candidates genuinely different angles on the area, each plausibly achievable within the horizon, and clearly tied to the user's stated outcome, obstacle, and identity.`,
    '',
    'Respond with ONLY a JSON object of this exact shape:',
    '{"candidates":[{"headline":"…","outcome":"…","firstAction":"…","ifThen":"…"}]}',
    `The candidates array must contain exactly ${count} items.`,
  ].join('\n')
}

function buildPrompt(b: GenerateCandidatesRequest, count: number): string {
  const area = AREA_BY_ID[b.category]
  return [
    `Life area: ${area?.label ?? b.category}${area ? ` — ${area.prompt}` : ''}`,
    `Time horizon: ${b.horizonLabel} (about ${b.horizonMonths} month${b.horizonMonths === 1 ? '' : 's'})`,
    'Their WOOP answers:',
    `- Desired outcome: ${b.woop.outcome?.trim() || '(not specified)'}`,
    `- Main obstacle: ${b.woop.obstacle?.trim() || '(not specified)'}`,
    `- Identity they want to become: ${b.woop.identity?.trim() || '(not specified)'}`,
    '',
    `Generate ${count} milestone candidates as JSON.`,
  ].join('\n')
}

// Pull the candidates array out of the model's JSON, tolerating a stray code
// fence or prose wrapper, and keep only well-formed string-four-tuples.
function parseCandidates(raw: string, count: number): Candidate[] {
  let text = raw.trim()
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) text = fence[1].trim()
  // If the model wrapped the object in prose, grab the outermost {...}.
  if (!text.startsWith('{')) {
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start !== -1 && end > start) text = text.slice(start, end + 1)
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return []
  }
  const arr = (parsed as { candidates?: unknown })?.candidates
  if (!Array.isArray(arr)) return []
  const out: Candidate[] = []
  for (const item of arr) {
    const c = item as Record<string, unknown>
    const headline = typeof c?.headline === 'string' ? c.headline.trim() : ''
    const outcome = typeof c?.outcome === 'string' ? c.outcome.trim() : ''
    const firstAction = typeof c?.firstAction === 'string' ? c.firstAction.trim() : ''
    const ifThen = typeof c?.ifThen === 'string' ? c.ifThen.trim() : ''
    if (!headline || !outcome) continue // headline + outcome are the load-bearing fields
    out.push({ id: `c${out.length + 1}`, headline, outcome, firstAction, ifThen })
  }
  return out.slice(0, count)
}

const VALID_AREAS: AreaId[] = ['career', 'health', 'relationship', 'personal', 'finance']

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as GenerateCandidatesRequest | null
  if (!body || !VALID_AREAS.includes(body.category) || !body.woop?.outcome?.trim()) {
    return NextResponse.json({ error: 'Missing category, horizon, or WOOP outcome.' }, { status: 400 })
  }

  // Mindmap is an account-bound feature — require sign-in (the UI funnel routes
  // anon users to sign-in before /new; this is the server-side backstop).
  const { userId } = await getUserTier()
  if (!userId) return NextResponse.json({ error: 'Sign in to build a mind map.' }, { status: 401 })

  // Primary areas omit count (→ 12 to curate); supporting areas pass count:3.
  const count = Math.min(MAX_COUNT, Math.max(1, Math.round(body.count ?? DEFAULT_COUNT)))
  // A full set must be usable enough to curate (≥4); a small supporting set just
  // needs to come back non-empty.
  const minNeeded = count >= 8 ? 4 : 1

  let raw: string
  try {
    raw = await generateText({
      system: buildSystem(count),
      prompt: buildPrompt(body, count),
      temperature: 0.85,
      maxTokens: 2200,
      timeoutMs: 30_000,
      json: true,
    })
  } catch (err) {
    console.error('[mindmap/generate-candidates] AI provider call failed:', err)
    return NextResponse.json(
      { error: 'Could not generate your milestones right now. Please try again.' },
      { status: 502 }
    )
  }

  const candidates = parseCandidates(raw, count)
  if (candidates.length < minNeeded) {
    console.error('[mindmap/generate-candidates] too few candidates parsed:', candidates.length, 'of', count, raw.slice(0, 300))
    return NextResponse.json(
      { error: 'The plan came back incomplete. Please try again.' },
      { status: 502 }
    )
  }

  return NextResponse.json({ candidates })
}
