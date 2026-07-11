import { useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthBanner } from '@/components/journal/auth-banner';
import { AppHeader } from '@/components/nav/app-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useApi } from '@/lib/use-api';
import { useMindmaps } from '@/lib/use-mindmaps';
import { useJournalStore } from '@/state/journal-store';
import { useTheme } from '@/theme';

/**
 * Mindmap landing — RN port of /app/mindmap. hasMap branches into
 * Browse/Reflect cards vs the create CTA. Divergence from web (design D7):
 * the web forces the notepad theme here; mobile keeps the user's mode — the
 * cards are token-correct in all three and forcing a mode would fight the
 * app-level ModeSwitcher. The full map canvas and WOOP wizard stay on the web
 * for now (ticket scope: area cards).
 */
export default function MindmapTab() {
  const router = useRouter();
  const { tokens: t } = useTheme();
  const { isSignedIn } = useApi();
  const { maps } = useMindmaps();
  const { counts } = useJournalStore();

  const eyebrow = (
    <Text
      style={{
        fontFamily: t.fonts.display.bold ?? t.fonts.display.regular,
        fontWeight: '700',
        fontSize: 13,
        letterSpacing: 2,
        textTransform: 'uppercase',
        textAlign: 'center',
        color: t.palette.pink,
      }}
    >
      Minds Shift · Mindmap
    </Text>
  );

  if (!isSignedIn) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.palette.bg }} edges={['top']}>
        <View style={{ padding: 24, gap: 16 }}>
          {eyebrow}
          <AuthBanner />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Button variant="secondary" fullWidth onPress={() => router.push('/(auth)/sign-in')}>
                Log in
              </Button>
            </View>
            <View style={{ flex: 1 }}>
              <Button variant="secondary2" fullWidth onPress={() => router.push('/(auth)/sign-up')}>
                Sign up
              </Button>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const hasMap = maps !== null && maps.length > 0;

  const actionCard = (eyebrowText: string, title: string, body: string, onPress: () => void) => (
    <Card style={{ padding: 18, gap: 6 }}>
      <Text
        style={{
          fontFamily: t.fonts.body.bold ?? t.fonts.body.regular,
          fontWeight: '700',
          fontSize: 11,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          color: t.palette.cyan,
        }}
      >
        {eyebrowText}
      </Text>
      <Text
        style={{
          fontFamily: t.fonts.display.bold ?? t.fonts.display.regular,
          fontWeight: '700',
          fontSize: 21,
          letterSpacing: -0.3,
          color: t.text.h1,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontFamily: t.fonts.body.regular,
          fontSize: 13,
          lineHeight: 19,
          color: t.text.sub,
          marginBottom: 10,
        }}
      >
        {body}
      </Text>
      <Button variant="secondary2" fullWidth onPress={onPress}>
        Open
      </Button>
    </Card>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.palette.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 0, gap: 16 }}>
        <AppHeader entryCount={counts.entries} lensCount={counts.lenses} />
        {eyebrow}
        {maps === null ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator color={t.palette.cyan} />
          </View>
        ) : hasMap ? (
          <>
            {actionCard(
              'Your map',
              'Browse your areas',
              'See every area of life you mapped, milestone by milestone.',
              () => router.push('/mindmap/browse'),
            )}
            {actionCard(
              'Weekly',
              'Reflect on the week',
              'A short check-in against the goals you set.',
              () => router.push('/mindmap/reflect'),
            )}
          </>
        ) : (
          actionCard(
            'Start',
            'Create your mindmap',
            'Map the areas of your life and where the year is going. The guided WOOP wizard lives on the web for now.',
            () => router.push('/mindmap/new'),
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
