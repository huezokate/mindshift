/* eslint-disable react-hooks/immutability -- Reanimated shared values are
   mutated via .value by design; the rule has no knowledge of worklets. */
import {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

/**
 * Shared Reanimated motion recipes, ported from the web's CSS/framer-motion
 * equivalents. Every hook honors the system reduce-motion setting.
 */

/** The `.ds-btn` press spring (globals.css): active scale 0.93 in 80ms,
    springy overshoot back — the cubic-bezier(0.34,1.56,0.64,1) feel. */
export function usePressScale() {
  const scale = useSharedValue(1);
  const reduced = useReducedMotion();
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const onPressIn = () => {
    if (!reduced) scale.value = withTiming(0.93, { duration: 80 });
  };
  const onPressOut = () => {
    if (!reduced) scale.value = withSpring(1, { damping: 12, stiffness: 320 });
  };
  return { style, onPressIn, onPressOut };
}

/** The response-page Save pop: scale [1, 1.3, 0.92, 1] (web
    useAnimationControls). Attach `style` to the animated wrapper and call
    `trigger()` on save. */
export function useSavePop() {
  const scale = useSharedValue(1);
  const reduced = useReducedMotion();
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const trigger = () => {
    if (reduced) return;
    scale.value = withSequence(
      withTiming(1.3, { duration: 120 }),
      withTiming(0.92, { duration: 100 }),
      withTiming(1, { duration: 100 }),
    );
  };
  return { style, trigger };
}
