import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/theme';

/**
 * Chat bubbles — RN port of ChatScreen's inline `chatBubble` helper
 * (V200/src/components/journal/ChatScreen.tsx). EVERY turn has a voice: the
 * user "speaks" (speech bubble + tail, --chat-user-accent) and the lens
 * "thinks" (thought bubble + trailing clouds, --chat-lens-accent). The accents
 * are dedicated tokens because raw --cyan/--pink collapse to one magenta in
 * kawaii.
 */
export function ChatBubble({ role, children }: { role: 'user' | 'lens'; children: ReactNode }) {
  const { tokens: t } = useTheme();
  const mine = role === 'user';
  const surface = mine ? t.btnSecondary.bg : t.card.bg;
  const accent = mine ? t.chat.userAccent : t.chat.lensAccent;

  return (
    <View
      style={{
        flexDirection: mine ? 'row-reverse' : 'row',
        // Extra room below lens bubbles so the thought trail doesn't crowd the next.
        marginBottom: mine ? 0 : 16,
      }}
    >
      <View
        style={{
          maxWidth: '76%',
          backgroundColor: surface,
          borderWidth: 1.5,
          borderColor: accent,
          borderRadius: t.input.radius,
          paddingVertical: 10,
          paddingHorizontal: 14,
        }}
      >
        <Text
          style={{
            fontFamily: t.fonts.body.regular,
            fontSize: 15,
            lineHeight: 21,
            color: t.text.body,
          }}
        >
          {children}
        </Text>
        {mine ? (
          // Speech tail — a small pointer off the bottom-right (the speaker's side).
          <View
            style={{
              position: 'absolute',
              right: 12,
              bottom: -6,
              width: 11,
              height: 11,
              backgroundColor: surface,
              borderRightWidth: 1.5,
              borderBottomWidth: 1.5,
              borderColor: accent,
              borderBottomRightRadius: 2,
              transform: [{ rotate: '45deg' }],
            }}
          />
        ) : (
          // Thought trail — two shrinking clouds drifting toward the avatar.
          <>
            <View
              style={{
                position: 'absolute',
                left: 12,
                bottom: -8,
                width: 9,
                height: 9,
                borderRadius: 4.5,
                backgroundColor: surface,
                borderWidth: 1.5,
                borderColor: accent,
              }}
            />
            <View
              style={{
                position: 'absolute',
                left: 4,
                bottom: -16,
                width: 5,
                height: 5,
                borderRadius: 2.5,
                backgroundColor: surface,
                borderWidth: 1.5,
                borderColor: accent,
              }}
            />
          </>
        )}
      </View>
    </View>
  );
}

function Dot({ index, color }: { index: number; color: string }) {
  const reduced = useReducedMotion();
  const opacity = useSharedValue(0.3);
  const y = useSharedValue(0);

  // Web: opacity [0.3, 1, 0.3] + y [0, -2, 0], 0.9s loop, 0.18s stagger.
  useEffect(() => {
    if (reduced) return;
    opacity.value = withDelay(
      index * 180,
      withRepeat(
        withSequence(withTiming(1, { duration: 450 }), withTiming(0.3, { duration: 450 })),
        -1,
      ),
    );
    y.value = withDelay(
      index * 180,
      withRepeat(
        withSequence(withTiming(-2, { duration: 450 }), withTiming(0, { duration: 450 })),
        -1,
      ),
    );
  }, [index, opacity, y, reduced]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y.value }],
  }));

  return (
    <Animated.View
      style={[{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }, style]}
    />
  );
}

/** The lens-is-thinking indicator (web `typingDots`). */
export function TypingDots() {
  const { tokens: t } = useTheme();
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: t.card.bg,
        borderWidth: 1,
        borderColor: t.input.divider,
        borderRadius: t.input.radius,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
      }}
    >
      {[0, 1, 2].map((i) => (
        <Dot key={i} index={i} color={t.text.sub} />
      ))}
    </View>
  );
}
