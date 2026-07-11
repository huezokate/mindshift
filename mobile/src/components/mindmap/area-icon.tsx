import { Svg, Path } from 'react-native-svg';

import { useTheme } from '@/theme';

import { AREA_PATHS, type AreaId } from './area-icon-paths';

/** Life-area glyph — RN port of V200/src/components/mindmap/AreaIcon.tsx.
    Web inherits currentColor; here the default is the theme heading color. */
export function AreaIcon({ id, size = 24, color }: { id: AreaId; size?: number; color?: string }) {
  const { tokens: t } = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d={AREA_PATHS[id]} fill={color ?? t.text.h1} />
    </Svg>
  );
}
