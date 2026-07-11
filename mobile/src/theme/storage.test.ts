import { describe, expect, it } from 'vitest';

import { getSavedMode, parseMode, saveMode } from './storage';

describe('parseMode', () => {
  it('accepts the three valid modes', () => {
    expect(parseMode('cyberpunk')).toBe('cyberpunk');
    expect(parseMode('kawaii')).toBe('kawaii');
    expect(parseMode('notepad')).toBe('notepad');
  });

  it('rejects garbage and null', () => {
    expect(parseMode('garbage')).toBeNull();
    expect(parseMode('')).toBeNull();
    expect(parseMode(null)).toBeNull();
  });
});

describe('round trip (against the SecureStore stub)', () => {
  it('returns null before any save, then the saved mode', async () => {
    expect(await getSavedMode()).toBeNull();
    await saveMode('kawaii');
    expect(await getSavedMode()).toBe('kawaii');
  });
});
