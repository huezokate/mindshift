import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { useTheme } from '@/theme';

import { brandFor, OWN_TILE, SOCIAL_SVG, type SharePlatform } from './social-svgs';

/**
 * Brand share glyphs — RN port of V200/src/components/journal/SocialIcon.tsx
 * (Figma 579:6074). Per-theme artwork inlined in social-svgs.ts. Tile chrome
 * per Figma: instagram/facebook sit on a 4px-radius tile (kawaii uses the
 * input header mint, others the page bg); tiktok/sms bake their own tile.
 */
export function SocialIcon({ platform, size = 16 }: { platform: SharePlatform; size?: number }) {
  const { mode, tokens: t } = useTheme();
  const brand = brandFor(platform);
  const needsTile = !OWN_TILE.has(brand);
  const glyph = needsTile ? Math.round(size * 0.9) : size;
  return (
    <View
      accessibilityLabel={`Shared to ${platform}`}
      style={{
        width: size,
        height: size,
        borderRadius: 4,
        backgroundColor: needsTile ? (mode === 'kawaii' ? t.input.headerBg : t.palette.bg) : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <SvgXml xml={SOCIAL_SVG[mode][brand]} width={glyph} height={glyph} />
    </View>
  );
}
