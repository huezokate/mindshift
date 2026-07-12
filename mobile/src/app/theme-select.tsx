import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EntryAuthRow } from '@/components/nav/entry-auth-row';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { ModeSwitcher } from '@/components/ui/mode-switcher';
import { useTheme, type Theme } from '@/theme';

/**
 * Theme picker + anon entry gate — mirrors /app/theme-select: pick a reality,
 * acknowledge the disclaimer, enter. The ack is EPHEMERAL by design (web
 * comment: must start unchecked every visit — never persisted). Also still
 * the token layer's living proof (T-030-02): every value below reads from
 * useTheme().tokens.
 */
export default function ThemeSelect() {
  const router = useRouter();
  const { tokens: t } = useTheme();
  const [acked, setAcked] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.palette.bg }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 24 }}>
        {/* Kate's order: pitch first, then the theme choice (hero emoji
            buttons), then the ack gate, then auth. */}
        <SampleCard tokens={t} />
        <ModeSwitcher hero />

        {/* Disclaimer ack + enter (web parity) */}
        <Card style={{ padding: 16, gap: 12 }}>
          <Pressable
            onPress={() => setAcked((a) => !a)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: acked }}
            style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}
          >
            <Icon
              name={acked ? 'check_box' : 'check_box_outline_blank'}
              size={22}
              color={acked ? t.palette.cyan : t.text.sub}
            />
            <Text
              style={{
                flex: 1,
                fontFamily: t.fonts.body.regular,
                fontSize: 12,
                lineHeight: 17,
                color: t.text.sub,
              }}
            >
              Minds Shift offers perspective, not professional advice. The lens responses are
              AI-generated in a historical figure&apos;s voice — not their words, and not a
              substitute for mental-health care.
            </Text>
          </Pressable>
          <Button
            variant="primary"
            fullWidth
            disabled={!acked}
            onPress={() => router.push('/onboarding')}
          >
            Enter Minds Shift
          </Button>
        </Card>

        <EntryAuthRow />
      </ScrollView>
    </SafeAreaView>
  );
}

function SampleCard({ tokens: t }: { tokens: Theme }) {
  return (
    <View
      style={{
        backgroundColor: t.card.bg,
        borderRadius: t.card.radius,
        borderStyle: 'solid',
        borderTopWidth: t.card.border.top?.width ?? 0,
        borderTopColor: t.card.border.top?.color,
        borderLeftWidth: t.card.border.left?.width ?? 0,
        borderLeftColor: t.card.border.left?.color,
        borderRightWidth: t.card.border.right?.width ?? 0,
        borderRightColor: t.card.border.right?.color,
        borderBottomWidth: t.card.border.bottom?.width ?? 0,
        borderBottomColor: t.card.border.bottom?.color,
        boxShadow: t.card.shadow,
        filter: t.card.filter,
        paddingVertical: t.hcard.padding.v,
        paddingHorizontal: t.hcard.padding.h,
        gap: 16,
      }}
    >
      <Text
        style={{
          fontFamily: t.fonts.display.bold ?? t.fonts.display.regular,
          fontSize: 28,
          color: t.text.h1,
        }}
      >
        Pick your reality
      </Text>
      <Text
        style={{ fontFamily: t.fonts.body.regular, fontSize: 15, lineHeight: 22, color: t.text.body }}
      >
        Vent what&apos;s on your mind, pick a historical figure, and see your problem through
        their eyes. Three realities to read it in — switch any time.
      </Text>
      <Text style={{ fontFamily: t.fonts.body.regular, fontSize: 13, color: t.text.sub }}>
        Anonymous and free to try — no account needed.
      </Text>
    </View>
  );
}
