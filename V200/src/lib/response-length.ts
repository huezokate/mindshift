// Dynamic response-length logic for lens responses (T-020-01).
//
// The lens's reply length should track how much the user wrote: a one-line vent
// earns a punchy reframe, a paragraph-long unload earns a fuller response. This
// module turns a vent's character length into a word-count *target* and the rule
// sentence spliced into the response prompt. Length is guidance to the model —
// never a hard truncation.
//
// Keep this module client-safe: no server-only top-level imports. It is imported
// by the generate-response route today and reused per chat turn by Chat with the
// Lens (T-020-02), which may run from a client turn-composer.

// Clamp bounds — the hard [floor, ceiling] on the word target (the T-020-01
// contract). Exported so callers (and T-020-02) can reason about the range.
export const LENGTH_FLOOR_WORDS = 40
export const LENGTH_CEIL_WORDS = 160

// Endpoints of the linear char→word map. 120 chars → 40 words (a terse vent);
// 800 chars (the vent input max) → 150 words. Between them, interpolate.
const MIN_CHARS = 120
const MAX_CHARS = 800
const MIN_TARGET = 40
const MAX_TARGET = 150

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n))
}

/**
 * Word-count target for a lens response, derived from how much the user wrote.
 * Linear between (120 chars → 40 words) and (800 chars → 150 words), clamped to
 * [40, 160] and rounded. This is soft guidance for the model, not a limit.
 */
export function targetWordCount(ventText: string): number {
  const chars = ventText.trim().length
  const raw =
    MIN_TARGET + ((chars - MIN_CHARS) / (MAX_CHARS - MIN_CHARS)) * (MAX_TARGET - MIN_TARGET)
  return Math.round(clamp(raw, LENGTH_FLOOR_WORDS, LENGTH_CEIL_WORDS))
}

// Paragraph-shape hint scaled to the target, so a 40-word floor response isn't
// told to write "2-3 paragraphs."
function paragraphShape(target: number): string {
  if (target <= 60) return 'one tight paragraph'
  if (target <= 110) return '1–2 short paragraphs'
  return '2–3 short paragraphs'
}

/**
 * The single response-rule sentence carrying the dynamic length + paragraph
 * shape, e.g. "Keep it to roughly 40 words (one tight paragraph)." Spliced into
 * the response rules by the generate-response route; reusable per chat turn.
 */
export function responseLengthRule(ventText: string): string {
  const target = targetWordCount(ventText)
  return `Keep it to roughly ${target} words (${paragraphShape(target)}).`
}
