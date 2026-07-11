import { useSignUp } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text } from 'react-native';

import { AuthError, AuthInput, AuthShell, parseAuthReason } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/theme';

export default function SignUp() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  const { tokens: t } = useTheme();
  // ?reason= carries the limit context from the lens screen's LimitCard.
  const params = useLocalSearchParams<{ reason?: string; redirect?: string }>();
  const reason = parseAuthReason(params.reason);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const destination = (params.redirect as never) ?? ('/home' as never);

  const onSignUp = useCallback(async () => {
    if (!isLoaded || busy) return;
    setBusy(true);
    setError(null);
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setVerifying(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-up failed');
    } finally {
      setBusy(false);
    }
  }, [isLoaded, busy, signUp, email, password]);

  const onVerify = useCallback(async () => {
    if (!isLoaded || busy) return;
    setBusy(true);
    setError(null);
    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code });
      if (attempt.status === 'complete') {
        await setActive({ session: attempt.createdSessionId });
        router.replace(destination);
      } else {
        setError(`Additional step required: ${attempt.status}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setBusy(false);
    }
  }, [isLoaded, busy, signUp, setActive, code, router, destination]);

  if (verifying) {
    return (
      <AuthShell title="Check your email">
        <Text style={{ fontFamily: t.fonts.body.regular, fontSize: 14, color: t.text.body }}>
          We sent a verification code to {email}.
        </Text>
        <AuthInput
          placeholder="Verification code"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
        />
        <AuthError message={error} />
        <Button variant="primary" fullWidth disabled={busy} onPress={() => void onVerify()}>
          Verify
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Sign up" reason={reason}>
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
        autoComplete="new-password"
      />
      <AuthError message={error} />
      <Button variant="primary" fullWidth disabled={busy} onPress={() => void onSignUp()}>
        Create account
      </Button>
    </AuthShell>
  );
}
