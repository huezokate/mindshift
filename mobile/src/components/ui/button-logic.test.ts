import { describe, expect, it } from 'vitest';

import { themes } from '@/theme';

import { resolveButtonStyle, SEMANTIC_VARIANT } from './button-logic';

describe('resolveButtonStyle', () => {
  it('maps variants onto the structural families per mode (never raw accents)', () => {
    for (const t of [themes.cyberpunk, themes.kawaii, themes.notepad]) {
      expect(resolveButtonStyle(t, 'primary').family).toBe(t.btn);
      expect(resolveButtonStyle(t, 'secondary').family).toBe(t.btnSecondary);
      expect(resolveButtonStyle(t, 'secondary2').family).toBe(t.btnSecondary2);
    }
  });

  it('resolves the semantic accent-swap correctly in every mode (the web bug-class)', () => {
    // journal → secondary (positive/blue slot), mindmap → secondary2 (negative/red).
    const journal = (m: keyof typeof themes) =>
      resolveButtonStyle(themes[m], SEMANTIC_VARIANT.journal).family;
    const mindmap = (m: keyof typeof themes) =>
      resolveButtonStyle(themes[m], SEMANTIC_VARIANT.mindmap).family;

    expect(journal('cyberpunk').color).toBe('#00F5FF'); // cyan
    expect(mindmap('cyberpunk').color).toBe('#FF2D78'); // pink
    expect(journal('kawaii').bg).toBe('#e5fcfa'); // mint
    expect(mindmap('kawaii').bg).toBe('#ffe1ff'); // pink
    expect(journal('notepad').color).toBe('#3a6fa8'); // blue
    expect(mindmap('notepad').color).toBe('#c0605a'); // red

    // The swap must actually swap — no mode may collapse both to one family.
    for (const m of ['cyberpunk', 'kawaii', 'notepad'] as const) {
      expect(journal(m)).not.toBe(mindmap(m));
    }
  });

  it('sizes by role: primary is the big CTA, secondaries compact', () => {
    const t = themes.cyberpunk;
    const primary = resolveButtonStyle(t, 'primary');
    const secondary = resolveButtonStyle(t, 'secondary');
    expect([primary.minHeight, primary.padV, primary.padH]).toEqual([56, 12, 16]);
    expect([secondary.minHeight, secondary.padV, secondary.padH]).toEqual([45, 8, 12]);
  });

  it('carries the drop-shadow filter on primary only (notepad offset shadow)', () => {
    expect(resolveButtonStyle(themes.notepad, 'primary').filter).toBe(
      'drop-shadow(2px 3px 0px #1e1e40)',
    );
    expect(resolveButtonStyle(themes.notepad, 'secondary').filter).toBeUndefined();
    expect(resolveButtonStyle(themes.cyberpunk, 'primary').filter).toBeUndefined();
  });

  it('disabled dims to 0.6 without changing the treatment', () => {
    const t = themes.kawaii;
    expect(resolveButtonStyle(t, 'primary', true).opacity).toBe(0.6);
    expect(resolveButtonStyle(t, 'primary', true).family).toBe(t.btn);
    expect(resolveButtonStyle(t, 'primary').opacity).toBe(1);
  });
});
