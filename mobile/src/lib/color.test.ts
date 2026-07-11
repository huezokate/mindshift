import { describe, expect, it } from 'vitest';

import { withAlpha } from '@/lib/color';

describe('withAlpha', () => {
  it('tints 6-digit hex', () => {
    expect(withAlpha('#5ad4e6', 0.12)).toBe('rgba(90,212,230,0.12)');
  });

  it('expands 3-digit hex', () => {
    expect(withAlpha('#f0a', 0.5)).toBe('rgba(255,0,170,0.5)');
  });

  it('passes through non-hex values untouched', () => {
    expect(withAlpha('rgba(1,2,3,0.4)', 0.12)).toBe('rgba(1,2,3,0.4)');
  });
});
