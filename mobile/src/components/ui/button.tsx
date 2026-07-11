import type { ReactNode } from 'react';
import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { borderStyle, useTheme, type Theme } from '@/theme';

import { resolveButtonStyle, type ButtonVariant } from './button-logic';
import { Icon } from './icon';
import { usePressScale } from './motion';

export type { ButtonVariant };

type Props = {
  variant?: ButtonVariant;
  onPress?: () => void;
  /** Omit children (with `icon` set) for the icon-only form — a square
      theme-radius button (replaces the old CircleArrow/CircularArrow). */
  children?: ReactNode;
  /** Secondary line (Figma `username=yes` form): 10px body-font uppercase.
      Without icon it stacks under the label; with icon it right-aligns
      opposite the [icon + label] group. */
  subtext?: ReactNode;
  /** Stretch to fill the container (dropdown rows are full-width). */
  fullWidth?: boolean;
  /** Renders the live treatment at opacity 0.6 and blocks presses. */
  disabled?: boolean;
  /** Leading Material Symbol name — available on every variant. */
  icon?: string;
  iconSize?: number;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

function Subtext({ children, t, color }: { children: ReactNode; t: Theme; color: string }) {
  return (
    <Text
      style={{
        fontFamily: t.fonts.body.regular,
        fontSize: 10,
        lineHeight: 12,
        letterSpacing: t.btn.subtextTracking,
        textTransform: 'uppercase',
        opacity: 0.9,
        color,
      }}
    >
      {children}
    </Text>
  );
}

/**
 * Design-system button — RN port of V200/src/components/ui/Button.tsx (Figma
 * "Buttons", node 397:3561). Three structural variants colored by the active
 * theme's btn/btnSecondary/btnSecondary2 families; `icon`/`disabled`/`subtext`
 * are orthogonal modifiers. Sizing is role-based (primary 56, secondaries 45).
 */
export function Button({
  variant = 'primary',
  onPress,
  children,
  subtext,
  fullWidth = false,
  disabled = false,
  icon,
  iconSize = 24,
  accessibilityLabel,
  style,
}: Props) {
  const { tokens: t } = useTheme();
  const r = resolveButtonStyle(t, variant, disabled);
  const iconOnly = Boolean(icon) && children == null;
  const press = usePressScale();
  const font = t.fonts.btn;

  const labelStyle = {
    fontFamily: font.bold ?? font.regular,
    fontWeight: '600' as const,
    fontSize: 15,
    letterSpacing: r.letterSpacing,
    textTransform: 'uppercase' as const,
    color: r.family.color,
  };

  return (
    <Animated.View style={[press.style, fullWidth ? { alignSelf: 'stretch' } : null]}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        style={[
          {
            backgroundColor: r.family.bg,
            borderRadius: r.family.radius,
            ...borderStyle(r.family.border),
            boxShadow: r.family.shadow,
            filter: r.filter,
            minHeight: r.minHeight,
            width: fullWidth ? '100%' : iconOnly ? r.minHeight : undefined,
            paddingVertical: iconOnly ? 0 : r.padV,
            paddingHorizontal: iconOnly ? 0 : r.padH,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: subtext && icon ? 'space-between' : 'center',
            gap: icon ? 8 : undefined,
            opacity: r.opacity,
          },
          style,
        ]}
      >
        {subtext && !icon ? (
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={labelStyle}>{children}</Text>
            <Subtext t={t} color={r.family.color}>
              {subtext}
            </Subtext>
          </View>
        ) : (
          <>
            {subtext && icon ? (
              // Figma icon+subtext form: [icon label] …space… subtext.
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Icon name={icon} size={iconSize} color={r.family.color} />
                  <Text style={labelStyle}>{children}</Text>
                </View>
                <Subtext t={t} color={r.family.color}>
                  {subtext}
                </Subtext>
              </>
            ) : (
              <>
                {icon ? <Icon name={icon} size={iconSize} color={r.family.color} /> : null}
                {children != null ? <Text style={labelStyle}>{children}</Text> : null}
              </>
            )}
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}
