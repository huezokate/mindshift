// Weekly-goal generation for the Sunday reminder loop.
//
// Each Sunday the cron asks Groq for ONE concrete goal per area for the upcoming
// week, given the user's plan for that area + (when present) their last
// reflection. Small enough to finish in a week, a clear step toward the bigger
// outcome. Plain text, one sentence — the email renders it per area.

import { generateText } from '@/lib/ai'

// Rough number of weeks in a horizon, used only to give the model pacing
// ("week X of N"). Custom horizons derive from the target date.
export function weeksForHorizon(horizonLabel: string, createdAt: string, horizonDate: string | null): number {
  const byLabel: Record<string, number> = {
    'A month': 4,
    'A quarter': 13,
    'A year': 52,
    '5 years': 260,
  }
  if (byLabel[horizonLabel]) return byLabel[horizonLabel]
  if (horizonDate) {
    const ms = new Date(horizonDate).getTime() - new Date(createdAt).getTime()
    const wk = Math.round(ms / (7 * 24 * 60 * 60 * 1000))
    if (Number.isFinite(wk) && wk > 0) return wk
  }
  return 4
}

export type WeeklyGoalInput = {
  areaLabel: string
  outcome: string // the area's WOOP desired outcome
  identity: string | null // "someone who…"
  milestones: { headline?: string | null; outcome: string }[]
  weekIndex: number
  totalWeeks: number
  lastReflection?: string | null // free text from the previous /reflect, if any
}

const SYSTEM = [
  'You are a weekly planning coach for Minds Shift.',
  'Given a person\'s goal for one life area and where they are in their plan, write ONE concrete goal for THIS WEEK.',
  'It must be small enough to finish in a week, a clear step toward the bigger outcome, and specific (numbers/cadence where natural).',
  'If a reflection from last week is provided, RESPOND to it — build on what went well, and adjust for what got in the way.',
  'Voice: warm, direct, second person, ONE sentence under ~25 words. No markdown, no emoji, no preamble. Start with a verb where natural.',
  'Return only the sentence — nothing else.',
].join('\n')

export async function generateWeeklyGoal(input: WeeklyGoalInput): Promise<string> {
  const milestones = input.milestones
    .slice(0, 6)
    .map(m => `- ${m.headline ? `${m.headline}: ` : ''}${m.outcome}`)
    .join('\n')

  const prompt = [
    `Life area: ${input.areaLabel}`,
    `Their desired outcome: ${input.outcome}`,
    input.identity ? `Who they're becoming: someone who ${input.identity}` : '',
    `This is week ${input.weekIndex} of ${input.totalWeeks}.`,
    '',
    'Milestones on their plan for this area:',
    milestones || '(none listed)',
    '',
    input.lastReflection?.trim()
      ? `Their reflection on last week:\n${input.lastReflection.trim()}`
      : 'No reflection from last week (this may be their first week).',
    '',
    'Write this week\'s goal for this area as a single sentence.',
  ]
    .filter(Boolean)
    .join('\n')

  const text = await generateText({
    system: SYSTEM,
    prompt,
    temperature: 0.8,
    maxTokens: 120,
    timeoutMs: 20_000,
  })
  // Strip stray quotes/whitespace; keep to a single line.
  return text.trim().replace(/^["'\s]+|["'\s]+$/g, '').split('\n')[0].trim()
}
