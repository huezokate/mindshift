// Chat with the Lens — shared thread types + loop constants (T-020-02).
//
// A conversation is a bounded, arc-shaped back-and-forth with one figure, seeded
// by the original vent + first reframe. The lens works toward a "click" and, once
// it senses the shift has landed, gracefully closes (Approach B). Kept client-safe:
// pure types/constants, no imports, importable from both server routes and client
// components.

export type ChatRole = 'user' | 'lens'

export type ChatMessage = {
  id?: string // absent for optimistic (client) and anon (unsaved) messages
  role: ChatRole
  content: string
  turn_index: number
  done?: boolean
  created_at?: string
}

export type ChatThread = {
  sessionId: string | null // null for anon (never persisted)
  figureId: string
  messages: ChatMessage[]
  // `locked` is the ONLY state that removes the composer, and it is set solely by
  // the hard cap (a safety/cost rail). A model-signaled `done` is a *soft close* —
  // a resting point that keeps the input alive (see CHAT_DONE_TOKEN).
  locked: boolean
}

// Soft target: the lens aims to land the reframe around here and offer a closing
// thought (a "resting point"). Not enforced and NOT a lock — it's where the prompt
// starts steering toward a graceful wind-down. Kept low so the nudge lands in a
// few moves, per the product bet (a shift should land, not chat forever).
export const CHAT_SOFT_TARGET = 3

// Hard cap on USER messages. This is the one place the composer is removed — a
// safety/cost rail, not the normal way a chat ends. At the cap the reply is a
// forced graceful in-character close, never an error wall. Applies to all tiers.
export const CHAT_HARD_CAP = 20

// Trailing sentinel the model appends when it offers its closing thought. This is
// a SOFT close: parsed + stripped server-side, it marks a resting point in the
// thread and softens the UI — it does NOT end the conversation. If the user keeps
// talking, the lens keeps replying (tapering gently). Never shown to the user.
export const CHAT_DONE_TOKEN = '⟪END⟫' // ⟪END⟫
