import { Stack } from 'expo-router';

// Step 6 adds the signed-in redirect once Clerk is wired.
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0a0a12' },
        headerTintColor: '#e8f6f8',
        contentStyle: { backgroundColor: '#0a0a12' },
      }}
    >
      <Stack.Screen name="sign-in" options={{ title: 'Sign in' }} />
      <Stack.Screen name="sign-up" options={{ title: 'Sign up' }} />
    </Stack>
  );
}
