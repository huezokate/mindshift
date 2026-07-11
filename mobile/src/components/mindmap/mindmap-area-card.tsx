import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

import { AreaIcon } from './area-icon';
import { AREA_LABELS, AREA_PROMPTS, type AreaId } from './area-icon-paths';

/**
 * Themed life-area card for the mind-map canvas — RN port of
 * V200/src/components/mindmap/MindmapAreaCard.tsx. Selected state swaps the
 * pink border for green and fills with --mm-card-bg-selected.
 */
export function MindmapAreaCard({
  area,
  body,
  milestones,
  actions,
  selected = false,
  width = 331,
}: {
  area: AreaId;
  body?: string;
  milestones: number;
  actions: number;
  selected?: boolean;
  width?: number;
}) {
  const { tokens: t } = useTheme();
  const accent = selected ? t.palette.green : t.palette.cyan;
  return (
    <View
      style={{
        width,
        backgroundColor: selected ? t.mmCardBgSelected : t.card.bg,
        borderWidth: 1.5,
        borderColor: selected ? t.palette.green : t.palette.pink,
        borderRadius: t.card.radius,
        filter: t.card.filter,
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <AreaIcon id={area} size={22} color={accent} />
        <Text
          style={{
            fontFamily: t.fonts.display.bold ?? t.fonts.display.regular,
            fontWeight: '700',
            fontSize: 18,
            letterSpacing: -0.3,
            color: t.text.h1,
          }}
        >
          {AREA_LABELS[area]}
        </Text>
      </View>
      <Text
        style={{
          fontFamily: t.fonts.body.regular,
          fontSize: 13,
          lineHeight: 19,
          color: t.text.sub,
        }}
      >
        {body ?? AREA_PROMPTS[area]}
      </Text>
      <View style={{ gap: 2, marginTop: 2 }}>
        <Text
          style={{
            fontFamily: t.fonts.body.bold ?? t.fonts.body.regular,
            fontWeight: '700',
            fontSize: 11,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            color: t.palette.cyan,
          }}
        >
          {milestones} major milestone{milestones === 1 ? '' : 's'}
        </Text>
        <Text style={{ fontFamily: t.fonts.body.regular, fontSize: 12, color: t.text.sub }}>
          {actions} actions planned
        </Text>
      </View>
    </View>
  );
}
