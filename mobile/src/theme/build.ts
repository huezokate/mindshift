import { cyberpunkVars } from './css-vars.cyberpunk';
import { kawaiiVars } from './css-vars.kawaii';
import { notepadVars } from './css-vars.notepad';
import { fontsByMode } from './fonts';
import { mergeVars, noneToUndefined, parsePadding, parsePx, parseSide, resolveVars } from './resolve';
import type { BorderSet, FontFamily, Theme, ThemeMode, TokenVar } from './types';

const OVERRIDES: Record<ThemeMode, Partial<Record<TokenVar, string>>> = {
  cyberpunk: {},
  kawaii: kawaiiVars,
  notepad: notepadVars,
};

export function buildTheme(mode: ThemeMode): Theme {
  const raw = resolveVars(mergeVars(cyberpunkVars, OVERRIDES[mode]));
  const v = (name: TokenVar) => raw[name];
  const border = (p: string): BorderSet => ({
    top: parseSide(v(`${p}-bt` as TokenVar)),
    left: parseSide(v(`${p}-bl` as TokenVar)),
    right: parseSide(v(`${p}-br` as TokenVar)),
    bottom: parseSide(v(`${p}-bb` as TokenVar)),
  });
  const fonts = fontsByMode[mode];
  // --logo-font is a ref to one of the four font slots; match the resolved
  // stack back to its slot to reuse that slot's RN mapping.
  const logoFont: FontFamily =
    v('--logo-font') === v('--font-display') || v('--logo-font') === v('--font-alumni')
      ? fonts.display
      : v('--logo-font') === v('--font-btn')
        ? fonts.btn
        : v('--logo-font') === v('--font-mono')
          ? fonts.mono
          : fonts.body;
  const node = (c: string) => ({
    bg: v(`--node-${c}-bg` as TokenVar),
    border: v(`--node-${c}-border` as TokenVar),
  });

  return {
    mode,
    palette: {
      bg: v('--bg'),
      bgCard: v('--bg-card'),
      bgCard2: v('--bg-card2'),
      cyan: v('--cyan'),
      green: v('--green'),
      pink: v('--pink'),
      violet: v('--violet'),
      amber: v('--amber'),
    },
    text: {
      h1: v('--text-h1'),
      body: v('--text-body'),
      sub: v('--text-sub'),
      meta: v('--text-meta'),
      muted: v('--text-muted'),
    },
    glow: {
      cyan: noneToUndefined(v('--glow-cyan')),
      green: noneToUndefined(v('--glow-green')),
      pink: noneToUndefined(v('--glow-pink')),
      violet: noneToUndefined(v('--glow-violet')),
      card: noneToUndefined(v('--glow-card')),
      amber: noneToUndefined(v('--glow-amber')),
    },
    fonts,
    card: {
      bg: v('--card-bg'),
      border: border('--card'),
      radius: parsePx(v('--card-radius')),
      shadow: noneToUndefined(v('--card-shadow')),
      filter: noneToUndefined(v('--card-filter')),
    },
    hcard: {
      bg: v('--hcard-bg'),
      border: border('--hcard'),
      radius: parsePx(v('--hcard-radius')),
      padding: parsePadding(v('--hcard-padding')),
    },
    fig: {
      bg: v('--fig-bg'),
      bgSel: v('--fig-bg-sel'),
      border: parseSide(v('--fig-border')),
      borderSel: parseSide(v('--fig-border-sel')),
      radius: parsePx(v('--fig-radius')),
      shadowSel: noneToUndefined(v('--fig-shadow-sel')),
      areaBg: v('--fig-area-bg'),
      initial: v('--fig-initial'),
      initialSel: v('--fig-initial-sel'),
      nameUnsel: v('--fig-name-unsel'),
      nameSel: v('--fig-name-sel'),
      desc: v('--fig-desc'),
      avatar: {
        border: parseSide(v('--fig-avatar-border')),
        shadow: noneToUndefined(v('--fig-avatar-shadow')),
        gradientCss: v('--fig-avatar-grad'),
      },
    },
    input: {
      bg: v('--input-bg'),
      border: border('--input'),
      radius: parsePx(v('--input-radius')),
      divider: v('--input-divider'),
      shadow: noneToUndefined(v('--input-shadow')),
      headerBg: v('--input-header-bg'),
      headerShadow: noneToUndefined(v('--input-header-shadow')),
    },
    btn: {
      bg: v('--btn-bg'),
      color: v('--btn-color'),
      border: border('--btn'),
      radius: parsePx(v('--btn-radius')),
      shadow: noneToUndefined(v('--btn-shadow')),
      filter: noneToUndefined(v('--btn-filter')),
      letterSpacing: parsePx(v('--btn-letter-spacing')),
      subtextTracking: parsePx(v('--btn-subtext-tracking')),
      ctaSolidBg: v('--cta-solid-bg'),
      ctaSolidBgDisabled: v('--cta-solid-bg-disabled'),
      disColor: v('--btn-dis-color'),
      disBorder: v('--btn-dis-border'),
    },
    btnSecondary: {
      bg: v('--btn-secondary-bg'),
      color: v('--btn-secondary-color'),
      border: border('--btn-secondary'),
      radius: parsePx(v('--btn-secondary-radius')),
      shadow: noneToUndefined(v('--btn-secondary-shadow')),
    },
    btnSecondary2: {
      bg: v('--btn-secondary2-bg'),
      color: v('--btn-secondary2-color'),
      border: border('--btn-secondary2'),
      radius: parsePx(v('--btn-secondary2-radius')),
      shadow: noneToUndefined(v('--btn-secondary2-shadow')),
    },
    logo: {
      ring: v('--logo-ring'),
      mark: v('--logo-mark'),
      text: v('--logo-text'),
      font: logoFont,
      tracking: parsePx(v('--logo-tracking')),
    },
    chat: { userAccent: v('--chat-user-accent'), lensAccent: v('--chat-lens-accent') },
    fcard: {
      bg: v('--fcard-bg'),
      border: border('--fcard'),
      radius: parsePx(v('--fcard-radius')),
      filter: noneToUndefined(v('--fcard-filter')),
      inset: noneToUndefined(v('--fcard-inset')),
    },
    lens: { headerBg: v('--lens-header-bg'), quoteColor: v('--lens-quote-color') },
    preview: { body: v('--preview-body'), glyph: v('--preview-glyph') },
    shareAccent: v('--share-accent'),
    focusRing: parseSide(v('--focus-ring')),
    mmCardBgSelected: v('--mm-card-bg-selected'),
    portraitFilter: noneToUndefined(v('--portrait-filter')),
    sw: {
      bg: v('--sw-bg'),
      radius: parsePx(v('--sw-radius')),
      btnRadius: parsePx(v('--sw-btn-radius')),
      btnW: parsePx(v('--sw-btn-w')),
      btnH: parsePx(v('--sw-btn-h')),
      cyberpunkBg: v('--sw-cyberpunk-bg'),
      kawaiiBg: v('--sw-kawaii-bg'),
      notepadBg: v('--sw-notepad-bg'),
      text: v('--sw-text'),
      notepadText: v('--sw-notepad-text'),
      border: parseSide(v('--sw-border')),
      shadow: noneToUndefined(v('--sw-shadow')),
    },
    node: {
      career: node('career'),
      creativity: node('creativity'),
      health: node('health'),
      relationships: node('relationships'),
      travel: node('travel'),
      finances: node('finances'),
      living: node('living'),
    },
    radii: { sm: parsePx(v('--r-sm')), md: parsePx(v('--r-md')), lg: parsePx(v('--r-lg')) },
    glass: { bg: v('--glass-bg'), border: v('--glass-border'), blur: v('--blur') },
    raw,
  };
}

/** All three skins, built once at module load. */
export const themes: Record<ThemeMode, Theme> = {
  cyberpunk: buildTheme('cyberpunk'),
  kawaii: buildTheme('kawaii'),
  notepad: buildTheme('notepad'),
};
