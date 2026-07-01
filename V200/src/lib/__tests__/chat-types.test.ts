// Pins the Chat-with-the-Lens loop constants (T-025-02). These values are the
// contract the escalation/closing curve in chat-prompt.ts is built around; a silent
// change here would shift chat behavior without any signal. Making them a red test
// forces the change to be intentional.
import { describe, it, expect } from 'vitest'
import { CHAT_SOFT_TARGET, CHAT_HARD_CAP, CHAT_DONE_TOKEN } from '../chat-types'

describe('chat-types constants', () => {
  it('keeps the soft target at 3 (where the wind-down begins)', () => {
    expect(CHAT_SOFT_TARGET).toBe(3)
  })

  it('keeps the hard cap at 20 (the one place the composer is removed)', () => {
    expect(CHAT_HARD_CAP).toBe(20)
  })

  it('keeps the done sentinel as the ⟪END⟫ token', () => {
    expect(CHAT_DONE_TOKEN).toBe('⟪END⟫')
  })

  it('orders the thresholds so the soft target precedes the hard cap', () => {
    expect(CHAT_SOFT_TARGET).toBeLessThan(CHAT_HARD_CAP)
  })
})
