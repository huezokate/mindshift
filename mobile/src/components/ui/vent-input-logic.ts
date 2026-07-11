import type { Theme } from '@/theme';

/** Char-counter color: flips to the theme pink past the warn threshold
    (web onboarding: `text.length > 700 ? var(--pink) : var(--text-sub)`). */
export function counterColor(t: Theme, length: number, warnAt: number): string {
  return length > warnAt ? t.palette.pink : t.text.sub;
}
