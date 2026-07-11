import { useAuth, useUser } from '@clerk/clerk-expo';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthButton, AuthError } from '@/components/auth-form';
import { NavLink } from '@/components/nav-link';
import { PlaceholderScreen } from '@/components/placeholder-screen';
import { apiFetch } from '@/lib/api';

// Mirrors /app/profile. Doubles as the T-030-01 backend smoke test: an
// authenticated GET /api/journal-v2/entries — a Clerk-gated route that 401s
// without a valid Bearer token, so a 200 here proves native auth end-to-end.
export default function Profile() {
  const { isSignedIn, getToken, signOut } = useAuth();
  const { user } = useUser();
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onTestBackend = useCallback(async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const token = await getToken();
      const data = await apiFetch<{ sessions: unknown[]; hasMore: boolean }>(
        '/api/journal-v2/entries?offset=0&limit=1',
        { token },
      );
      setResult(`✓ Authenticated API call OK — ${data.sessions.length} session(s) returned`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setBusy(false);
    }
  }, [getToken]);

  if (!isSignedIn) {
    return (
      <PlaceholderScreen title="Profile">
        <Text style={styles.body}>Sign in to see your account.</Text>
        <NavLink href="/sign-in" label="Sign in" />
        <NavLink href="/sign-up" label="Sign up" />
      </PlaceholderScreen>
    );
  }

  return (
    <PlaceholderScreen title="Profile">
      <Text style={styles.body}>{user?.primaryEmailAddress?.emailAddress ?? user?.id}</Text>
      <AuthButton label={busy ? 'Loading…' : 'Test backend (journal entries)'} onPress={onTestBackend} disabled={busy} />
      {result && (
        <View style={styles.result}>
          <Text style={styles.body}>{result}</Text>
        </View>
      )}
      <AuthError message={error} />
      <AuthButton label="Sign out" onPress={() => signOut()} secondary />
    </PlaceholderScreen>
  );
}

const styles = StyleSheet.create({
  body: { color: '#e8f6f8', fontSize: 16 },
  result: {
    borderWidth: 1,
    borderColor: '#1d4b56',
    borderRadius: 4,
    padding: 12,
    backgroundColor: '#101822',
  },
});
