/** One tick of the typewriter reveal. Pure — the hook lives in use-typewriter. */
export function typeStep(text: string, i: number): { next: number; done: boolean } {
  const next = Math.min(i + 1, text.length);
  return { next, done: next >= text.length };
}

/** Web reveal cadence: 18ms/char (V200 response page). */
export const TYPE_INTERVAL_MS = 18;
