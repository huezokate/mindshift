import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'AlumniSansSC-SemiBold': require('@/assets/fonts/AlumniSansSC-SemiBold.ttf'),
    'AlumniSansSC-Bold': require('@/assets/fonts/AlumniSansSC-Bold.ttf'),
    'NunitoSans-Regular': require('@/assets/fonts/NunitoSans-Regular.ttf'),
    'NunitoSans-Bold': require('@/assets/fonts/NunitoSans-Bold.ttf'),
    'Fredoka-Medium': require('@/assets/fonts/Fredoka-Medium.ttf'),
    'Fredoka-SemiBold': require('@/assets/fonts/Fredoka-SemiBold.ttf'),
    MaterialSymbolsRounded: require('@/assets/fonts/MaterialSymbolsRounded.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

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
