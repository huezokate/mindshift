import type { cyberpunkVars } from './css-vars.cyberpunk';

/** Same union as the web's `Theme` (V200/src/lib/theme.tsx). */
export type ThemeMode = 'cyberpunk' | 'kawaii' | 'notepad';

/** Canonical token names — the cyberpunk :root block is the full base set;
    kawaii/notepad may only override keys that exist here. */
export type TokenVar = keyof typeof cyberpunkVars;

/** One parsed border side; null = CSS `none` (e.g. notepad secondary L/R). */
export type Side = { width: number; color: string } | null;

export type BorderSet = { top: Side; left: Side; right: Side; bottom: Side };

/** RN font families. `regular` undefined = platform system font. `bold`
    undefined = same family, use fontWeight for emphasis. */
export type FontFamily = { regular?: string; bold?: string };

export interface ThemeFonts {
  display: FontFamily;
  body: FontFamily;
  btn: FontFamily;
  mono: FontFamily;
}

/** Shared shape of the three structural button families (--btn / --btn-secondary /
    --btn-secondary2). The variant → family lookup is data, which is what keeps
    the semantic accent-swap (secondary = theme blue, secondary2 = theme red)
    representable per skin. */
export interface ButtonFamily {
  bg: string;
  color: string;
  border: BorderSet;
  radius: number;
  /** RN `boxShadow` string (New Arch), undefined = none. */
  shadow?: string;
}

export type NodeCategory =
  | 'career'
  | 'creativity'
  | 'health'
  | 'relationships'
  | 'travel'
  | 'finances'
  | 'living';

export interface Theme {
  mode: ThemeMode;
  palette: {
    bg: string;
    bgCard: string;
    bgCard2: string;
    cyan: string;
    green: string;
    pink: string;
    violet: string;
    amber: string;
  };
  text: { h1: string; body: string; sub: string; meta: string; muted: string };
  /** RN boxShadow strings; undefined where the skin sets `none`. */
  glow: {
    cyan?: string;
    green?: string;
    pink?: string;
    violet?: string;
    card?: string;
    amber?: string;
  };
  fonts: ThemeFonts;
  card: { bg: string; border: BorderSet; radius: number; shadow?: string; filter?: string };
  hcard: { bg: string; border: BorderSet; radius: number; padding: { v: number; h: number } };
  fig: {
    bg: string;
    bgSel: string;
    border: Side;
    borderSel: Side;
    radius: number;
    shadowSel?: string;
    areaBg: string;
    initial: string;
    initialSel: string;
    nameUnsel: string;
    nameSel: string;
    desc: string;
    avatar: {
      border: Side;
      shadow?: string;
      /** Raw CSS linear-gradient — rendering needs expo-linear-gradient (T-030-03). */
      gradientCss: string;
    };
  };
  input: {
    bg: string;
    border: BorderSet;
    radius: number;
    divider: string;
    shadow?: string;
    headerBg: string;
    headerShadow?: string;
  };
  btn: ButtonFamily & {
    /** RN `filter` string (notepad's offset drop-shadow); primary-only, like the web. */
    filter?: string;
    letterSpacing: number;
    subtextTracking: number;
    ctaSolidBg: string;
    ctaSolidBgDisabled: string;
    disColor: string;
    disBorder: string;
  };
  btnSecondary: ButtonFamily;
  btnSecondary2: ButtonFamily;
  logo: { ring: string; mark: string; text: string; font: FontFamily; tracking: number };
  chat: { userAccent: string; lensAccent: string };
  fcard: { bg: string; border: BorderSet; radius: number; filter?: string; inset?: string };
  lens: { headerBg: string; quoteColor: string };
  preview: { body: string; glyph: string };
  shareAccent: string;
  focusRing: Side;
  mmCardBgSelected: string;
  portraitFilter?: string;
  /** Theme switcher chrome. */
  sw: {
    bg: string;
    radius: number;
    btnRadius: number;
    btnW: number;
    btnH: number;
    cyberpunkBg: string;
    kawaiiBg: string;
    notepadBg: string;
    text: string;
    notepadText: string;
    border: Side;
    shadow?: string;
  };
  /** Mind-map node category colors. Only cyberpunk declares these in CSS, so all
      skins inherit the neon values — current shipped web behavior, kept faithfully. */
  node: Record<NodeCategory, { bg: string; border: string }>;
  radii: { sm: number; md: number; lg: number };
  glass: { bg: string; border: string; blur: string };
  /** Fully merged + var()-resolved map — escape hatch for tokens without a typed slot yet. */
  raw: Record<TokenVar, string>;
}
