/**
 * Face ID journal lock — pure session state machine (design D8). The lock
 * covers the journal surfaces only (list, entry detail, chat): one unlock
 * per app session, re-locked when the app backgrounds. The hook in
 * journal-lock.ts owns SecureStore + LocalAuthentication; this module owns
 * every decision so it can be unit-tested.
 */

export type LockState = {
  /** The user's preference (SecureStore `ms_journal_lock`). */
  enabled: boolean;
  /** Biometric (or passcode fallback) succeeded this session. */
  unlockedThisSession: boolean;
};

export const INITIAL_LOCK_STATE: LockState = { enabled: false, unlockedThisSession: false };

/** Should a gated screen render the lock card instead of its children? */
export function needsUnlock(s: LockState): boolean {
  return s.enabled && !s.unlockedThisSession;
}

export function unlocked(s: LockState): LockState {
  return { ...s, unlockedThisSession: true };
}

/** App went to background → next foreground must re-authenticate. */
export function relockOnBackground(s: LockState): LockState {
  return s.enabled ? { ...s, unlockedThisSession: false } : s;
}

/** Turning the pref on requires a fresh unlock; off clears the session. */
export function setEnabled(s: LockState, enabled: boolean): LockState {
  return { enabled, unlockedThisSession: false };
}

/** Stored pref → boolean ('1' is the only truthy spelling). */
export function parseLockPref(raw: string | null): boolean {
  return raw === '1';
}

export function serializeLockPref(enabled: boolean): string {
  return enabled ? '1' : '0';
}
