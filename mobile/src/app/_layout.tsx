import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { CLERK_PUBLISHABLE_KEY } from '@/lib/config';
import { ThemeProvider, useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync();

// Separate component because useTheme needs ThemeProvider above it.
function ThemedNavShell() {
  const { mode, tokens } = useTheme();
  return (
    <>
      <StatusBar style={mode === 'cyberpunk' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: tokens.palette.bg },
          headerTintColor: tokens.text.h1,
          contentStyle: { backgroundColor: tokens.palette.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ title: 'Vent' }} />
        <Stack.Screen name="lens" options={{ title: 'Lens' }} />
        <Stack.Screen name="response" options={{ title: 'Response' }} />
        <Stack.Screen name="theme-select" options={{ title: 'Theme' }} />
        <Stack.Screen name="storybook" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

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
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <ThemeProvider>
        <ThemedNavShell />
      </ThemeProvider>
    </ClerkProvider>
  );
}
