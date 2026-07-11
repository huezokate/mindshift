import * as SecureStore from 'expo-secure-store';

import type { ThemeMode } from './types';

/** Same key as the web's localStorage persistence (V200/src/lib/theme.tsx). */
const KEY = 'ms_theme';

/** Validate a stored string; anything unknown (or null) → null. */
export function parseMode(value: string | null): ThemeMode | null {
  return value === 'cyberpunk' || value === 'kawaii' || value === 'notepad' ? value : null;
}

// SecureStore because it's already in the installed dev build (Clerk token
// cache) — AsyncStorage would force a dev-client rebuild for a 9-char string.
// This file is the only place that knows, so swapping stores is a local change.
export async function getSavedMode(): Promise<ThemeMode | null> {
  try {
    return parseMode(await SecureStore.getItemAsync(KEY));
  } catch {
    return null;
  }
}

export async function saveMode(mode: ThemeMode): Promise<void> {
  try {
    await SecureStore.setItemAsync(KEY, mode);
  } catch {
    // persistence is best-effort; the session keeps the in-memory mode
  }
}
