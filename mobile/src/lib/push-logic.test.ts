import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PUSH_ROUTE,
  parsePushPref,
  routeFromNotification,
  serializePushPref,
} from '@/lib/push-logic';

describe('routeFromNotification', () => {
  it('routes to the payload url when it is an in-app path', () => {
    expect(routeFromNotification({ url: '/journal/abc' })).toBe('/journal/abc');
  });

  it('falls back on missing, external, or malformed payloads', () => {
    expect(routeFromNotification(undefined)).toBe(DEFAULT_PUSH_ROUTE);
    expect(routeFromNotification({})).toBe(DEFAULT_PUSH_ROUTE);
    expect(routeFromNotification({ url: 'https://evil.example' })).toBe(DEFAULT_PUSH_ROUTE);
    expect(routeFromNotification({ url: 42 })).toBe(DEFAULT_PUSH_ROUTE);
    expect(routeFromNotification('nope')).toBe(DEFAULT_PUSH_ROUTE);
  });
});

describe('push pref', () => {
  it('round-trips', () => {
    expect(parsePushPref(serializePushPref(true))).toBe(true);
    expect(parsePushPref(serializePushPref(false))).toBe(false);
    expect(parsePushPref(null)).toBe(false);
  });
});
