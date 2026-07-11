import { describe, expect, it } from 'vitest';

import {
  beginSend,
  historyLoaded,
  initialChatState,
  isResting,
  replyReceived,
  restingPrompt,
  RESTING_PROMPTS,
  sendFailed,
} from '@/lib/chat-logic';

describe('chat reducer', () => {
  it('loads history with the lock flag', () => {
    const s = historyLoaded(
      initialChatState,
      [{ role: 'user', content: 'hi', turn_index: 0 }],
      true,
    );
    expect(s.messages).toHaveLength(1);
    expect(s.locked).toBe(true);
  });

  it('beginSend appends an optimistic user bubble with the next turn_index', () => {
    const r = beginSend(initialChatState, '  hello  ');
    expect(r).not.toBeNull();
    expect(r!.userMsg).toEqual({ role: 'user', content: 'hello', turn_index: 0 });
    expect(r!.state.pending).toBe(true);
    expect(r!.state.messages).toEqual([r!.userMsg]);
  });

  it('beginSend refuses empty, pending, and locked states (web guard)', () => {
    expect(beginSend(initialChatState, '   ')).toBeNull();
    expect(beginSend({ ...initialChatState, pending: true }, 'x')).toBeNull();
    expect(beginSend({ ...initialChatState, locked: true }, 'x')).toBeNull();
  });

  it('replyReceived appends the lens turn; done alone does NOT lock', () => {
    const { state } = beginSend(initialChatState, 'hello')!;
    const s = replyReceived(state, { reply: 'a thought', done: true, capped: false });
    expect(s.messages).toHaveLength(2);
    expect(s.messages[1]).toMatchObject({ role: 'lens', turn_index: 1, done: true });
    expect(s.locked).toBe(false);
    expect(s.pending).toBe(false);
    expect(isResting(s)).toBe(true);
  });

  it('capped locks the thread (the only lock source)', () => {
    const { state } = beginSend(initialChatState, 'hello')!;
    const s = replyReceived(state, { reply: 'the close', done: true, capped: true });
    expect(s.locked).toBe(true);
    expect(isResting(s)).toBe(false); // locked ≠ resting
  });

  it('sendFailed rolls back the optimistic bubble and surfaces the error', () => {
    const { state, userMsg } = beginSend(initialChatState, 'hello')!;
    const s = sendFailed(state, userMsg, 'The lens could not respond.');
    expect(s.messages).toHaveLength(0);
    expect(s.pending).toBe(false);
    expect(s.error).toBe('The lens could not respond.');
  });

  it('restingPrompt rotates deterministically with thread length', () => {
    const { state } = beginSend(initialChatState, 'hello')!;
    const s = replyReceived(state, { reply: 'r', done: true, capped: false });
    expect(restingPrompt(s)).toBe(RESTING_PROMPTS[2 % RESTING_PROMPTS.length]);
  });
});
