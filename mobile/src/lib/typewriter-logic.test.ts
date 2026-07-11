import { describe, expect, it } from 'vitest';

import { typeStep } from '@/lib/typewriter-logic';

describe('typeStep', () => {
  it('advances one char per tick until the end', () => {
    expect(typeStep('abc', 0)).toEqual({ next: 1, done: false });
    expect(typeStep('abc', 2)).toEqual({ next: 3, done: true });
  });

  it('clamps past the end (no overshoot on late ticks)', () => {
    expect(typeStep('abc', 3)).toEqual({ next: 3, done: true });
  });

  it('empty text is immediately done', () => {
    expect(typeStep('', 0)).toEqual({ next: 0, done: true });
  });
});
