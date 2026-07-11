import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NavLink } from '@/components/nav-link';
import { Button } from '@/components/ui/button';
import { ModeSwitcher } from '@/components/ui/mode-switcher';
import { useTheme, type Theme } from '@/theme';

/**
 * Theme picker + the token layer's living proof (T-030-02 AC: a sample
 * element re-skins across all three modes with no leakage). Every color,
 * border, radius, shadow, filter, font, and tracking below comes from
 * useTheme().tokens — zero hardcoded values. The switcher chips and buttons
 * are the shared design-system components (T-030-03).
 */
export default function ThemeSelect() {
  const { tokens: t } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.palette.bg }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 24 }}>
        <ModeSwitcher />
        <SampleCard tokens={t} />
        <NavLink href="/onboarding" label="Start venting →" />
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
        Every value on this screen is drawn from the shared token layer — the
        same tokens the web app reads as CSS custom properties.
      </Text>
      <Text style={{ fontFamily: t.fonts.body.regular, fontSize: 13, color: t.text.sub }}>
        Subtext keeps the theme&apos;s secondary voice.
      </Text>
      <Text style={{ fontFamily: t.fonts.body.regular, fontSize: 11, color: t.text.meta }}>
        meta · switching modes re-skins everything above and below
      </Text>

      <Button variant="primary" fullWidth>
        Enter Minds Shift
      </Button>
      {/* Kate's cross-theme rule: secondary = positive/blue (journal),
          secondary2 = negative/red (mind map) — swapped per skin by the tokens. */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Button variant="secondary" fullWidth>
            Journal
          </Button>
        </View>
        <View style={{ flex: 1 }}>
          <Button variant="secondary2" fullWidth>
            Mind Map
          </Button>
        </View>
      </View>
    </View>
  );
}
