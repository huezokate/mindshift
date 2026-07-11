/**
 * Chat-with-the-lens client state — pure reducer helpers mirroring the web
 * ChatScreen's semantics (V200 ChatScreen.tsx + lib/chat-types.ts):
 *   • `locked` removes the composer and is set ONLY by the hard cap.
 *   • a model-signaled `done` is a SOFT close (resting point) — composer stays.
 *   • sends are optimistic; a failed send rolls the user bubble back and
 *     restores the draft.
 */

export type ChatRole = 'user' | 'lens';

export type ChatMessage = {
  id?: string; // absent for optimistic (client) messages
  role: ChatRole;
  content: string;
  turn_index: number;
  done?: boolean;
  created_at?: string;
};

export type ChatState = {
  messages: ChatMessage[];
  locked: boolean;
  pending: boolean;
  error: string | null;
};

export const initialChatState: ChatState = {
  messages: [],
  locked: false,
  pending: false,
  error: null,
};

/** Gentle invitations under the wind-down strip (web RESTING_PROMPTS). */
export const RESTING_PROMPTS = [
  'Sit with it.',
  'Meditate on that.',
  'Take some time to process.',
  'Let it settle.',
  'Carry it with you.',
];

export function historyLoaded(s: ChatState, messages: ChatMessage[], locked: boolean): ChatState {
  return { ...s, messages, locked };
}

/** Optimistic user bubble. Null when the send must be ignored (web guard). */
export function beginSend(
  s: ChatState,
  draft: string,
): { state: ChatState; userMsg: ChatMessage } | null {
  const text = draft.trim();
  if (!text || s.pending || s.locked) return null;
  const userMsg: ChatMessage = { role: 'user', content: text, turn_index: s.messages.length };
  return {
    state: { ...s, messages: [...s.messages, userMsg], pending: true, error: null },
    userMsg,
  };
}

export function replyReceived(
  s: ChatState,
  reply: { reply: string; done: boolean; capped: boolean },
): ChatState {
  const lensMsg: ChatMessage = {
    role: 'lens',
    content: reply.reply,
    turn_index: s.messages.length,
    done: reply.done,
  };
  return {
    ...s,
    messages: [...s.messages, lensMsg],
    pending: false,
    // Only the hard cap locks; `done` alone is a resting point.
    locked: s.locked || reply.capped,
  };
}

export function sendFailed(s: ChatState, userMsg: ChatMessage, message: string): ChatState {
  return {
    ...s,
    messages: s.messages.filter((m) => m !== userMsg),
    pending: false,
    error: message,
  };
}

/** Resting = the lens offered a closing thought and we're not capped. */
export function isResting(s: ChatState): boolean {
  const last = s.messages[s.messages.length - 1];
  return !s.locked && !!last && last.role === 'lens' && !!last.done;
}

/** Deterministic per-resting-point invitation (web parity — no random). */
export function restingPrompt(s: ChatState): string {
  return RESTING_PROMPTS[s.messages.length % RESTING_PROMPTS.length];
}
