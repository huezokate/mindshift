/**
 * Anonymous rate-limit rules, ported verbatim from the web
 * (V200/src/app/app/lens/page.tsx checkAnonLimits/trackAnonLens).
 *
 * The server does NOT rate-limit anonymous callers — this client-side gate is
 * the only thing standing between an anon user and unlimited generation, same
 * as the web's localStorage gate. Rules: 1 vent per day, 3 lenses per vent.
 *
 * Pure functions over an AnonLimits snapshot; persistence lives in
 * anon-limits.ts.
 */

export type AnonLimits = {
  /** YYYY-MM-DD the counters belong to. */
  date: string;
  /** Identity of the day's vent: its first 100 chars (web parity). */
  ventKey: string;
  /** Lenses applied to that vent so far. */
  lensCount: number;
};

export type AnonLimitKind = 'vents' | 'lenses';

export const ANON_LENSES_PER_VENT = 3;

export function todayKey(now: Date = new Date()): string {
  return now.toISOString().split('T')[0];
}

export function ventKeyOf(ventText: string): string {
  return ventText.slice(0, 100);
}

/** 'vents' = daily vent limit hit, 'lenses' = per-vent lens limit hit, null = OK. */
export function checkAnonLimits(
  state: AnonLimits | null,
  today: string,
  ventText: string,
): AnonLimitKind | null {
  if (!state || state.date !== today) return null; // new day — reset happens on track
  if (state.ventKey === ventKeyOf(ventText)) {
    return state.lensCount >= ANON_LENSES_PER_VENT ? 'lenses' : null;
  }
  if (state.ventKey) return 'vents'; // different vent, same day
  return null; // first vent of the day
}

/** Next state after a successful lens generation. */
export function trackAnonLens(
  state: AnonLimits | null,
  today: string,
  ventText: string,
): AnonLimits {
  const ventKey = ventKeyOf(ventText);
  const isNewVent = !state || state.date !== today || state.ventKey !== ventKey;
  return {
    date: today,
    ventKey,
    lensCount: isNewVent ? 1 : state.lensCount + 1,
  };
}

/** Validate a stored JSON blob; anything malformed → null (treated as fresh). */
export function parseAnonLimits(raw: string | null): AnonLimits | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Partial<AnonLimits>;
    if (
      typeof v.date === 'string' &&
      typeof v.ventKey === 'string' &&
      typeof v.lensCount === 'number'
    ) {
      return { date: v.date, ventKey: v.ventKey, lensCount: v.lensCount };
    }
  } catch {
    // fall through
  }
  return null;
}
