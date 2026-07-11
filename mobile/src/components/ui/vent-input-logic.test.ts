import { describe, expect, it } from 'vitest';

import { themes } from '@/theme';

import { counterColor } from './vent-input-logic';

describe('counterColor', () => {
  it('stays the sub color up to and at the threshold, flips to pink past it', () => {
    for (const t of [themes.cyberpunk, themes.kawaii, themes.notepad]) {
      expect(counterColor(t, 0, 700)).toBe(t.text.sub);
      expect(counterColor(t, 700, 700)).toBe(t.text.sub);
      expect(counterColor(t, 701, 700)).toBe(t.palette.pink);
    }
  });
});
