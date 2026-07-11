import { describe, expect, it } from 'vitest';

import { cyberpunkVars } from './css-vars.cyberpunk';
import { notepadVars } from './css-vars.notepad';
import {
  mergeVars,
  noneToUndefined,
  parsePadding,
  parsePx,
  parseSide,
  resolveVars,
} from './resolve';

describe('resolveVars', () => {
  it('resolves forward references (--btn-secondary-radius declared before --btn-radius)', () => {
    const resolved = resolveVars(cyberpunkVars);
    expect(resolved['--btn-secondary-radius']).toBe('2px');
  });

  it('resolves chains (--font-btn → --font-display → --font-alumni)', () => {
    const resolved = resolveVars(cyberpunkVars);
    expect(resolved['--font-btn']).toBe("'Alumni Sans SC', 'Courier New', sans-serif");
  });

  it('resolves refs at use-site against the merged map (CSS cascade semantics)', () => {
    const resolved = resolveVars(mergeVars(cyberpunkVars, notepadVars));
    // declared in tokens-notepad.css as var(--cyan); notepad's cyan is the ink blue
    expect(resolved['--lens-quote-color']).toBe('#3a6fa8');
    // declared only in tokens.css as var(--cyan); still picks up notepad's blue
    expect(resolved['--node-relationships-border']).toBe('#3a6fa8');
  });

  it('leaves no var() references anywhere, for any skin', () => {
    for (const override of [{}, notepadVars]) {
      const resolved = resolveVars(mergeVars(cyberpunkVars, override));
      for (const [name, value] of Object.entries(resolved)) {
        expect(value, name).not.toContain('var(');
      }
    }
  });

  it('throws on unknown references and on cycles', () => {
    const unknown = { '--a': 'var(--nope)' } as never;
    expect(() => resolveVars(unknown)).toThrow(/unknown reference/);
    const cycle = { '--a': 'var(--b)', '--b': 'var(--a)' } as never;
    expect(() => resolveVars(cycle)).toThrow(/cycle/);
  });
});

describe('parsers', () => {
  it('parseSide handles solid borders, fractional widths, and none', () => {
    expect(parseSide('4px solid #00F5FF')).toEqual({ width: 4, color: '#00F5FF' });
    expect(parseSide('1.5px solid #c0605a')).toEqual({ width: 1.5, color: '#c0605a' });
    expect(parseSide('3px solid rgba(255,80,197,0.7)')).toEqual({
      width: 3,
      color: 'rgba(255,80,197,0.7)',
    });
    expect(parseSide('none')).toBeNull();
    expect(() => parseSide('dotted 2px red')).toThrow(/unparseable/);
  });

  it('parsePx handles px, negatives, decimals, and unitless zero', () => {
    expect(parsePx('16px')).toBe(16);
    expect(parsePx('-1px')).toBe(-1);
    expect(parsePx('1.44px')).toBe(1.44);
    expect(parsePx('0')).toBe(0);
    expect(() => parsePx('16px 24px')).toThrow(/unparseable/);
  });

  it('parsePadding splits vertical/horizontal', () => {
    expect(parsePadding('16px 24px')).toEqual({ v: 16, h: 24 });
  });

  it('noneToUndefined passes shadows through and drops none', () => {
    const multi = '0 0 10px #FF4664, 0 0 30px rgba(255,45,120,0.2)';
    expect(noneToUndefined(multi)).toBe(multi);
    expect(noneToUndefined('inset 4px 0 0 0 #49dbc8')).toBe('inset 4px 0 0 0 #49dbc8');
    expect(noneToUndefined('none')).toBeUndefined();
  });
});
