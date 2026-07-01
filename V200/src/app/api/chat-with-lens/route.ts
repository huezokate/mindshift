import { NextRequest, NextResponse } from 'next/server'
import { getUserTier } from '@/lib/user-tier'
import { getSupabaseAdmin } from '@/lib/supabase'
import { FIGURES } from '@/lib/figures'
import { generateText, type ChatTurn } from '@/lib/ai'
import { buildChatSystem } from '@/lib/chat-prompt'
import { CHAT_DONE_TOKEN, CHAT_HARD_CAP, type ChatMessage } from '@/lib/chat-types'

// Chat with the Lens — one conversation turn (T-020-02).
//
// Bounded, arc-shaped multi-turn conversation with a figure. The seed reframe
// lives in lens_responses; the follow-up thread accretes in lens_chat_messages.
// Approach B: the model signals a graceful close via the CHAT_DONE_TOKEN sentinel,
// with a 20-user-message hard cap that forces an in-character close (never an
// error). Length per turn scales to the user's latest message (T-020-01).
//
// USAGE: a whole conversation counts as ONE lens use, already charged when the
// seed reframe was generated. This route intentionally does NOT call trackUsage
// and does NOT re-check daily limits per message. Only the hard cap applies, to
// all tiers. (Tier-gated chat depth is the S-020 follow-up — keep this isolated.)

type Body = {
  sessionId?: string | null
  figureId?: string
  ventText?: string
  seedReply?: string // the original reframe (lens_responses row) — model context
  userMessage?: string
  history?: ChatMessage[] // prior follow-up turns (anon holds its own state)
}

export async function POST(req: NextRequest) {
  const { sessionId, figureId, ventText, seedReply, userMessage, history } =
    (await req.json()) as Body

  if (!figureId || !userMessage?.trim() || !ventText?.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const figure = FIGURES.find(f => f.id === figureId)
  if (!figure) return NextResponse.json({ error: 'Unknown lens.' }, { status: 400 })

  const { userId } = await getUserTier()
  const db = getSupabaseAdmin()
  const persist = Boolean(userId && sessionId)

  // Prior user-turn count is authoritative from the DB for a persisted thread;
  // anon / unsaved threads count the user messages in the client-supplied history.
  let priorUserTurns: number
  if (persist) {
    const { count } = await db
      .from('lens_chat_messages')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', sessionId)
      .eq('user_id', userId!)
      .eq('figure_id', figureId)
      .eq('role', 'user')
    priorUserTurns = count ?? 0
  } else {
    priorUserTurns = (history ?? []).filter(m => m.role === 'user').length
  }

  const userTurnCount = priorUserTurns + 1 // ordinal of the turn being generated

  const system = buildChatSystem({
    figure,
    userTurnCount: Math.min(userTurnCount, CHAT_HARD_CAP), // cap-clause at the ceiling
    latestUserMessage: userMessage,
  })

  // Model context: original vent + seed reframe, then the follow-up thread.
  const contextTurns: ChatTurn[] = [
    { role: 'user', content: ventText! },
    ...(seedReply?.trim() ? [{ role: 'lens' as const, content: seedReply }] : []),
    ...(history ?? []).map(m => ({ role: m.role, content: m.content })),
  ]

  let raw: string
  try {
    raw = await generateText({
      system,
      messages: contextTurns,
      prompt: userMessage,
      temperature: 0.9,
      maxTokens: 400,
    })
  } catch (err) {
    // Fail loud, mirroring generate-response — never fake a reply.
    console.error('[chat-with-lens] AI provider call failed:', err)
    return NextResponse.json(
      { error: 'The lens could not respond right now. Please try again.' },
      { status: 502 }
    )
  }

  // Parse the graceful-close sentinel, then strip it so the user never sees it.
  // The hard cap forces a close even if the model omitted the token.
  const hitCap = userTurnCount >= CHAT_HARD_CAP
  const done = hitCap || raw.includes(CHAT_DONE_TOKEN)
  const reply = raw.split(CHAT_DONE_TOKEN).join('').trim()

  if (!reply) {
    return NextResponse.json(
      { error: 'The lens came back empty. Please try again.' },
      { status: 502 }
    )
  }

  // Persist the follow-up turn (signed-in with a saved session only). The seed
  // reframe is NOT stored here — it already lives in lens_responses.
  if (persist) {
    const base = priorUserTurns * 2 // 2 rows (user+lens) per prior follow-up turn
    await db.from('lens_chat_messages').insert([
      {
        session_id: sessionId,
        user_id: userId,
        figure_id: figureId,
        role: 'user',
        content: userMessage,
        turn_index: base,
        done: false,
      },
      {
        session_id: sessionId,
        user_id: userId,
        figure_id: figureId,
        role: 'lens',
        content: reply,
        turn_index: base + 1,
        done,
      },
    ])
  }

  return NextResponse.json({ reply, done, userTurnCount })
}
