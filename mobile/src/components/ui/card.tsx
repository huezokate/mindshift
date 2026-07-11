import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { borderStyle, useTheme } from '@/theme';

/**
 * The two container surfaces the web applies as inline token patterns
 * (--card-… and --hcard-…; no React component exists there). RN has no CSS
 * cascade, so they're extracted once instead of re-spread at every callsite.
 */

/** Content card — the `--card-*` family (AuthBanner, WelcomeCard, sheets). */
export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { tokens: t } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: t.card.bg,
          borderRadius: t.card.radius,
          ...borderStyle(t.card.border),
          boxShadow: t.card.shadow,
          filter: t.card.filter,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Heading card — the `--hcard-*` family (pink-bordered page headers on
    onboarding/response/theme-select), padding included per the token. */
export function HeadingCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { tokens: t } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: t.hcard.bg,
          borderRadius: t.hcard.radius,
          ...borderStyle(t.hcard.border),
          paddingVertical: t.hcard.padding.v,
          paddingHorizontal: t.hcard.padding.h,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
