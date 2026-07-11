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
      />
    </>
  );
}
