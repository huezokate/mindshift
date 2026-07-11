import { describe, expect, it } from 'vitest';

import { themes } from './build';
import type { ThemeMode } from './types';

const MODES: ThemeMode[] = ['cyberpunk', 'kawaii', 'notepad'];

describe('themes completeness (AC: fully typed and complete for all three skins)', () => {
  it.each(MODES)('%s: every raw token is resolved, no var() remains', (mode) => {
    for (const [name, value] of Object.entries(themes[mode].raw)) {
      expect(value, name).not.toContain('var(');
      expect(value, name).not.toBe('');
    }
  });

  it.each(MODES)('%s: typed color slots are populated', (mode) => {
    const t = themes[mode];
    for (const family of [t.palette, t.text] as Record<string, string>[]) {
      for (const [k, val] of Object.entries(family)) expect(val, k).toBeTruthy();
    }
    expect(t.card.bg).toBeTruthy();
    expect(t.btn.color).toBeTruthy();
    expect(t.fig.avatar.gradientCss).toContain('linear-gradient');
  });

  it('kawaii/notepad inherit cyberpunk-only tokens (CSS cascade parity)', () => {
    for (const mode of ['kawaii', 'notepad'] as const) {
      expect(themes[mode].glass).toEqual(themes.cyberpunk.glass);
      expect(themes[mode].radii).toEqual({ sm: 2, md: 4, lg: 8 });
      // node colors are cyberpunk-only in CSS — the literal ones stay neon...
      expect(themes[mode].node.career.bg).toBe('rgba(255,45,120,0.15)');
    }
    // ...but var() refs resolve at use-site against the active skin
    expect(themes.kawaii.node.relationships.border).toBe('#ff50c5');
    expect(themes.notepad.node.relationships.border).toBe('#3a6fa8');
  });
});

describe('semantic button accent swap (AC: representable from the module)', () => {
  // Kate's cross-theme rule: secondary = positive-ish = the theme's blue,
  // secondary2 = negative-ish = the theme's red (journal → secondary,
  // mindmap → secondary2 in AppHeader).
  it('cyberpunk: secondary is cyan, secondary2 is pink', () => {
    const t = themes.cyberpunk;
    expect(t.btnSecondary.color).toBe('#00F5FF');
    expect(t.btnSecondary.border.top?.color).toBe('#00F5FF');
    expect(t.btnSecondary2.color).toBe('#FF2D78');
    expect(t.btnSecondary2.border.top?.color).toBe('#FF2D78');
  });

  it('kawaii: secondary is mint/teal, secondary2 is pink (both on dark-brown chrome)', () => {
    const t = themes.kawaii;
    expect(t.btnSecondary.bg).toBe('#e5fcfa');
    expect(t.btnSecondary.shadow).toBe('inset 4px 0 0 0 #49dbc8');
    expect(t.btnSecondary2.bg).toBe('#ffe1ff');
    expect(t.btnSecondary2.shadow).toBe('inset 4px 0 0 0 #ff50c5');
  });

  it('notepad: secondary is blue underline, secondary2 is red underline (no L/R border)', () => {
    const t = themes.notepad;
    expect(t.btnSecondary.color).toBe('#3a6fa8');
    expect(t.btnSecondary.border.left).toBeNull();
    expect(t.btnSecondary.border.right).toBeNull();
    expect(t.btnSecondary.border.bottom).toEqual({ width: 1, color: '#3a6fa8' });
    expect(t.btnSecondary2.color).toBe('#c0605a');
    expect(t.btnSecondary2.border.bottom).toEqual({ width: 1, color: '#c0605a' });
  });

  it('chat accents carry the same blue/red semantics per skin', () => {
    expect(themes.cyberpunk.chat).toEqual({ userAccent: '#00F5FF', lensAccent: '#FF2D78' });
    expect(themes.kawaii.chat).toEqual({ userAccent: '#49dbc8', lensAccent: '#ff50c5' });
    expect(themes.notepad.chat).toEqual({ userAccent: '#3a6fa8', lensAccent: '#c0605a' });
  });
});

describe('parsed structural values', () => {
  it('borders parse per side with fractional widths', () => {
    expect(themes.cyberpunk.card.border.top).toEqual({ width: 4, color: '#00F5FF' });
    expect(themes.cyberpunk.card.border.right).toEqual({ width: 1, color: '#00F5FF' });
    expect(themes.notepad.card.border.top).toEqual({ width: 1.5, color: '#c0605a' });
  });

  it('shadows and filters pass through as RN strings, none → undefined', () => {
    expect(themes.kawaii.card.shadow).toBe('inset 4px 0 0 0 rgba(64,11,20,0.5)');
    expect(themes.cyberpunk.card.shadow).toBeUndefined();
    expect(themes.notepad.btn.filter).toBe('drop-shadow(2px 3px 0px #1e1e40)');
    expect(themes.notepad.portraitFilter).toBe(
      'grayscale(0.55) sepia(0.35) contrast(0.95) brightness(1.02)',
    );
    expect(themes.cyberpunk.glow.pink).toBe('0 0 10px #FF4664, 0 0 30px rgba(255,45,120,0.2)');
    expect(themes.kawaii.glow.cyan).toBeUndefined();
  });

  it('radii, tracking, padding, and switcher metrics are numeric', () => {
    expect(themes.kawaii.card.radius).toBe(32);
    expect(themes.notepad.btn.letterSpacing).toBe(-1);
    expect(themes.cyberpunk.logo.tracking).toBe(1.44);
    expect(themes.kawaii.hcard.padding).toEqual({ v: 20, h: 24 });
    expect(themes.notepad.sw.radius).toBe(0);
    expect(themes.notepad.sw.border).toEqual({ width: 1.5, color: '#1e1e40' });
  });

  it('fonts map to loaded RN families (iOS branch under the test stub)', () => {
    expect(themes.cyberpunk.fonts.display.regular).toBe('AlumniSansSC-SemiBold');
    expect(themes.cyberpunk.fonts.body.regular).toBe('Courier New');
    expect(themes.kawaii.fonts.btn).toEqual({ regular: 'Fredoka-Medium', bold: 'Fredoka-SemiBold' });
    expect(themes.notepad.fonts.display.regular).toBe('Georgia');
    // Inter gap closed in T-030-03: static instances bundled for notepad
    expect(themes.notepad.fonts.body).toEqual({
      regular: 'Inter-Regular',
      bold: 'Inter-SemiBold',
    });
    // --logo-font: var(--font-mono) on cyberpunk / body on kawaii / display on notepad
    expect(themes.cyberpunk.logo.font.regular).toBe('Courier New');
    expect(themes.notepad.logo.font.regular).toBe('Georgia');
  });
});
