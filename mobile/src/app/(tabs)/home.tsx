import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionCard } from '@/components/home/action-card';
import { EntryAuthRow } from '@/components/nav/entry-auth-row';
import { AppHeader } from '@/components/nav/app-header';
import { useJournalStore } from '@/state/journal-store';
import { useTheme } from '@/theme';

/**
 * Returning-user hub — RN port of /app/home: welcome header + three action
 * cards (New vent / Visit your map / Open journal). Anon users see the entry
 * auth row instead of the greeting (web sends anon to theme-select; the tab
 * renders a friendly variant in place).
 */
export default function HomeTab() {
  const router = useRouter();
  const { tokens: t } = useTheme();
  const { isSignedIn, user } = useUser();
  const store = useJournalStore();

  useEffect(() => {
    if (isSignedIn) void store.refreshCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);

  const firstName = user?.firstName ?? null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.palette.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32, gap: 24 }}>
        <AppHeader entryCount={store.counts.entries} lensCount={store.counts.lenses} />

        <View style={{ gap: 6 }}>
          <Text
            style={{
              fontFamily: t.fonts.body.bold ?? t.fonts.body.regular,
              fontWeight: '700',
              fontSize: 11,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: t.palette.pink,
            }}
          >
            {isSignedIn
              ? firstName
                ? `Welcome back, ${firstName}`
                : 'Welcome back'
              : 'Welcome'}
          </Text>
          <Text
            style={{
              fontFamily: t.fonts.display.bold ?? t.fonts.display.regular,
              fontWeight: '700',
              fontSize: 30,
              lineHeight: 34,
              letterSpacing: -0.5,
              color: t.text.h1,
            }}
          >
            Where to today?
          </Text>
        </View>

        <View style={{ gap: 14 }}>
          <ActionCard
            eyebrow="Start"
            title="New vent"
            body="Something on your mind? Vent it and pick a lens."
            onPress={() => router.push('/onboarding')}
          />
          <ActionCard
            eyebrow="Your map"
            title="Visit your map"
            body="See your areas of life and how the year is moving."
            onPress={() => router.push('/(tabs)/mindmap')}
          />
          <ActionCard
            eyebrow="Archive"
            title="Open journal"
            body="Every reflection you’ve saved, in one place."
            onPress={() => router.push('/(tabs)/journal')}
          />
        </View>

        {!isSignedIn && <EntryAuthRow />}
      </ScrollView>
    </SafeAreaView>
  );
}
