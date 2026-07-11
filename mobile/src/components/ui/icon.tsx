import { Text, type ColorValue } from 'react-native';

import { useTheme } from '@/theme';

/**
 * Single icon primitive for the whole app — a Material Symbols Rounded glyph
 * by ligature name, the RN twin of V200/src/components/ui/Icon.tsx (the ONLY
 * icon source; no custom SVGs except the mindmap AreaIcon set).
 *
 * The web component drives the variable axes (FILL 1 / wght 700); RN has no
 * fontVariationSettings style, so fidelity is handled at the font-asset level
 * (the bundled TTF is pinned to Kate's icon spec where the toolchain allows).
 */
export function Icon({
  name,
  size = 24,
  color,
  label,
}: {
  name: string;
  size?: number;
  color?: ColorValue;
  /** Accessibility label; omitted = decorative (hidden from screen readers). */
  label?: string;
}) {
  const { tokens } = useTheme();
  return (
    <Text
      accessible={Boolean(label)}
      accessibilityLabel={label}
      style={{
        fontFamily: 'MaterialSymbolsRounded',
        fontSize: size,
        lineHeight: size,
        color: color ?? tokens.text.body,
      }}
    >
      {name}
    </Text>
  );
}
