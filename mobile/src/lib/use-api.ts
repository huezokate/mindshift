import { useAuth } from '@clerk/clerk-expo';
import { useCallback } from 'react';

import { apiFetch, type ApiFetchOptions } from '@/lib/api';

/**
 * apiFetch with Clerk auth wired in. Signed-in calls carry the session token
 * as a Bearer header (Clerk's middleware accepts it like the web cookie);
 * anon calls go out bare. getToken() is resolved per call — Clerk caches and
 * refreshes it internally.
 */
export function useApi() {
  const { getToken, isSignedIn } = useAuth();

  const api = useCallback(
    async <T>(path: string, opts: Omit<ApiFetchOptions, 'token'> = {}): Promise<T> => {
      const token = isSignedIn ? await getToken() : null;
      return apiFetch<T>(path, { ...opts, token });
    },
    [getToken, isSignedIn],
  );

  return { api, isSignedIn: isSignedIn ?? false };
}
