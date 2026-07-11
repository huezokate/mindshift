import { Stack } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MindmapAreaCard } from '@/components/mindmap/mindmap-area-card';
import { useMindmaps } from '@/lib/use-mindmaps';
import { useTheme } from '@/theme';

/**
 * Browse goals — RN port of /app/mindmap/browse: one MindmapAreaCard per
 * saved goal with milestone progress, grouped under the map's horizon.
 */
export default function MindmapBrowse() {
  const { tokens: t } = useTheme();
  const { maps } = useMindmaps();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.palette.bg }} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Browse goals' }} />
      <ScrollView contentContainerStyle={{ padding: 24, gap: 16, alignItems: 'center' }}>
        {maps === null ? (
          <ActivityIndicator color={t.palette.cyan} style={{ paddingVertical: 40 }} />
        ) : maps.length === 0 ? (
          <Text
            style={{
              fontFamily: t.fonts.body.regular,
              fontSize: 14,
              lineHeight: 20,
              textAlign: 'center',
              color: t.text.sub,
              paddingVertical: 40,
            }}
          >
            No mindmap yet — create one to see your areas of life here.
          </Text>
        ) : (
          maps.map((map) => (
            <View key={map.id} style={{ gap: 12, alignItems: 'center', width: '100%' }}>
              <Text
                style={{
                  fontFamily: t.fonts.display.bold ?? t.fonts.display.regular,
                  fontWeight: '700',
                  fontSize: 13,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  color: t.palette.pink,
                }}
              >
                {map.title ?? map.horizonLabel}
              </Text>
              {map.goals.map((goal) => {
                const total = goal.milestones.length;
                const done = goal.milestones.filter((m) => m.status === 'done').length;
                return (
                  <View key={goal.id} style={{ gap: 4, alignItems: 'center' }}>
                    <MindmapAreaCard
                      area={goal.category}
                      body={goal.outcome}
                      milestones={total}
                      actions={done}
                    />
                    <Text
                      style={{
                        fontFamily: t.fonts.body.regular,
                        fontSize: 11,
                        letterSpacing: 0.6,
                        textTransform: 'uppercase',
                        color: t.text.sub,
                      }}
                    >
                      {done}/{total} milestones done
                      {total ? ` · ${Math.round((done / total) * 100)}%` : ''}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
