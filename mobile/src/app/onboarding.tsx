import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EntryAuthRow } from '@/components/nav/entry-auth-row';
import { Button } from '@/components/ui/button';
import { HeadingCard } from '@/components/ui/card';
import { VentInput } from '@/components/ui/vent-input';
import { useVentFlow } from '@/state/vent-flow';
import { useTheme } from '@/theme';

// Web parity: V200/src/app/app/onboarding/page.tsx
const MAX_CHARS = 800;
const MIN_CHARS = 20;

export default function Onboarding() {
  const router = useRouter();
  const { tokens: t } = useTheme();
  const { startVent } = useVentFlow();
  const [text, setText] = useState('');

  const canProceed = text.trim().length >= MIN_CHARS;

  function handleProceed() {
    if (!canProceed) return;
    // startVent also clears any leftover sessionId so the save creates a
    // fresh journal entry instead of appending to an old one (web parity).
    startVent(text);
    router.push('/lens');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.palette.bg }} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ padding: 24, paddingBottom: 40, gap: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInDown.duration(300)}>
            <HeadingCard>
              <Text
                style={{
                  fontFamily: t.fonts.display.bold ?? t.fonts.display.regular,
                  fontWeight: '700',
                  fontSize: 28,
                  letterSpacing: 1.44,
                  lineHeight: 32,
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  color: t.palette.cyan,
                  marginBottom: 8,
                }}
              >
                Get it off your chest
              </Text>
              <Text
                style={{
                  fontFamily: t.fonts.body.regular,
                  fontSize: 14,
                  letterSpacing: 0.52,
                  lineHeight: 20,
                  textAlign: 'center',
                  color: t.text.body,
                }}
              >
                Let it all out — then see it through the eyes of someone who lived through years
                of history.
              </Text>
            </HeadingCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(300).delay(80)} style={{ gap: 16 }}>
            <VentInput value={text} onChangeText={setText} maxLength={MAX_CHARS} warnAt={700} />
            <Button variant="primary" fullWidth disabled={!canProceed} onPress={handleProceed}>
              Select the Lens
            </Button>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(300).delay(160)}
            style={{ alignItems: 'center', gap: 16 }}
          >
            <Button variant="secondary2" onPress={() => router.push('/(tabs)/mindmap')}>
              Try the mind-mapping tool →
            </Button>
            <View style={{ alignSelf: 'stretch' }}>
              <EntryAuthRow />
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
