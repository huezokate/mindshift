import { describe, expect, it } from 'vitest';

import { getVentLabel } from '@/lib/vent-label';

describe('getVentLabel (web port)', () => {
  it('picks the first non-stopword >3 chars as the keyword', () => {
    // punctuation is stripped first, so "second-guessing" → "secondguessing"
    // is the first qualifying word — identical to the web behavior
    expect(getVentLabel('I keep second-guessing my career choice.')).toMatch(/ secondguessing$/);
    expect(getVentLabel('my career keeps me awake')).toMatch(/ career$/);
  });

  it('prefix is seeded by vent length (stable)', () => {
    const vent = 'career worries again';
    const prefixes = ['Contemplating', 'Ruminating on', 'Reflecting on'];
    expect(getVentLabel(vent).startsWith(prefixes[vent.length % 3])).toBe(true);
  });

  it('falls back when every word is stopped or short', () => {
    expect(getVentLabel('i am so so sad')).toBe('Dump it all here:');
    expect(getVentLabel('')).toBe('Dump it all here:');
  });
});
