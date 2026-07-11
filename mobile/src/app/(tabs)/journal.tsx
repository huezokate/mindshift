import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthBanner } from '@/components/journal/auth-banner';
import { JournalPreviewCard } from '@/components/journal/journal-preview-card';
import { LensPickerSheet } from '@/components/journal/lens-picker-sheet';
import { WelcomeCard } from '@/components/journal/welcome-card';
import { AppHeader } from '@/components/nav/app-header';
import { Button } from '@/components/ui/button';
import { useApi } from '@/lib/use-api';
import { useJournalStore, type JournalFilter } from '@/state/journal-store';
import { useTheme } from '@/theme';

/**
 * Journal list — RN port of /app/journal-v2 (JournalV2Client). FlatList
 * paging replaces the web's IntersectionObserver sentinel; pull-to-refresh is
 * the native extra. Anon users get the sign-in pitch (the web redirects to
 * /sign-in; a tab can't redirect, so the gate renders in place).
 */
export default function JournalTab() {
  const router = useRouter();
  const { mode, tokens: t } = useTheme();
  const { isSignedIn } = useApi();
  const store = useJournalStore();

  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const [addingLens, setAddingLens] = useState(false);
  const [addLensError, setAddLensError] = useState<string | null>(null);
  const loadedOnce = useRef(false);

  useEffect(() => {
    if (isSignedIn && !loadedOnce.current) {
      loadedOnce.current = true;
      void store.refresh();
    }
    if (!isSignedIn) loadedOnce.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);

  if (!isSignedIn) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.palette.bg }} edges={['top']}>
        <View style={{ padding: 24, gap: 16 }}>
          <AuthBanner reason="journal" />
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

  async function handleSeed() {
    setSeeding(true);
    setSeedMsg(null);
    try {
      await store.seedDemo();
    } catch {
      setSeedMsg('Could not load the demo entries. Please try again.');
    } finally {
      setSeeding(false);
    }
  }

  async function handlePickLens(figureId: string) {
    if (!pickerFor) return;
    setAddingLens(true);
    setAddLensError(null);
    try {
      await store.applyLensToEntry(pickerFor, figureId, mode);
      setPickerFor(null);
    } catch (e) {
      setAddLensError(e instanceof Error ? e.message : 'Could not add the lens.');
    } finally {
      setAddingLens(false);
    }
  }

  const filterTab = (f: JournalFilter, label: string) => {
    const active = store.filter === f;
    return (
      <Pressable
        key={f}
        onPress={() => store.setFilter(f)}
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        style={{
          paddingVertical: 6,
          paddingHorizontal: 14,
          borderBottomWidth: 2,
          borderBottomColor: active ? t.palette.cyan : 'transparent',
        }}
      >
        <Text
          style={{
            fontFamily: t.fonts.body.bold ?? t.fonts.body.regular,
            fontWeight: '700',
            fontSize: 12,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: active ? t.palette.cyan : t.text.sub,
          }}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  const empty = !store.loading ? (
    store.filter === 'all' ? (
      <WelcomeCard onLoadDemo={handleSeed} seeding={seeding} seedMsg={seedMsg} />
    ) : (
      <Text
        style={{
          fontFamily: t.fonts.body.regular,
          fontSize: 13,
          textAlign: 'center',
          color: t.text.sub,
          paddingVertical: 24,
        }}
      >
        Nothing saved yet — favorite a lens response and it lands here.
      </Text>
    )
  ) : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.palette.bg }} edges={['top']}>
      <FlatList
        data={store.entries}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ padding: 24, paddingTop: 0, gap: 16 }}
        ListHeaderComponent={
          <View style={{ gap: 16, paddingBottom: 4 }}>
            <AppHeader entryCount={store.counts.entries} lensCount={store.counts.lenses} />
            <Button variant="primary" fullWidth onPress={() => router.push('/onboarding')}>
              Vent it out
            </Button>
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
              {filterTab('all', 'All')}
              {filterTab('favorites', 'Favorites')}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <JournalPreviewCard
            entry={item}
            onPress={(id) => router.push(`/journal/${id}`)}
            onAddLens={(id) => {
              setAddLensError(null);
              setPickerFor(id);
            }}
          />
        )}
        ListEmptyComponent={empty}
        onEndReached={() => {
          if (store.hasMore && !store.loading) void store.fetchPage();
        }}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={t.palette.cyan}
            onRefresh={() => {
              setRefreshing(true);
              store.refresh().finally(() => setRefreshing(false));
            }}
          />
        }
      />

      {/* Add-lens picker — shared composite; error keeps the sheet open. */}
      <LensPickerSheet
        open={pickerFor !== null}
        loading={addingLens}
        selectLabel="Add lens"
        error={addLensError}
        onBack={() => setPickerFor(null)}
        onSelect={(figureId) => void handlePickLens(figureId)}
      />
    </SafeAreaView>
  );
}
