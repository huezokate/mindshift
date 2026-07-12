import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import {
  INITIAL_LOCK_STATE,
  needsUnlock,
  parseLockPref,
  relockOnBackground,
  serializeLockPref,
  setEnabled as setEnabledState,
  unlocked,
  type LockState,
} from '@/lib/journal-lock-logic';

const KEY = 'ms_journal_lock';

// Module-level so every gated screen shares one session state, and a
// background→foreground cycle re-locks all of them at once.
let lockState: LockState = INITIAL_LOCK_STATE;
const listeners = new Set<() => void>();
let hydrated = false;

function setLockState(next: LockState) {
  lockState = next;
  listeners.forEach((l) => l());
}

AppState.addEventListener('change', (state) => {
  if (state === 'background') setLockState(relockOnBackground(lockState));
});

async function hydrate() {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    setLockState({ ...lockState, enabled: parseLockPref(raw) });
  } catch {
    // stay unlocked-off on storage failure
  }
}

/**
 * Face ID / passcode lock over the journal surfaces (design D8). `locked`
 * gates rendering; `requestUnlock` shows the system prompt;
 * `setEnabled` persists the preference (a fresh unlock is required after
 * enabling). `available` is false on hardware without enrolled biometrics —
 * callers hide the toggle then.
 */
export function useJournalLock() {
  const [, force] = useState(0);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    const listener = () => force((n) => n + 1);
    listeners.add(listener);
    void hydrate().then(listener);
    LocalAuthentication.hasHardwareAsync()
      .then(async (hw) => hw && (await LocalAuthentication.isEnrolledAsync()))
      .then((ok) => setAvailable(Boolean(ok)))
      .catch(() => setAvailable(false));
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const requestUnlock = useCallback(async (): Promise<boolean> => {
    try {
      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock your journal',
      });
      if (res.success) setLockState(unlocked(lockState));
      return res.success;
    } catch {
      return false;
    }
  }, []);

  const setEnabled = useCallback(async (enabled: boolean) => {
    setLockState(setEnabledState(lockState, enabled));
    try {
      await SecureStore.setItemAsync(KEY, serializeLockPref(enabled));
    } catch {
      // pref persists best-effort; session state already updated
    }
  }, []);

  return {
    enabled: lockState.enabled,
    locked: needsUnlock(lockState),
    available,
    requestUnlock,
    setEnabled,
  };
}
