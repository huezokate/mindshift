import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NavLink } from '@/components/nav-link';
import { MODES, borderStyle, sideStyle, useTheme, type Theme, type ThemeMode } from '@/theme';

/**
 * Theme picker + the token layer's living proof (T-030-02 AC: a sample
 * element re-skins across all three modes with no leakage). Every color,
 * border, radius, shadow, filter, font, and tracking below comes from
 * useTheme().tokens — zero hardcoded values.
 */
export default function ThemeSelect() {
  const { mode, setMode, tokens: t } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.palette.bg }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 24 }}>
        <ModeSwitcher active={mode} onPick={setMode} tokens={t} />
        <SampleCard tokens={t} />
        <NavLink href="/onboarding" label="Start venting →" />
      </ScrollView>
    </SafeAreaView>
  );
}

function ModeSwitcher({
  active,
  onPick,
  tokens: t,
}: {
  active: ThemeMode;
  onPick: (mode: ThemeMode) => void;
  tokens: Theme;
}) {
  // Per-mode chip colors from the --sw-* family (each theme styles all three chips).
  const chipBg: Record<ThemeMode, string> = {
    cyberpunk: t.sw.cyberpunkBg,
    kawaii: t.sw.kawaiiBg,
    notepad: t.sw.notepadBg,
  };
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 8,
        padding: 6,
        alignSelf: 'center',
        backgroundColor: t.sw.bg,
        borderRadius: t.sw.radius,
        ...sideStyle(t.sw.border),
        boxShadow: t.sw.shadow,
      }}
    >
      {MODES.map((m) => (
        <Pressable
          key={m.value}
          onPress={() => onPick(m.value)}
          style={{
            minWidth: t.sw.btnW,
            height: t.sw.btnH,
            paddingHorizontal: 8,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: chipBg[m.value],
            borderRadius: t.sw.btnRadius,
            opacity: active === m.value ? 1 : 0.55,
            ...(active === m.value ? sideStyle(t.focusRing) : null),
          }}
        >
          <Text
            style={{
              fontFamily: t.fonts.btn.regular,
              fontSize: 11,
              color: m.value === 'notepad' ? t.sw.notepadText : t.sw.text,
              textAlign: 'center',
            }}
          >
            {m.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function SampleCard({ tokens: t }: { tokens: Theme }) {
  return (
    <View
      style={{
        backgroundColor: t.card.bg,
        borderRadius: t.card.radius,
        ...borderStyle(t.card.border),
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

      <DemoButton
        label="Enter Minds Shift"
        family={t.btn}
        filter={t.btn.filter}
        tracking={t.btn.letterSpacing}
        font={t.fonts.btn.bold ?? t.fonts.btn.regular}
        tall
      />
      {/* Kate's cross-theme rule: secondary = positive/blue (journal),
          secondary2 = negative/red (mind map) — swapped per skin by the tokens. */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <DemoButton
          label="Journal"
          family={t.btnSecondary}
          tracking={t.btn.letterSpacing}
          font={t.fonts.btn.regular}
        />
        <DemoButton
          label="Mind Map"
          family={t.btnSecondary2}
          tracking={t.btn.letterSpacing}
          font={t.fonts.btn.regular}
        />
      </View>
    </View>
  );
}

function DemoButton({
  label,
  family,
  filter,
  tracking,
  font,
  tall,
}: {
  label: string;
  family: Theme['btnSecondary'];
  filter?: string;
  tracking: number;
  font?: string;
  tall?: boolean;
}) {
  return (
    <View
      style={{
        flex: tall ? undefined : 1,
        minHeight: tall ? 56 : 45,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: tall ? 16 : 12,
        paddingVertical: tall ? 12 : 8,
        backgroundColor: family.bg,
        borderRadius: family.radius,
        ...borderStyle(family.border),
        boxShadow: family.shadow,
        filter,
      }}
    >
      <Text
        style={{
          fontFamily: font,
          fontWeight: '600',
          fontSize: 15,
          letterSpacing: tracking,
          textTransform: 'uppercase',
          color: family.color,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
