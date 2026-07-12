import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { parsePushPref, serializePushPref } from '@/lib/push-logic';

const PREF_KEY = 'ms_push_enabled';
const TOKEN_KEY = 'ms_push_token';

export type ApiCall = <T>(
  path: string,
  opts?: { method?: 'GET' | 'POST' | 'DELETE'; body?: unknown },
) => Promise<T>;

export class PushUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PushUnavailableError';
  }
}

/**
 * Register this device for the weekly nudge (design D4): permission prompt →
 * Expo push token → POST /api/push/register. Throws PushUnavailableError
 * with a user-facing message when the environment can't do remote push
 * (Expo Go, missing EAS projectId, permission denied).
 *
 * expo-notifications is imported lazily: remote push was removed from Expo
 * Go (SDK 53+), so nothing here may run at module scope.
 */
export async function registerForWeeklyNudge(api: ApiCall): Promise<void> {
  const projectId: string | undefined =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) {
    throw new PushUnavailableError(
      'Push needs the EAS project set up (run `eas init`) and a development build.',
    );
  }

  const Notifications = await import('expo-notifications');
  const perm = await Notifications.requestPermissionsAsync();
  if (!perm.granted) {
    throw new PushUnavailableError('Allow notifications in Settings to get the weekly nudge.');
  }

  let token: string;
  try {
    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  } catch {
    throw new PushUnavailableError(
      'Push tokens need a development or production build (not Expo Go).',
    );
  }

  await api('/api/push/register', { method: 'POST', body: { token, platform: Platform.OS } });
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(PREF_KEY, serializePushPref(true));
  } catch {
    // best-effort; the server has the token either way
  }
}

/** Revoke this device's token and remember the preference as off. */
export async function unregisterWeeklyNudge(api: ApiCall): Promise<void> {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) await api('/api/push/register', { method: 'DELETE', body: { token } });
  } finally {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.setItemAsync(PREF_KEY, serializePushPref(false));
    } catch {
      // best-effort
    }
  }
}

export async function getPushPref(): Promise<boolean> {
  try {
    return parsePushPref(await SecureStore.getItemAsync(PREF_KEY));
  } catch {
    return false;
  }
}
