/**
 * Narrow CSS linear-gradient parser for the token layer's raw gradient
 * strings (`--fig-avatar-grad`), shaped for expo-linear-gradient:
 * `linear-gradient(<angle>deg, <color> [<pct>%], <color> [<pct>%], ...)`.
 * Colors may be hex or rgba()/rgb(). Returns null on anything else — callers
 * should fall back to a flat fill.
 */

export interface ParsedGradient {
  colors: [string, string, ...string[]];
  /** Stop positions 0..1 (aligned with colors) or undefined = even spread. */
  locations?: number[];
  start: { x: number; y: number };
  end: { x: number; y: number };
}

/** Split on commas that aren't inside parentheses (rgba(...) safe). */
function splitTopLevel(s: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

export function parseLinearGradient(css: string): ParsedGradient | null {
  const m = /^linear-gradient\((.*)\)$/s.exec(css.trim());
  if (!m) return null;
  const parts = splitTopLevel(m[1]);
  if (parts.length < 3) return null;

  const angleMatch = /^(-?\d+(?:\.\d+)?)deg$/.exec(parts[0]);
  if (!angleMatch) return null;
  const angle = (parseFloat(angleMatch[1]) * Math.PI) / 180;

  const colors: string[] = [];
  const locations: number[] = [];
  let hasLocations = true;
  for (const stop of parts.slice(1)) {
    const stopMatch = /^(.*?)(?:\s+(-?\d+(?:\.\d+)?)%)?$/s.exec(stop);
    if (!stopMatch || !stopMatch[1]) return null;
    colors.push(stopMatch[1].trim());
    if (stopMatch[2] == null) hasLocations = false;
    else locations.push(parseFloat(stopMatch[2]) / 100);
  }
  if (colors.length < 2) return null;

  // CSS: 0deg = to top, clockwise; screen y grows down. On the unit square the
  // gradient line spans |sin|+|cos|, so scaling by it puts 135deg exactly
  // corner-to-corner — matching how CSS covers the box.
  const ux = Math.sin(angle);
  const uy = -Math.cos(angle);
  const len = Math.abs(ux) + Math.abs(uy);
  const start = { x: 0.5 - (ux * len) / 2, y: 0.5 - (uy * len) / 2 };
  const end = { x: 0.5 + (ux * len) / 2, y: 0.5 + (uy * len) / 2 };

  return {
    colors: colors as ParsedGradient['colors'],
    locations: hasLocations && locations.length === colors.length ? locations : undefined,
    start,
    end,
  };
}
