/**
 * Pure push helpers (unit-tested); the expo-notifications plumbing lives in
 * push.ts. Notification payloads carry `data.url` (an in-app path) — the
 * weekly nudge points at the mindmap.
 */

export const DEFAULT_PUSH_ROUTE = '/(tabs)/mindmap';

/** Payload data → in-app route. Anything not an in-app path falls back. */
export function routeFromNotification(data: unknown): string {
  if (data && typeof data === 'object') {
    const url = (data as { url?: unknown }).url;
    if (typeof url === 'string' && url.startsWith('/')) return url;
  }
  return DEFAULT_PUSH_ROUTE;
}

/** Stored pref → boolean ('1' is the only truthy spelling). */
export function parsePushPref(raw: string | null): boolean {
  return raw === '1';
}

export function serializePushPref(enabled: boolean): string {
  return enabled ? '1' : '0';
}
