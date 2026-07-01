// Chat with the Lens — per-turn system-prompt shaping (T-020-02).
//
// Turns the running user-turn count into the adjustments spliced onto a figure's
// persona: the quote-escalation curve (the deeper the talk, the more the lens
// speaks through the figure's real, attributable quotes), the graceful-close
// nudge, the `done` sentinel instruction, and the anti-fabrication guard. Per-turn
// length reuses T-020-01's helper against the user's LATEST message.
//
// Pure + client-safe: no I/O, no server-only imports. Deterministic — this is the
// highest-value unit-test surface for the ticket's trickiest behavior.

import type { Figure } from './figures'
import { responseLengthRule } from './response-length'
import { CHAT_DONE_TOKEN, CHAT_HARD_CAP, CHAT_SOFT_NUDGE } from './chat-types'

// Never invent a quotation. Present at every escalation stage.
const ANTI_FABRICATION =
  'Never invent or fabricate a quotation. If no real, attributable quote of yours ' +
  'fits, paraphrase your documented views and attribute them honestly as your own outlook.'

/**
 * Quote-escalation clause by user-turn count (Design Decision 3 curve):
 *  - turns 1–2 (open):   conversational, no clause.
 *  - turns 3–4 (deepen): weave in the figure's documented views.
 *  - turns 5+ (anchor):  anchor the reply in an actual attributable quote,
 *                        with the figure's canonical quote injected as a known
 *                        good anchor so the model never has to invent one.
 * Every non-empty stage carries the anti-fabrication guard.
 */
export function quoteEscalationClause(userTurnCount: number, figure: Figure): string {
  if (userTurnCount <= 2) return ''
  if (userTurnCount <= 4) {
    return (
      `Begin weaving in ${figure.name}'s documented views and outlook — reference how ` +
      `they actually thought about matters like this. ${ANTI_FABRICATION}`
    )
  }
  return (
    `Anchor your reply in an actual, attributable quote of ${figure.name} and build ` +
    `the reframe from it. One quote you are known for: "${figure.quote}". ` +
    `${ANTI_FABRICATION}`
  )
}

/**
 * Graceful-close clause. Empty until the soft nudge threshold; a gentle wrap-up
 * cue from then on; a hard, in-character close at the cap. Never produces an
 * error-flavored instruction — always a warm final reframe.
 */
export function closingClause(userTurnCount: number): string {
  if (userTurnCount >= CHAT_HARD_CAP) {
    return (
      'This is the final message of the conversation. Offer a warm, in-character ' +
      'closing reframe that lets the person walk away with the shift — never mention ' +
      `limits or endings mechanically. End your reply with ${CHAT_DONE_TOKEN}.`
    )
  }
  if (userTurnCount >= CHAT_SOFT_NUDGE) {
    return (
      'The conversation has gone deep. Unless the person clearly needs more, begin ' +
      'guiding it toward a close: offer your closing thought and land the reframe.'
    )
  }
  return ''
}

/**
 * The `done` sentinel instruction — how the lens signals it has landed the reframe
 * and is closing (Approach B). Parsed + stripped server-side.
 */
export function chatControlRules(): string {
  return (
    'You are having a short, bounded conversation — you aim to land a genuine ' +
    'perspective shift within a few exchanges, not to chat forever. When, and only ' +
    'when, the reframe has landed and you are offering your closing thought, end ' +
    `your entire reply with the token ${CHAT_DONE_TOKEN} on its own. Otherwise never ` +
    'write that token. Stay fully in character; plain prose only — no markdown, ' +
    'lists, headings, or emoji.'
  )
}

/**
 * Assemble the full per-turn system prompt: persona + control rules + quote
 * escalation + closing cue + per-turn length (scaled to the latest user message).
 * `userTurnCount` is the ordinal of the turn being generated (prior user turns + 1).
 */
export function buildChatSystem(opts: {
  figure: Figure
  userTurnCount: number
  latestUserMessage: string
}): string {
  const { figure, userTurnCount, latestUserMessage } = opts
  return [
    figure.systemPrompt,
    chatControlRules(),
    quoteEscalationClause(userTurnCount, figure),
    closingClause(userTurnCount),
    responseLengthRule(latestUserMessage),
  ]
    .filter(Boolean)
    .join('\n\n')
}
