import type { ViewStyle } from 'react-native';

import type { BorderSet, Side } from './types';

/** Spread a parsed BorderSet into RN per-side border styles. */
export function borderStyle(b: BorderSet): ViewStyle {
  return {
    borderStyle: 'solid',
    borderTopWidth: b.top?.width ?? 0,
    borderTopColor: b.top?.color,
    borderLeftWidth: b.left?.width ?? 0,
    borderLeftColor: b.left?.color,
    borderRightWidth: b.right?.width ?? 0,
    borderRightColor: b.right?.color,
    borderBottomWidth: b.bottom?.width ?? 0,
    borderBottomColor: b.bottom?.color,
  };
}

/** Uniform border (fig cards, focus ring, switcher) from a single Side. */
export function sideStyle(s: Side): ViewStyle {
  if (!s) return {};
  return { borderStyle: 'solid', borderWidth: s.width, borderColor: s.color };
}
