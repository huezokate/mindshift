import { NextRequest, NextResponse } from 'next/server'
import { getUserTier, TIER_LIMITS } from '@/lib/user-tier'
import { getUsageToday, trackUsage } from '@/lib/usage'
import { FIGURES } from '@/lib/figures'
import { generateText } from '@/lib/ai'
import { responseLengthRule } from '@/lib/response-length'

// Shared response-shape rules appended to every figure's persona. The persona
// (brand voice) is owned per-figure in figures.ts; these rules just constrain
// length + format so Flash answers the person directly instead of drifting into
// markdown lists or 400-word essays. The length rule is dynamic (T-020-01): it
// tracks how much the user wrote. Everything else — voice, second person,
// no-markdown — is fixed.
function buildResponseRules(ventText: string): string {
  return [
    'You are responding to a real person who has just vented a personal problem to you.',
    'Speak directly to them, in second person, fully in character — never break voice.',
    responseLengthRule(ventText),
    'Plain prose only: no markdown, no bullet points, no headings, no lists, no emoji.',
    'Do not parrot their problem back or open with "It sounds like" / "I hear you".',
    'Give a genuine perspective — a reframe, a hard truth, or real encouragement — in your own voice.',
  ].join(' ')
}

export async function POST(req: NextRequest) {
  const { prompt, figureId, systemPrompt, isNewQuote } = await req.json()
  if (!prompt || !figureId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const { tier, userId } = await getUserTier()
  const limits = TIER_LIMITS[tier]

  // Anonymous limits are enforced client-side (localStorage).
  // Server enforces limits for signed-in free users.
  if (userId && tier === 'free') {
    const { quoteCount, lensCount } = await getUsageToday(userId)

    if (isNewQuote && quoteCount >= limits.quotesPerDay!) {
      return NextResponse.json(
        { error: 'Daily quote limit reached. Upgrade to Pro for unlimited access.', limitType: 'quotes', tier },
        { status: 429 }
      )
    }
    if (lensCount >= limits.lensesPerDay!) {
      return NextResponse.json(
        { error: 'Daily lens limit reached. Upgrade to Pro for unlimited access.', limitType: 'lenses', tier },
        { status: 429 }
      )
    }
  }

  // Resolve the figure's persona server-side (authoritative). Fall back to the
  // client-sent systemPrompt only if the id is unknown, then to a generic voice.
  const figure = FIGURES.find(f => f.id === figureId)
  const persona = figure?.systemPrompt ?? systemPrompt ?? 'You are a wise advisor. Respond in character.'

  let text: string
  try {
    text = await generateText({
      system: `${persona}\n\n${buildResponseRules(prompt)}`,
      prompt,
      temperature: 0.9,
      maxTokens: 400,
    })
  } catch (err) {
    // Fail loud — a blocked key / API outage must NOT be swallowed into a fake
    // response. The client shows a real error state instead of navigating on.
    console.error('[generate-response] AI provider call failed:', err)
    return NextResponse.json(
      { error: 'The lens could not respond right now. Please try again.' },
      { status: 502 }
    )
  }

  if (!text.trim()) {
    return NextResponse.json(
      { error: 'The lens came back empty. Please try again.' },
      { status: 502 }
    )
  }

  // Only count usage once we have a real response in hand.
  if (userId && tier === 'free') {
    await trackUsage(userId, !!isNewQuote)
  }

  return NextResponse.json({ response: text, tier })
}
