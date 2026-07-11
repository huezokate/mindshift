import { useSignIn, useSSO } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';
import { Text } from 'react-native';

import { AuthButton, AuthError, AuthForm, AuthInput } from '@/components/auth-form';

// Completes the pending auth session when the system browser redirects back.
WebBrowser.maybeCompleteAuthSession();

export default function SignIn() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onEmailSignIn = useCallback(async () => {
    if (!isLoaded || busy) return;
    setBusy(true);
    setError(null);
    try {
      const attempt = await signIn.create({ identifier: email, password });
      if (attempt.status === 'complete') {
        await setActive({ session: attempt.createdSessionId });
        router.replace('/home');
      } else {
        setError(`Additional step required: ${attempt.status}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setBusy(false);
    }
  }, [isLoaded, busy, signIn, setActive, email, password, router]);

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
        router.replace('/home');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setBusy(false);
    }
  }, [busy, startSSOFlow, router]);

  return (
    <AuthForm title="Sign in">
      <AuthButton label="Continue with Google" onPress={onGoogleSignIn} disabled={busy} />
      <Text style={{ color: '#5b6570', textAlign: 'center' }}>or</Text>
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
      <AuthButton label="Sign in" onPress={onEmailSignIn} secondary disabled={busy} />
      <Link href="/sign-up" style={{ color: '#5ad4e6', textAlign: 'center', marginTop: 8 }}>
        No account? Sign up
      </Link>
    </AuthForm>
  );
}
