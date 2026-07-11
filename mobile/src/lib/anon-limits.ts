import * as SecureStore from 'expo-secure-store';

import { parseAnonLimits, type AnonLimits } from '@/lib/anon-limits-logic';

// One JSON blob instead of the web's three localStorage keys. SecureStore for
// the same reason as theme/storage.ts: it's already in the dev build, and this
// file is the only place that knows the store.
const KEY = 'ms_anon_limits';

export async function loadAnonLimits(): Promise<AnonLimits | null> {
  try {
    return parseAnonLimits(await SecureStore.getItemAsync(KEY));
  } catch {
    return null;
  }
}

export async function saveAnonLimits(state: AnonLimits): Promise<void> {
  try {
    await SecureStore.setItemAsync(KEY, JSON.stringify(state));
  } catch {
    // best-effort; worst case the anon user gets an extra lens after restart
  }
}
