import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { CLERK_PUBLISHABLE_KEY } from '@/lib/config';
import { routeFromNotification } from '@/lib/push-logic';
import { JournalStoreProvider } from '@/state/journal-store';
import { VentFlowProvider } from '@/state/vent-flow';
import { ThemeProvider, useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync();

// Separate component because useTheme needs ThemeProvider above it.
function ThemedNavShell() {
  const { mode, tokens } = useTheme();
  const router = useRouter();

  // Notification taps deep-link into the app (weekly nudge → mindmap).
  // Lazy import: remote push doesn't exist in Expo Go (SDK 53+), so the
  // module must never load at startup there.
  useEffect(() => {
    let sub: { remove: () => void } | undefined;
    let alive = true;
    import('expo-notifications')
      .then((Notifications) => {
        if (!alive) return;
        sub = Notifications.addNotificationResponseReceivedListener((response) => {
          const data = response.notification.request.content.data;
          router.push(routeFromNotification(data) as never);
        });
      })
      .catch(() => {}); // Expo Go without the module — no listener, no crash
    return () => {
      alive = false;
      sub?.remove();
    };
  }, [router]);

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
    'Inter-Regular': require('@/assets/fonts/Inter-Regular.ttf'),
    'Inter-SemiBold': require('@/assets/fonts/Inter-SemiBold.ttf'),
    MaterialSymbolsRounded: require('@/assets/fonts/MaterialSymbolsRounded.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <ThemeProvider>
        <VentFlowProvider>
          <JournalStoreProvider>
            <ThemedNavShell />
          </JournalStoreProvider>
        </VentFlowProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}
