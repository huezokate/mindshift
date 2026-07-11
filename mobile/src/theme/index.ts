/**
 * The shared token layer (T-030-02). Screens and components import ONLY from
 * '@/theme' — and never hardcode a hex that exists as a token (the RN twin of
 * V200's "use var(--*), never hardcode" rule).
 */
export type { BorderSet, ButtonFamily, FontFamily, Side, Theme, ThemeMode, TokenVar } from './types';
export { buildTheme, themes } from './build';
export { MODES, ThemeProvider, useTheme } from './provider';
export { borderStyle, sideStyle } from './helpers';
export { parseLinearGradient, type ParsedGradient } from './gradient';
