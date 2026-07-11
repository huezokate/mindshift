import { describe, expect, it } from 'vitest';

import { relativeTime, relativeTimeAgo } from './relative-time';

const NOW = Date.parse('2026-07-11T12:00:00Z');
const ago = (seconds: number) => new Date(NOW - seconds * 1000).toISOString();

describe('relativeTime', () => {
  it('matches the web buckets', () => {
    expect(relativeTime(ago(30), NOW)).toBe('just now');
    expect(relativeTime(ago(5 * 60), NOW)).toBe('5m');
    expect(relativeTime(ago(3 * 3600), NOW)).toBe('3h');
    expect(relativeTime(ago(2 * 86400), NOW)).toBe('2d');
    expect(relativeTime(ago(4 * 30 * 86400), NOW)).toBe('4mo');
    expect(relativeTime(ago(400 * 86400), NOW)).toBe('1y');
  });

  it('appends " ago" except for "just now"', () => {
    expect(relativeTimeAgo(ago(10), NOW)).toBe('just now');
    expect(relativeTimeAgo(ago(120), NOW)).toBe('2m ago');
  });
});
