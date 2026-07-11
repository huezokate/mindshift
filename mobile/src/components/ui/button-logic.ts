import type { ButtonFamily, Theme } from '@/theme';

/**
 * Pure variant → token-family resolution for the design-system Button,
 * mirroring V200/src/components/ui/Button.tsx:
 *   • primary    → t.btn           (CTA; the big role — former "tall" specs)
 *   • secondary  → t.btnSecondary  (positive/blue accent slot)
 *   • secondary2 → t.btnSecondary2 (negative/red accent slot)
 * Variants are structural; the theme decides the palette. Never reach for the
 * raw --cyan/--pink accents — that's the kawaii-collapse bug this replaces.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'secondary2';

/** Kate's cross-theme semantic rule (applied by callers, e.g. AppHeader rows). */
export const SEMANTIC_VARIANT = {
  journal: 'secondary',
  mindmap: 'secondary2',
  profile: 'primary',
} as const satisfies Record<string, ButtonVariant>;

export interface ResolvedButtonStyle {
  family: ButtonFamily;
  /** Offset drop-shadow (notepad) — primary/CTA family only, like the web. */
  filter?: string;
  minHeight: number;
  padV: number;
  padH: number;
  opacity: number;
  letterSpacing: number;
  subtextTracking: number;
}

export function resolveButtonStyle(
  t: Theme,
  variant: ButtonVariant,
  disabled = false,
): ResolvedButtonStyle {
  const isPrimary = variant === 'primary';
  const family = isPrimary ? t.btn : variant === 'secondary' ? t.btnSecondary : t.btnSecondary2;
  return {
    family,
    filter: isPrimary ? t.btn.filter : undefined,
    minHeight: isPrimary ? 56 : 45,
    padV: isPrimary ? 12 : 8,
    padH: isPrimary ? 16 : 12,
    // Figma disabled recipe: the live treatment dimmed to 0.6.
    opacity: disabled ? 0.6 : 1,
    letterSpacing: t.btn.letterSpacing,
    subtextTracking: t.btn.subtextTracking,
  };
}
