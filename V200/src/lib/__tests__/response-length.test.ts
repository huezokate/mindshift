// Unit coverage for the dynamic response-length map (T-025-03).
//
// response-length.ts turns a vent's character length into a word-count *target* and
// the rule sentence spliced into the response/chat prompt. It is pure and
// deterministic — the linear char→word map, the [40,160] clamp, and the paragraph
// shape are exactly the kind of thresholds a future edit could silently move. These
// tests lock the boundary values (verified against the running module) so any drift
// turns red. String/number contracts only — never model output.
import { describe, it, expect } from 'vitest'
import {
  targetWordCount,
  responseLengthRule,
  LENGTH_FLOOR_WORDS,
  LENGTH_CEIL_WORDS,
} from '../response-length'

// A vent of exactly n characters.
const chars = (n: number) => 'x'.repeat(n)

describe('targetWordCount', () => {
  it('floors short and empty vents at LENGTH_FLOOR_WORDS', () => {
    // Below/at the 120-char lower map endpoint the target saturates at the floor.
    expect(targetWordCount('')).toBe(LENGTH_FLOOR_WORDS) // 40
    expect(targetWordCount('ok')).toBe(LENGTH_FLOOR_WORDS)
    expect(targetWordCount(chars(120))).toBe(LENGTH_FLOOR_WORDS)
  })

  it('reaches 150 words at the 800-char upper map endpoint', () => {
    // 800 chars is the vent input max and the MAX_TARGET endpoint of the map.
    expect(targetWordCount(chars(800))).toBe(150)
  })

  it('clamps to LENGTH_CEIL_WORDS above the map endpoint', () => {
    // The 160 ceiling sits ABOVE the 150 map endpoint, so it is only reachable for
    // ~800–862+ char inputs — the non-obvious branch. It must saturate, not overflow.
    expect(targetWordCount(chars(862))).toBe(LENGTH_CEIL_WORDS) // 160
    expect(targetWordCount(chars(2000))).toBe(LENGTH_CEIL_WORDS)
  })

  it('interpolates linearly between the endpoints', () => {
    // Locks the slope + rounding of the char→word map at two interior points.
    expect(targetWordCount(chars(244))).toBe(60)
    expect(targetWordCount(chars(460))).toBe(95)
  })

  it('trims leading/trailing whitespace before measuring', () => {
    // Padding must not inflate the char count into a larger target.
    expect(targetWordCount(`   ${chars(120)}   `)).toBe(LENGTH_FLOOR_WORDS)
  })

  it('stays within [floor, ceil] for arbitrary inputs', () => {
    for (const n of [0, 50, 300, 5000]) {
      const t = targetWordCount(chars(n))
      expect(t).toBeGreaterThanOrEqual(LENGTH_FLOOR_WORDS)
      expect(t).toBeLessThanOrEqual(LENGTH_CEIL_WORDS)
    }
  })
})

describe('responseLengthRule', () => {
  it('renders the exact template at the floor', () => {
    expect(responseLengthRule('ok')).toBe(
      'Keep it to roughly 40 words (one tight paragraph).',
    )
  })

  it('scales the paragraph shape with the target', () => {
    // ≤60 → tight, ≤110 → 1–2, otherwise 2–3. One vent per tier.
    expect(responseLengthRule('ok')).toContain('one tight paragraph') // target 40
    expect(responseLengthRule(chars(460))).toContain('1–2 short paragraphs') // target 95
    expect(responseLengthRule(chars(800))).toContain('2–3 short paragraphs') // target 150
  })

  it('embeds the numeric target from targetWordCount', () => {
    const vent = chars(460)
    expect(responseLengthRule(vent)).toContain(String(targetWordCount(vent)))
    expect(responseLengthRule(vent)).toContain('words')
  })
})
