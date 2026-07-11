import { useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text } from 'react-native';

import { AuthButton, AuthError, AuthForm, AuthInput } from '@/components/auth-form';

export default function SignUp() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
        router.replace('/home');
      } else {
        setError(`Additional step required: ${attempt.status}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setBusy(false);
    }
  }, [isLoaded, busy, signUp, setActive, code, router]);

  if (verifying) {
    return (
      <AuthForm title="Check your email">
        <Text style={{ color: '#e8f6f8' }}>We sent a verification code to {email}.</Text>
        <AuthInput placeholder="Verification code" value={code} onChangeText={setCode} keyboardType="number-pad" />
        <AuthError message={error} />
        <AuthButton label="Verify" onPress={onVerify} disabled={busy} />
      </AuthForm>
    );
  }

  return (
    <AuthForm title="Sign up">
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
      <AuthButton label="Create account" onPress={onSignUp} disabled={busy} />
    </AuthForm>
  );
}
