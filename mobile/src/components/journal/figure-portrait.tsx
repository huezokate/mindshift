import { Image } from 'expo-image';
import { useState } from 'react';
import { View } from 'react-native';

import { portraitUrl } from '@/lib/figures';
import { sideStyle, useTheme, type Side } from '@/theme';

import { LensAvatar } from './lens-avatar';

/**
 * Circular figure portrait on the theme's avatar gradient. Portraits are NOT
 * bundled — they stream from the backend's /portraits/{mode}/{id}.png (26MB
 * of art stays out of the binary; expo-image caches on disk). While loading —
 * or if the asset can't be reached — the LensAvatar initial-on-gradient
 * renders underneath, so the tile is never blank.
 */
export function FigurePortrait({
  figureId,
  name,
  size,
  ring,
  shadow,
}: {
  figureId: string;
  name: string;
  size: number;
  ring: Side;
  shadow?: string;
}) {
  const { mode } = useTheme();
  const [failed, setFailed] = useState(false);

  return (
    <View style={{ width: size, height: size }}>
      <LensAvatar name={name} size={size} ring={ring} shadow={shadow} />
      {!failed && (
        <View
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            overflow: 'hidden',
            ...sideStyle(ring),
          }}
        >
          <Image
            source={{ uri: portraitUrl(figureId, mode) }}
            onError={() => setFailed(true)}
            transition={150}
            contentFit="cover"
            style={{ width: '100%', height: '100%' }}
          />
        </View>
      )}
    </View>
  );
}
