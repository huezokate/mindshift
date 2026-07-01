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
  closed: boolean // true once a done message arrives or the hard cap is hit
}

// Soft target: the lens aims to land the reframe around here and offer a closing
// thought. Not enforced — it's what the prompt steers toward.
export const CHAT_SOFT_TARGET = 5

// Hard cap on USER messages. At the cap the reply is a forced graceful close,
// never an error wall. Applies to all tiers in v1.
export const CHAT_HARD_CAP = 20

// After this many user messages, the system prompt starts nudging toward a close
// so long threads always converge even if the model never volunteers the sentinel.
export const CHAT_SOFT_NUDGE = 8

// Trailing sentinel the model appends to its final reply when the reframe has
// landed. Parsed + stripped server-side; never shown to the user.
export const CHAT_DONE_TOKEN = '⟪END⟫' // ⟪END⟫
