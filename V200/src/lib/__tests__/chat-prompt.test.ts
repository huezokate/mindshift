// Unit coverage for the chat prompt-shaping helpers (T-025-02).
//
// chat-prompt.ts is pure and deterministic and encodes the trickiest guarantees of
// Chat with the Lens: the quote-escalation curve, the graceful-close nudge, the
// `done` sentinel, and the anti-fabrication guard. These tests assert the *string
// contracts* of the injected clauses (presence/shape) — never model output.
import { describe, it, expect } from 'vitest'
import {
  buildChatSystem,
  chatControlRules,
  closingClause,
  quoteEscalationClause,
} from '../chat-prompt'
import { CHAT_DONE_TOKEN, CHAT_HARD_CAP, CHAT_SOFT_TARGET } from '../chat-types'
import { responseLengthRule } from '../response-length'
import type { Figure } from '../figures'

// A minimal fixture with KNOWN name/quote so interpolation is assertable against
// fixed strings — decoupled from copy changes in the real FIGURES array.
const fig: Figure = {
  id: 'test',
  name: 'Test Figure',
  descriptor: 'descriptor',
  era: 'era',
  quote: 'A known quote.',
  bio: 'bio',
  imgKawaii: '',
  imgCyberpunk: '',
  imgNotepad: '',
  systemPrompt: 'PERSONA_MARKER persona text.',
}

const ANTI_FAB = 'Never invent'

describe('quoteEscalationClause', () => {
  it('is empty in the opening turns (≤2)', () => {
    expect(quoteEscalationClause(1, fig)).toBe('')
    expect(quoteEscalationClause(2, fig)).toBe('')
  })

  it('deepens at turns 3–4 without injecting a quote', () => {
    for (const turn of [3, 4]) {
      const clause = quoteEscalationClause(turn, fig)
      expect(clause).toContain(fig.name)
      expect(clause).toContain(ANTI_FAB)
      // The deepen stage references views, not a hard-anchored quotation.
      expect(clause).not.toContain(`"${fig.quote}"`)
    }
  })

  it('anchors at turns 5+ and injects the canonical quote', () => {
    for (const turn of [5, 6]) {
      const clause = quoteEscalationClause(turn, fig)
      expect(clause).toContain(`"${fig.quote}"`)
      expect(clause).toContain(fig.name)
    }
  })

  it('carries the anti-fabrication guard at every non-empty stage', () => {
    for (const turn of [3, 4, 5, 6]) {
      expect(quoteEscalationClause(turn, fig)).toContain(ANTI_FAB)
    }
  })
})

describe('closingClause', () => {
  it('is empty before the soft target (turn 2)', () => {
    expect(closingClause(2)).toBe('')
  })

  it('offers a resting point at the soft target and references the done token', () => {
    const clause = closingClause(CHAT_SOFT_TARGET) // turn 3
    expect(clause).toContain('resting point')
    expect(clause).toContain(CHAT_DONE_TOKEN)
    expect(clause).not.toContain('final message')
  })

  it('still offers a soft close at the named soft threshold (turn 8)', () => {
    const clause = closingClause(8)
    expect(clause).toContain(CHAT_DONE_TOKEN)
    expect(clause).not.toContain('final message')
  })

  it('does not taper before SOFT_TARGET+2 (turn 4) but does at/after it (turn 5)', () => {
    expect(closingClause(4)).not.toContain('short and unhurried')
    expect(closingClause(CHAT_SOFT_TARGET + 2)).toContain('short and unhurried') // turn 5
  })

  it('is still a soft close just below the hard cap (turn 19)', () => {
    const clause = closingClause(CHAT_HARD_CAP - 1)
    expect(clause).not.toContain('final message')
    expect(clause).toContain(CHAT_DONE_TOKEN)
  })

  it('forces a warm final close at the hard cap (turn 20)', () => {
    const clause = closingClause(CHAT_HARD_CAP)
    expect(clause).toContain('final message')
    expect(clause).toContain(CHAT_DONE_TOKEN)
    // The hard-cap branch is checked first, so it must NOT be the soft resting-point text.
    expect(clause).not.toContain('resting point')
  })
})

describe('chatControlRules', () => {
  const rules = chatControlRules()

  it('includes the done-sentinel instruction', () => {
    expect(rules).toContain(CHAT_DONE_TOKEN)
  })

  it('enforces plain prose (no markdown)', () => {
    expect(rules).toContain('plain prose only')
  })

  it('forbids guilt-tripping closes', () => {
    expect(rules).toContain('before you go')
  })
})

describe('buildChatSystem', () => {
  it('always includes the persona and control rules', () => {
    const sys = buildChatSystem({ figure: fig, userTurnCount: 1, latestUserMessage: 'hi' })
    expect(sys).toContain('PERSONA_MARKER')
    expect(sys).toContain(CHAT_DONE_TOKEN) // from chatControlRules
  })

  it('omits escalation and closing clauses on the opening turn', () => {
    const sys = buildChatSystem({ figure: fig, userTurnCount: 1, latestUserMessage: 'hi' })
    expect(sys).not.toContain(ANTI_FAB) // anti-fab lives only in the escalation clause
    expect(sys).not.toContain('final message')
    // 'hand it back to them' is unique to the soft closing clause (unlike 'resting
    // point', which also appears in the always-present control rules).
    expect(sys).not.toContain('hand it back to them')
  })

  it('includes the escalation and closing clauses at a deep turn', () => {
    const sys = buildChatSystem({ figure: fig, userTurnCount: 5, latestUserMessage: 'hi' })
    expect(sys).toContain(`"${fig.quote}"`) // anchor stage
    expect(sys).toContain('hand it back to them') // soft close (unique to closingClause)
  })

  it('wires the length rule against the LATEST user message', () => {
    const short = 'ok'
    const long = 'x'.repeat(800)
    const shortSys = buildChatSystem({ figure: fig, userTurnCount: 1, latestUserMessage: short })
    const longSys = buildChatSystem({ figure: fig, userTurnCount: 1, latestUserMessage: long })

    // Each assembled prompt carries exactly the length rule for its own latest message.
    expect(shortSys).toContain(responseLengthRule(short))
    expect(longSys).toContain(responseLengthRule(long))
    // A longer message earns a longer target, so the two rules must differ.
    expect(responseLengthRule(short)).not.toBe(responseLengthRule(long))
  })

  it('joins non-empty sections with a blank line', () => {
    const sys = buildChatSystem({ figure: fig, userTurnCount: 5, latestUserMessage: 'hi' })
    expect(sys).toContain('\n\n')
  })
})
