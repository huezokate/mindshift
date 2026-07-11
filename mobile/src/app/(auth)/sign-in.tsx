import { useSignIn, useSSO } from '@clerk/clerk-expo';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';
import { Text } from 'react-native';

import { AuthError, AuthInput, AuthShell, parseAuthReason } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/theme';

// Completes the pending auth session when the system browser redirects back.
WebBrowser.maybeCompleteAuthSession();

export default function SignIn() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const { tokens: t } = useTheme();
  // ?reason= drives the AuthBanner headline (web parity); ?redirect= returns
  // mid-flow users (e.g. anon Save on the response screen) where they left off.
  const params = useLocalSearchParams<{ reason?: string; redirect?: string }>();
  const reason = parseAuthReason(params.reason);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const destination = (params.redirect as never) ?? ('/home' as never);

  const onEmailSignIn = useCallback(async () => {
    if (!isLoaded || busy) return;
    setBusy(true);
    setError(null);
    try {
      const attempt = await signIn.create({ identifier: email, password });
      if (attempt.status === 'complete') {
        await setActive({ session: attempt.createdSessionId });
        router.replace(destination);
      } else {
        setError(`Additional step required: ${attempt.status}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setBusy(false);
    }
  }, [isLoaded, busy, signIn, setActive, email, password, router, destination]);

  const onGoogleSignIn = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      // Opens the system browser (never an embedded WebView) via Clerk SSO.
      const { createdSessionId, setActive: ssoSetActive } = await startSSOFlow({
        strategy: 'oauth_google',
      });
      if (createdSessionId && ssoSetActive) {
        await ssoSetActive({ session: createdSessionId });
        router.replace(destination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setBusy(false);
    }
  }, [busy, startSSOFlow, router, destination]);

  return (
    <AuthShell title="Sign in" reason={reason}>
      <Button variant="primary" fullWidth disabled={busy} onPress={() => void onGoogleSignIn()}>
        Continue with Google
      </Button>
      <Text
        style={{ fontFamily: t.fonts.body.regular, color: t.text.sub, textAlign: 'center' }}
      >
        or
      </Text>
      <AuthInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoComplete="email"
      />
      <AuthInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="current-password"
      />
      <AuthError message={error} />
      <Button variant="secondary" fullWidth disabled={busy} onPress={() => void onEmailSignIn()}>
        Sign in
      </Button>
      <Link
        href="/sign-up"
        style={{
          fontFamily: t.fonts.body.regular,
          color: t.palette.cyan,
          textAlign: 'center',
          marginTop: 8,
        }}
      >
        No account? Sign up
      </Link>
    </AuthShell>
  );
}
