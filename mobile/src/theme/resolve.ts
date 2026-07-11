import type { Side, TokenVar } from './types';

/** Overlay a skin's overrides on the cyberpunk base — the CSS cascade, precomputed. */
export function mergeVars(
  base: Record<TokenVar, string>,
  override: Partial<Record<TokenVar, string>>,
): Record<TokenVar, string> {
  return { ...base, ...override };
}

const VAR_REF = /var\((--[\w-]+)\)/g;

/**
 * Substitute var() references until none remain. Use-site semantics: refs
 * resolve against the *merged* map, so e.g. cyberpunk's
 * `--node-relationships-border: var(--cyan)` yields kawaii's magenta under the
 * kawaii merge — matching the browser. Order-independent (the CSS has forward
 * refs and chains); throws on unknown names or cycles so a transcription typo
 * fails at module load, not silently on-screen.
 */
export function resolveVars(map: Record<TokenVar, string>): Record<TokenVar, string> {
  const out = { ...map };
  for (let rounds = 0; ; rounds++) {
    if (rounds > 16) throw new Error('resolveVars: var() reference cycle');
    let changed = false;
    for (const key of Object.keys(out) as TokenVar[]) {
      out[key] = out[key].replace(VAR_REF, (_, ref: string) => {
        const value = out[ref as TokenVar];
        if (value === undefined) throw new Error(`resolveVars: unknown reference ${ref} in ${key}`);
        changed = true;
        return value;
      });
    }
    if (!changed) return out;
  }
}

/** `4px solid #hex` / `1.5px solid rgba(...)` → Side; `none` → null. */
export function parseSide(value: string): Side {
  if (value === 'none') return null;
  const m = value.match(/^(-?\d*\.?\d+)px solid (.+)$/);
  if (!m) throw new Error(`parseSide: unparseable border "${value}"`);
  return { width: parseFloat(m[1]), color: m[2] };
}

/** `16px` / `-1px` / `1.44px` / unitless `0` → number. */
export function parsePx(value: string): number {
  const m = value.match(/^(-?\d*\.?\d+)(px)?$/);
  if (!m) throw new Error(`parsePx: unparseable length "${value}"`);
  return parseFloat(m[1]);
}

/** `16px 24px` → { v, h }. */
export function parsePadding(value: string): { v: number; h: number } {
  const parts = value.split(' ');
  if (parts.length !== 2) throw new Error(`parsePadding: unparseable padding "${value}"`);
  return { v: parsePx(parts[0]), h: parsePx(parts[1]) };
}

/** Shadows/filters pass through as RN strings; CSS `none` becomes undefined. */
export function noneToUndefined(value: string): string | undefined {
  return value === 'none' ? undefined : value;
}
