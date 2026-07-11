import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Share,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LensCard } from '@/components/journal/lens-card';
import { LensPickerSheet } from '@/components/journal/lens-picker-sheet';
import { UpcomingChip } from '@/components/journal/upcoming-chip';
import { Icon } from '@/components/ui/icon';
import { useApi } from '@/lib/use-api';
import type { JournalEntryFull, LensResponseFull } from '@/lib/journal-map';
import { useJournalStore } from '@/state/journal-store';
import { borderStyle, useTheme, type Theme } from '@/theme';

/**
 * Entry detail — RN port of V200 EntryDetail.tsx (Figma 469:4275 / 602:6521).
 * Vent card + "+ Lens", horizontal snap carousel of lens cards with page
 * dots, per-lens action row (Chat · Decorate[upcoming] · Socials).
 */

/** The web's primary [icon over label] stack button (--btn-* family).
    Kawaii renders icon-only round pills (web 470:2664). */
function StackButton({
  icon,
  label,
  onPress,
  disabled,
  t,
  iconOnly,
  accessibilityLabel,
}: {
  icon: string;
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  t: Theme;
  iconOnly: boolean;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      style={{
        backgroundColor: t.btn.bg,
        ...borderStyle(t.btn.border),
        borderRadius: t.btn.radius,
        boxShadow: t.btn.shadow,
        filter: t.btn.filter,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: iconOnly ? 15 : 9,
        minHeight: iconOnly ? 54 : 44,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <Icon name={icon} size={24} color={t.btn.color} />
      {iconOnly ? null : (
        <Text
          style={{
            fontFamily: t.fonts.btn.bold ?? t.fonts.btn.regular,
            fontWeight: '600',
            fontSize: 14,
            letterSpacing: t.btn.letterSpacing,
            lineHeight: 16,
            textTransform: 'uppercase',
            textAlign: 'center',
            color: t.btn.color,
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export default function EntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { mode, tokens: t } = useTheme();
  const { api } = useApi();
  const store = useJournalStore();
  const { width: screenW } = useWindowDimensions();

  const isKawaii = mode === 'kawaii';
  const isCyberpunk = mode === 'cyberpunk';

  // Cache-first; cold deep links page through the list endpoint (D4).
  const cached = store.getEntry(id);
  const [fetched, setFetched] = useState<JournalEntryFull | null>(null);
  const [missing, setMissing] = useState(false);
  const entry = cached ?? fetched ?? null;

  useEffect(() => {
    if (cached || fetched || missing || !id) return;
    let alive = true;
    store
      .fetchEntry(id)
      .then((e) => {
        if (!alive) return;
        if (e) setFetched(e);
        else setMissing(true);
      })
      .catch(() => alive && setMissing(true));
    return () => {
      alive = false;
    };
  }, [cached, fetched, missing, id, store]);

  const [activeLens, setActiveLens] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [addingLens, setAddingLens] = useState(false);
  const [addLensError, setAddLensError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  // Carousel geometry (web: card = width - 48, 8px gap, 24px insets).
  const cardW = screenW - 72;
  const page = cardW + 8;

  async function handlePickLens(figureId: string) {
    if (!entry || addingLens) return;
    setAddingLens(true);
    setAddLensError(null);
    try {
      const lens = await store.applyLensToEntry(entry, figureId, mode);
      // Deep-linked (uncached) copies merge the new lens locally.
      if (!cached) {
        setFetched((cur) =>
          cur
            ? {
                ...cur,
                responses: [...cur.responses.filter((r) => r.figureId !== figureId), lens],
                lenses: [
                  ...cur.lenses.filter((l) => l.figureId !== figureId),
                  { figureId: lens.figureId, figureName: lens.figureName },
                ],
              }
            : cur,
        );
      }
      setPickerOpen(false);
      // Center the carousel on the new (last) lens once it has rendered.
      const last = entry.responses.filter((r) => r.figureId !== figureId).length;
      setActiveLens(last);
      setTimeout(() => scrollRef.current?.scrollTo({ x: last * page, animated: true }), 50);
    } catch (err) {
      setAddLensError(err instanceof Error ? err.message : 'Could not add the lens.');
    } finally {
      setAddingLens(false);
    }
  }

  function openChat(lens: LensResponseFull) {
    router.push(`/journal/${id}/chat/${lens.figureId}`);
  }

  // Minimal native text share (D8) — the quote-card sheet is T-030-05.
  async function handleShare(lens: LensResponseFull) {
    const result = await Share.share({
      message: `“${lens.responseText}”\n— ${lens.figureName}, via Minds Shift`,
    });
    if (result.action === Share.sharedAction) {
      api(`/api/journal-v2/responses/${lens.id}/share`, {
        method: 'POST',
        body: { platform: 'native' },
      }).catch(() => {});
    }
  }

  if (!entry) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.palette.bg }} edges={['bottom']}>
        <Stack.Screen options={{ title: 'Entry' }} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          {missing ? (
            <Text style={{ fontFamily: t.fonts.body.regular, fontSize: 14, color: t.text.sub }}>
              This entry could not be found.
            </Text>
          ) : (
            <ActivityIndicator color={t.palette.cyan} />
          )}
        </View>
      </SafeAreaView>
    );
  }

  const buttonRow = (lens: LensResponseFull): ReactNode => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        gap: isKawaii ? 8 : 4,
        width: '100%',
        zIndex: 2,
      }}
    >
      <StackButton
        icon="comic_bubble"
        label="Chat with lens"
        iconOnly={isKawaii}
        t={t}
        onPress={() => openChat(lens)}
        accessibilityLabel={`Chat with ${lens.figureName}`}
      />
      <View>
        <StackButton icon="palette" label="Decorate" iconOnly={isKawaii} t={t} disabled />
        <View style={{ position: 'absolute', top: -9, right: -4, zIndex: 1 }}>
          <UpcomingChip />
        </View>
      </View>
      <StackButton
        icon="ios_share"
        label="Socials"
        iconOnly={isKawaii}
        t={t}
        onPress={() => void handleShare(lens)}
        accessibilityLabel="Share this lens to social media"
      />
    </View>
  );

  const lensItem = (lens: LensResponseFull) => (
    <View>
      <View style={{ marginBottom: -4, zIndex: 1 }}>
        <LensCard response={lens} />
      </View>
      {buttonRow(lens)}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.palette.bg }} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Entry' }} />
      <ScrollView contentContainerStyle={{ paddingVertical: 16, gap: 16 }}>
        {/* Vent card + "+ Lens" (right-aligned, -4px overlap) */}
        <View style={{ paddingHorizontal: 24, alignItems: 'flex-end' }}>
          <View
            style={{
              width: '100%',
              marginBottom: -4,
              zIndex: 1,
              filter: isCyberpunk || isKawaii ? undefined : t.card.filter,
            }}
          >
            <View
              style={{
                backgroundColor: t.card.bg,
                ...borderStyle(t.input.border),
                borderRadius: t.input.radius,
                boxShadow: t.input.shadow,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  backgroundColor: isKawaii ? t.input.headerBg : 'transparent',
                  paddingTop: 8,
                  paddingBottom: isKawaii ? 4 : 2,
                  paddingHorizontal: 16,
                  borderBottomWidth: t.input.border.bottom?.width ?? 1,
                  borderBottomColor: t.input.border.bottom?.color,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: t.fonts.body.bold ?? t.fonts.body.regular,
                    fontWeight: isCyberpunk || isKawaii ? '700' : '600',
                    fontSize: 12,
                    letterSpacing: isCyberpunk ? 1.32 : 0.55,
                    lineHeight: 14,
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    color: isKawaii ? t.text.body : t.palette.cyan,
                  }}
                >
                  {entry.title}
                </Text>
              </View>
              <View
                style={{
                  paddingVertical: 4,
                  paddingLeft: 16,
                  paddingRight: isKawaii ? 8 : 16,
                }}
              >
                <Text
                  style={{
                    fontFamily: t.fonts.body.regular,
                    fontSize: 14,
                    lineHeight: 20,
                    letterSpacing: isCyberpunk || isKawaii ? 0.52 : 0.18,
                    color: isCyberpunk ? t.text.sub : t.text.body,
                  }}
                >
                  {entry.ventText}
                </Text>
              </View>
            </View>
          </View>
          <View style={{ zIndex: 2 }}>
            <StackButton
              icon="add"
              label="Lens"
              iconOnly={false}
              t={t}
              onPress={() => {
                setAddLensError(null);
                setPickerOpen(true);
              }}
              accessibilityLabel="Add a lens to this entry"
            />
          </View>
        </View>

        {/* Lens carousel — single lens renders full-width, no plumbing. */}
        {entry.responses.length === 0 ? null : entry.responses.length === 1 ? (
          <View style={{ paddingHorizontal: 24 }}>{lensItem(entry.responses[0])}</View>
        ) : (
          <>
            <ScrollView
              ref={scrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={page}
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / page);
                setActiveLens(Math.min(Math.max(idx, 0), entry.responses.length - 1));
              }}
            >
              {entry.responses.map((lr) => (
                <View key={lr.id} style={{ width: cardW }}>
                  {lensItem(lr)}
                </View>
              ))}
            </ScrollView>

            {/* Page dots — one per lens, tappable. */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 6,
                paddingTop: 2,
              }}
            >
              {entry.responses.map((lr, i) => {
                const active = i === activeLens;
                return (
                  <Pressable
                    key={lr.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Go to lens ${i + 1} of ${entry.responses.length}`}
                    hitSlop={12}
                    onPress={() => {
                      scrollRef.current?.scrollTo({ x: i * page, animated: true });
                      setActiveLens(i);
                    }}
                    style={{
                      width: active ? 18 : 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: active ? t.palette.violet : t.text.meta,
                    }}
                  />
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      {/* Add-a-lens picker — shared carousel; Back returns to this entry. */}
      <LensPickerSheet
        open={pickerOpen}
        startIndex={0}
        loading={addingLens}
        error={addLensError}
        selectLabel="Add lens"
        onBack={() => {
          setPickerOpen(false);
          setAddLensError(null);
        }}
        onSelect={(figureId) => void handlePickLens(figureId)}
      />
    </SafeAreaView>
  );
}
