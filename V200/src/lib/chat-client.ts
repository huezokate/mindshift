// Chat with the Lens — browser-side thread driver (T-020-02).
//
// Analogous to add-lens.ts: send one user turn to /api/chat-with-lens, surface
// errors as thrown Error(message). Also holds the anon ephemeral-thread helpers
// (sessionStorage) — anon conversations are not persisted server-side, consistent
// with the anon "screenshot" free tier.

import type { ChatMessage } from './chat-types'

/**
 * Send one user turn. Returns the lens reply, whether the thread closed, and the
 * new user-turn count. Throws on limit/generation/network failure (caller surfaces).
 */
export async function sendChatTurn(opts: {
  sessionId: string | null
  figureId: string
  ventText: string
  seedReply: string
  userMessage: string
  history: ChatMessage[]
}): Promise<{ reply: string; done: boolean; userTurnCount: number }> {
  let res: Response
  try {
    res = await fetch('/api/chat-with-lens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: opts.sessionId,
        figureId: opts.figureId,
        ventText: opts.ventText,
        seedReply: opts.seedReply,
        userMessage: opts.userMessage,
        history: opts.history,
      }),
    })
  } catch {
    throw new Error('Could not reach the lens. Check your connection and try again.')
  }

  if (!res.ok) {
    const d = await res.json().catch(() => ({}))
    throw new Error(d.error ?? 'The lens could not respond right now.')
  }

  const data = await res.json()
  const reply = (data.reply ?? '').trim()
  if (!reply) throw new Error('The lens came back empty. Please try again.')
  return { reply, done: !!data.done, userTurnCount: data.userTurnCount ?? 0 }
}

// ── Anon ephemeral thread (sessionStorage) ──────────────────────────────────
// Keyed per figure so a reload survives; cleared naturally when the tab closes.

const anonKey = (figureId: string) => `ms_chat_${figureId}`

export function loadAnonThread(figureId: string): ChatMessage[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = sessionStorage.getItem(anonKey(figureId))
    return raw ? (JSON.parse(raw) as ChatMessage[]) : []
  } catch {
    return []
  }
}

export function saveAnonThread(figureId: string, msgs: ChatMessage[]): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(anonKey(figureId), JSON.stringify(msgs))
  } catch {
    /* quota / private mode — ephemeral anyway, ignore */
  }
}
