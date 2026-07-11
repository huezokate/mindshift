import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

import { parseLinearGradient, sideStyle, useTheme, type Side } from '@/theme';

/**
 * Circular figure avatar on the theme's --fig-avatar-grad gradient. Portrait
 * assets aren't bundled in mobile yet (T-030-04 wires figure data), so the
 * figure's initial sits on the gradient — same treatment as the web's
 * pre-portrait fallback. Ring/shadow are the caller's per-theme choice.
 */
export function LensAvatar({
  name,
  size,
  ring,
  shadow,
}: {
  name: string;
  size: number;
  /** Ring border, per-theme (web: violet/pink/green depending on context). */
  ring: Side;
  /** kawaii passes t.fig.avatar.shadow; others none. */
  shadow?: string;
}) {
  const { tokens: t } = useTheme();
  const grad = parseLinearGradient(t.fig.avatar.gradientCss);
  const initial = (name.trim()[0] ?? '?').toUpperCase();
  const inner = (
    <Text
      style={{
        fontFamily: t.fonts.display.bold ?? t.fonts.display.regular,
        fontSize: size * 0.5,
        color: t.fig.initial,
      }}
    >
      {initial}
    </Text>
  );
  const frame = {
    width: size,
    height: size,
    borderRadius: size / 2,
    overflow: 'hidden' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    ...sideStyle(ring),
    boxShadow: shadow,
  };
  return grad ? (
    <LinearGradient
      colors={grad.colors}
      locations={grad.locations as [number, number, ...number[]] | undefined}
      start={grad.start}
      end={grad.end}
      style={frame}
    >
      {inner}
    </LinearGradient>
  ) : (
    <View style={[frame, { backgroundColor: t.fig.bg }]}>{inner}</View>
  );
}
