import { Pressable, Text, View } from 'react-native';

import { MODES, sideStyle, useTheme, type ThemeMode } from '@/theme';

/**
 * The three-mode theme switcher chips (--sw-* family), extracted from the
 * theme-select screen so the app and the Storybook decorator share one
 * implementation. Each theme styles all three chips; the active one gets the
 * focus ring. `compact` is the Storybook-toolbar size.
 */
export function ModeSwitcher({ compact = false }: { compact?: boolean }) {
  const { mode, setMode, tokens: t } = useTheme();
  const chipBg: Record<ThemeMode, string> = {
    cyberpunk: t.sw.cyberpunkBg,
    kawaii: t.sw.kawaiiBg,
    notepad: t.sw.notepadBg,
  };
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: compact ? 6 : 8,
        padding: compact ? 4 : 6,
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
          onPress={() => setMode(m.value)}
          accessibilityRole="button"
          accessibilityState={{ selected: mode === m.value }}
          style={{
            minWidth: compact ? undefined : t.sw.btnW,
            height: compact ? 26 : t.sw.btnH,
            paddingHorizontal: compact ? 10 : 8,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: chipBg[m.value],
            borderRadius: t.sw.btnRadius,
            opacity: mode === m.value ? 1 : 0.55,
            ...(mode === m.value ? sideStyle(t.focusRing) : null),
          }}
        >
          <Text
            style={{
              fontFamily: t.fonts.btn.regular,
              fontSize: compact ? 10 : 11,
              color: m.value === 'notepad' ? t.sw.notepadText : t.sw.text,
              textAlign: 'center',
            }}
          >
            {compact ? m.label.split(' · ')[1] : m.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
