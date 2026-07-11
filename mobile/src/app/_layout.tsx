import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0a0a12' },
          headerTintColor: '#e8f6f8',
          contentStyle: { backgroundColor: '#0a0a12' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ title: 'Vent' }} />
        <Stack.Screen name="lens" options={{ title: 'Lens' }} />
        <Stack.Screen name="response" options={{ title: 'Response' }} />
        <Stack.Screen name="theme-select" options={{ title: 'Theme' }} />
      </Stack>
    </>
  );
}
