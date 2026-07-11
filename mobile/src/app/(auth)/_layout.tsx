import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Stack } from 'expo-router';

import { useTheme } from '@/theme';

export default function AuthLayout() {
  const { isSignedIn } = useAuth();
  const { tokens: t } = useTheme();
  if (isSignedIn) return <Redirect href="/home" />;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: t.palette.bg },
        headerTintColor: t.text.h1,
        contentStyle: { backgroundColor: t.palette.bg },
      }}
    >
      <Stack.Screen name="sign-in" options={{ title: 'Sign in' }} />
      <Stack.Screen name="sign-up" options={{ title: 'Sign up' }} />
    </Stack>
  );
}
