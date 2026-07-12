import { Pressable, Text, View } from 'react-native';

import { borderStyle, MODES, sideStyle, useTheme, type ThemeMode } from '@/theme';

/**
 * The three-mode theme switcher chips (--sw-* family), extracted from the
 * theme-select screen so the app and the Storybook decorator share one
 * implementation. Each theme styles all three chips; the active one gets the
 * focus ring. `compact` is the Storybook-toolbar size. `hero` is the
 * theme-select form: three [emoji over label] buttons on the primary --btn
 * family — the emoji are the product's one sanctioned emoji use (Kate).
 */
export function ModeSwitcher({ compact = false, hero = false }: { compact?: boolean; hero?: boolean }) {
  const { mode, setMode, tokens: t } = useTheme();
  if (hero) {
    return (
      <View style={{ flexDirection: 'row', gap: 8, alignSelf: 'center' }}>
        {MODES.map((m) => {
          const selected = mode === m.value;
          return (
            <Pressable
              key={m.value}
              onPress={() => setMode(m.value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={m.label}
              style={{
                minWidth: 96,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                paddingVertical: 10,
                paddingHorizontal: 12,
                backgroundColor: t.btn.bg,
                borderRadius: t.btn.radius,
                boxShadow: t.btn.shadow,
                filter: t.btn.filter,
                // Figma recipe: unselected = the live treatment dimmed.
                opacity: selected ? 1 : 0.55,
                ...(selected ? sideStyle(t.focusRing) : borderStyle(t.btn.border)),
              }}
            >
              <Text style={{ fontSize: 22, lineHeight: 26 }}>{m.emoji}</Text>
              <Text
                style={{
                  fontFamily: t.fonts.btn.bold ?? t.fonts.btn.regular,
                  fontWeight: '600',
                  fontSize: 12,
                  letterSpacing: t.btn.letterSpacing,
                  textTransform: 'uppercase',
                  color: t.btn.color,
                  textAlign: 'center',
                }}
              >
                {m.label.split(' · ')[1]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }
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
