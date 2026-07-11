import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

import { Icon } from '../ui/icon';

/** "Upcoming" pill (Figma 602:6889) — release_alert bell + caption in the
    pink accent slot. RN port of V200/src/components/journal/UpcomingChip.tsx. */
export function UpcomingChip() {
  const { tokens: t } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 4,
        backgroundColor: t.palette.bg,
        borderWidth: 2,
        borderColor: t.palette.pink,
        borderRadius: 8,
        paddingVertical: 2,
        paddingHorizontal: 4,
      }}
    >
      <Icon name="release_alert" size={12} color={t.palette.pink} />
      <Text
        style={{
          fontFamily: t.fonts.body.regular,
          fontSize: 10,
          lineHeight: 12,
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: t.palette.pink,
        }}
      >
        upcoming
      </Text>
    </View>
  );
}
