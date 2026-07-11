import { ColorValue, Text } from 'react-native';

/**
 * Material Symbols Rounded glyph, rendered by ligature name (e.g. "home",
 * "edit", "person") — same single-icon-source rule as the web Icon component.
 * Variable-axis control (fill/weight/grade) is T-030-03's problem; this renders
 * the font's default instance.
 */
export function MsIcon({ name, size = 24, color = '#e8f6f8' }: { name: string; size?: number; color?: ColorValue }) {
  return (
    <Text style={{ fontFamily: 'MaterialSymbolsRounded', fontSize: size, color, lineHeight: size }}>
      {name}
    </Text>
  );
}
