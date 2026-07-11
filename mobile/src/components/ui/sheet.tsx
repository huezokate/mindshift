import type { ReactNode } from 'react';
import { Modal, Pressable, View } from 'react-native';
import Animated, { FadeIn, Keyframe, SlideInDown } from 'react-native-reanimated';

import { borderStyle, useTheme } from '@/theme';

/**
 * Overlay surface primitive — the shared shape behind the web's two sheet
 * implementations (no abstraction exists there):
 *   • ShareSheet    → position "bottom", chrome "fcard", scrim rgba(0,0,0,0.6)
 *   • LensPicker    → position "center", chrome "card",  scrim rgba(0,0,0,0.45)
 * The full composites (carousel, quote canvas) are T-030-04 screen work.
 * Scrim values are web-parity literals — they aren't tokens on web either
 * (S-030 port-map note: fix the muddy kawaii/notepad scrim as a token on web
 * first; this inherits automatically once it lands in the token layer).
 */

// Web LensPicker card reveal: opacity 0→1, scale 0.94→1, y 8→0, 160ms.
const centerIn = new Keyframe({
  0: { opacity: 0, transform: [{ scale: 0.94 }, { translateY: 8 }] },
  100: { opacity: 1, transform: [{ scale: 1 }, { translateY: 0 }] },
}).duration(160);

export function Sheet({
  open,
  onClose,
  position = 'bottom',
  chrome = 'fcard',
  children,
}: {
  open: boolean;
  onClose: () => void;
  position?: 'bottom' | 'center';
  chrome?: 'card' | 'fcard';
  children: ReactNode;
}) {
  const { tokens: t } = useTheme();
  if (!open) return null;

  const isBottom = position === 'bottom';
  const family = chrome === 'card' ? t.card : t.fcard;
  const panelStyle = {
    backgroundColor: family.bg,
    borderRadius: family.radius,
    ...borderStyle(family.border),
    filter: family.filter,
    boxShadow: chrome === 'card' ? t.card.shadow : t.fcard.inset,
  };

  return (
    <Modal transparent statusBarTranslucent visible animationType="none" onRequestClose={onClose}>
      <Animated.View
        entering={FadeIn.duration(180)}
        style={{
          flex: 1,
          backgroundColor: isBottom ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.45)',
          justifyContent: isBottom ? 'flex-end' : 'center',
          padding: isBottom ? 0 : 24,
        }}
      >
        <Pressable
          accessibilityLabel="Close"
          onPress={onClose}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
        <Animated.View
          entering={isBottom ? SlideInDown.duration(220) : centerIn}
          style={
            isBottom
              ? [panelStyle, { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }]
              : panelStyle
          }
        >
          <View style={{ padding: 20 }}>{children}</View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
