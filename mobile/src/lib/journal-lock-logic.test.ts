import { describe, expect, it } from 'vitest';

import {
  INITIAL_LOCK_STATE,
  needsUnlock,
  parseLockPref,
  relockOnBackground,
  serializeLockPref,
  setEnabled,
  unlocked,
} from '@/lib/journal-lock-logic';

describe('journal lock state machine', () => {
  it('disabled → never needs unlock', () => {
    expect(needsUnlock(INITIAL_LOCK_STATE)).toBe(false);
    expect(needsUnlock({ enabled: false, unlockedThisSession: true })).toBe(false);
  });

  it('enabled + not yet unlocked → gate', () => {
    const s = setEnabled(INITIAL_LOCK_STATE, true);
    expect(needsUnlock(s)).toBe(true);
  });

  it('unlock opens the session; background re-locks it', () => {
    let s = setEnabled(INITIAL_LOCK_STATE, true);
    s = unlocked(s);
    expect(needsUnlock(s)).toBe(false);
    s = relockOnBackground(s);
    expect(needsUnlock(s)).toBe(true);
  });

  it('background is a no-op while disabled', () => {
    const s = relockOnBackground({ enabled: false, unlockedThisSession: true });
    expect(s.unlockedThisSession).toBe(true);
  });

  it('toggling the pref always demands a fresh unlock', () => {
    const on = setEnabled({ enabled: false, unlockedThisSession: true }, true);
    expect(needsUnlock(on)).toBe(true);
    const off = setEnabled(on, false);
    expect(needsUnlock(off)).toBe(false);
  });

  it('pref round-trips through storage', () => {
    expect(parseLockPref(serializeLockPref(true))).toBe(true);
    expect(parseLockPref(serializeLockPref(false))).toBe(false);
    expect(parseLockPref(null)).toBe(false);
    expect(parseLockPref('garbage')).toBe(false);
  });
});
