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

  // For a persisted thread the DB is authoritative for BOTH the prior turns
  // (context replayed to the model) and the next turn_index — never trust the
  // client's optimistic history, which can drift from what actually saved. Anon /
  // unsaved threads rely on the client-supplied history (their only state).
  let priorUserTurns: number
  let priorRows = 0 // total persisted rows so far → next turn_index base
  let priorTurns: ChatMessage[]
  if (persist) {
    const { data } = await db
      .from('lens_chat_messages')
      .select('role, content, turn_index')
      .eq('session_id', sessionId)
      .eq('user_id', userId!)
      .eq('figure_id', figureId)
      .order('turn_index', { ascending: true })
    priorTurns = (data ?? []) as ChatMessage[]
    priorRows = priorTurns.length
    priorUserTurns = priorTurns.filter(m => m.role === 'user').length
  } else {
    priorTurns = history ?? []
    priorUserTurns = priorTurns.filter(m => m.role === 'user').length
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
    ...priorTurns.map(m => ({ role: m.role, content: m.content })),
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

  // Parse the resting-point sentinel, then strip it so the user never sees it.
  // `done` is a SOFT close (a resting point that keeps the composer alive);
  // `capped` is the hard rail that actually locks the thread. The cap forces both
  // even if the model omitted the token.
  const capped = userTurnCount >= CHAT_HARD_CAP
  const done = capped || raw.includes(CHAT_DONE_TOKEN)
  const reply = raw.split(CHAT_DONE_TOKEN).join('').trim()

  if (!reply) {
    return NextResponse.json(
      { error: 'The lens came back empty. Please try again.' },
      { status: 502 }
    )
  }

  // Persist the follow-up turn (signed-in with a saved session only). The seed
  // reframe is NOT stored here — it already lives in lens_responses. turn_index
  // continues from the actual row count so concurrent/retried turns can't collide.
  if (persist) {
    const { error: insertErr } = await db.from('lens_chat_messages').insert([
      {
        session_id: sessionId,
        user_id: userId,
        figure_id: figureId,
        role: 'user',
        content: userMessage,
        turn_index: priorRows,
        done: false,
      },
      {
        session_id: sessionId,
        user_id: userId,
        figure_id: figureId,
        role: 'lens',
        content: reply,
        turn_index: priorRows + 1,
        done,
      },
    ])
    // Don't fail the turn on a save miss (the reply is already in the user's
    // hands), but surface it — a silent failure here reads as "persisted" when it
    // wasn't (e.g. migration 007 not yet applied).
    if (insertErr) {
      console.error('[chat-with-lens] failed to persist turn:', insertErr.message)
    }
  }

  return NextResponse.json({ reply, done, capped, userTurnCount })
}
