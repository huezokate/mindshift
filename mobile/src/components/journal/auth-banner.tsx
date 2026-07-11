import { Text, View } from 'react-native';

import { borderStyle, useTheme } from '@/theme';

export type AuthReason = 'lens_limit' | 'vent_limit' | 'save' | 'journal';

const REASONS: Record<AuthReason, { headline: string; sub: string }> = {
  lens_limit: {
    headline: "You've used all 3 lenses on this vent.",
    sub: 'Create a free account to unlock more perspectives.',
  },
  vent_limit: {
    headline: "You've used your free vent for today.",
    sub: 'Create a free account for 3 vents per day.',
  },
  save: {
    headline: 'Save this perspective to your journal.',
    sub: 'Create a free account to keep your insights.',
  },
  journal: {
    headline: 'Your journal is waiting.',
    sub: 'Sign in to see your saved perspectives.',
  },
};

const DEFAULT = { headline: 'Unlock your full potential.', sub: 'Free account. No credit card.' };

const BENEFITS = [
  '3 vents per day · 5 lenses each',
  'Save to your personal journal',
  'Revisit and apply new lenses anytime',
];

/**
 * Sign-up incentive card — RN port of V200/src/components/AuthBanner.tsx.
 * Web reads `?reason=` from the URL; here it's a prop (screens own routing).
 */
export function AuthBanner({ reason }: { reason?: AuthReason }) {
  const { tokens: t } = useTheme();
  const { headline, sub } = (reason && REASONS[reason]) || DEFAULT;
  return (
    <View
      style={{
        maxWidth: 400,
        width: '100%',
        backgroundColor: t.card.bg,
        ...borderStyle(t.card.border),
        borderRadius: t.card.radius,
        boxShadow: t.card.shadow,
        paddingVertical: 20,
        paddingHorizontal: 24,
      }}
    >
      <Text
        style={{
          fontFamily: t.fonts.display.bold ?? t.fonts.display.regular,
          fontWeight: '700',
          fontSize: 16,
          letterSpacing: 1,
          color: t.palette.cyan,
          textTransform: 'uppercase',
          marginBottom: 4,
        }}
      >
        {headline}
      </Text>
      <Text
        style={{
          fontFamily: t.fonts.body.regular,
          fontSize: 13,
          letterSpacing: 0.4,
          color: t.text.sub,
          marginBottom: 14,
        }}
      >
        {sub}
      </Text>
      <View style={{ gap: 6 }}>
        {BENEFITS.map((b) => (
          <View key={b} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: t.palette.cyan, fontSize: 12 }}>▸</Text>
            <Text
              style={{
                fontFamily: t.fonts.body.regular,
                fontSize: 13,
                letterSpacing: 0.4,
                color: t.text.body,
              }}
            >
              {b}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
