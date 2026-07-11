import { describe, expect, it } from 'vitest';

import {
  checkAnonLimits,
  parseAnonLimits,
  trackAnonLens,
  ventKeyOf,
  type AnonLimits,
} from '@/lib/anon-limits-logic';

const TODAY = '2026-07-11';
const YESTERDAY = '2026-07-10';
const VENT = 'I keep second-guessing my career choice and everything feels uncertain right now.';

const after = (n: number, vent = VENT, date = TODAY): AnonLimits => ({
  date,
  ventKey: ventKeyOf(vent),
  lensCount: n,
});

describe('checkAnonLimits (web rule table)', () => {
  it('fresh state → ok', () => {
    expect(checkAnonLimits(null, TODAY, VENT)).toBeNull();
  });

  it('yesterday state → ok (new day resets on track)', () => {
    expect(checkAnonLimits(after(3, VENT, YESTERDAY), TODAY, VENT)).toBeNull();
  });

  it('same vent under the cap → ok', () => {
    expect(checkAnonLimits(after(2), TODAY, VENT)).toBeNull();
  });

  it('same vent at 3 lenses → lenses', () => {
    expect(checkAnonLimits(after(3), TODAY, VENT)).toBe('lenses');
  });

  it('different vent same day → vents (1 vent/day)', () => {
    expect(checkAnonLimits(after(1), TODAY, 'A totally different problem about my landlord.')).toBe(
      'vents',
    );
  });

  it('vent identity is the first 100 chars', () => {
    const long = 'x'.repeat(100);
    const state = after(1, long + 'AAAA');
    expect(checkAnonLimits(state, TODAY, long + 'BBBB')).toBeNull(); // same key
  });
});

describe('trackAnonLens', () => {
  it('first lens of a new vent → count 1', () => {
    expect(trackAnonLens(null, TODAY, VENT)).toEqual(after(1));
  });

  it('same vent increments', () => {
    expect(trackAnonLens(after(1), TODAY, VENT)).toEqual(after(2));
  });

  it('new day resets to 1', () => {
    expect(trackAnonLens(after(3, VENT, YESTERDAY), TODAY, VENT)).toEqual(after(1));
  });

  it('different vent same day resets to 1 (matches web trackAnonLens)', () => {
    const other = 'A totally different problem about my landlord and the rent going up.';
    expect(trackAnonLens(after(2), TODAY, other)).toEqual(after(1, other));
  });
});

describe('parseAnonLimits', () => {
  it('round-trips a valid blob', () => {
    expect(parseAnonLimits(JSON.stringify(after(2)))).toEqual(after(2));
  });

  it('rejects null, garbage, and wrong shapes', () => {
    expect(parseAnonLimits(null)).toBeNull();
    expect(parseAnonLimits('not json')).toBeNull();
    expect(parseAnonLimits(JSON.stringify({ date: 1, ventKey: 'x', lensCount: 'y' }))).toBeNull();
  });
});
