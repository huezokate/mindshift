import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FigurePortrait } from '@/components/journal/figure-portrait';
import { LensPickerSheet } from '@/components/journal/lens-picker-sheet';
import { LimitCard, type LimitKind } from '@/components/journal/limit-card';
import { Card } from '@/components/ui/card';
import { loadAnonLimits, saveAnonLimits } from '@/lib/anon-limits';
import { checkAnonLimits, todayKey, trackAnonLens } from '@/lib/anon-limits-logic';
import { ApiError } from '@/lib/api';
import { FIGURES, figureById } from '@/lib/figures';
import { useApi } from '@/lib/use-api';
import { getVentLabel } from '@/lib/vent-label';
import { useVentFlow } from '@/state/vent-flow';
import { borderStyle, sideStyle, useTheme } from '@/theme';

const MAX_CHARS = 800;

// Web parity fallback so the screen still demos when entered directly.
const DEMO_VENT =
  "I keep second-guessing my career choice. Everyone around me seems so sure about what they're doing, but I'm constantly wondering if I chose the right path. Maybe I need a completely fresh perspective on all of this.";

export default function LensScreen() {
  const router = useRouter();
  const { tokens: t } = useTheme();
  const { api, isSignedIn } = useApi();
  const flow = useVentFlow();
  const vent = flow.vent ?? DEMO_VENT;

  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [limitError, setLimitError] = useState<LimitKind | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  async function handleGetPerspective(figureId: string) {
    if (loading) return;
    setLimitError(null);
    setGenError(null);

    // Anonymous limit check — client-side only, exactly like the web's
    // localStorage gate (the server does not rate-limit anon callers).
    if (!isSignedIn) {
      const limits = await loadAnonLimits();
      const kind = checkAnonLimits(limits, todayKey(), vent);
      if (kind) {
        setLimitError(kind);
        return;
      }
    }

    setLoading(true);
    setSelected(figureId);
    const figure = figureById(figureId)!;
    const isNewQuote = !flow.sessionId;

    try {
      const data = await api<{ response: string; tier: string }>('/api/generate-response', {
        method: 'POST',
        // No systemPrompt: the server resolves the persona from figureId.
        body: { prompt: vent, figureId: figure.id, isNewQuote },
      });
      const text = (data.response ?? '').trim();
      if (!text) {
        setGenError('The lens came back empty. Please try again.');
        setLoading(false);
        setSelected(null);
        return;
      }
      flow.setLensResult(figure.id, figure.name, text);
      if (!isSignedIn) {
        await saveAnonLimits(trackAnonLens(await loadAnonLimits(), todayKey(), vent));
      }
    } catch (e) {
      if (e instanceof ApiError && e.status === 429) {
        // Server reports the limit kind in `limitType` ('lenses' | 'quotes');
        // the daily-quote cap maps onto the 'vents' copy bucket (web parity).
        const body = e.body as { limitType?: string } | null;
        setLimitError(body?.limitType === 'lenses' ? 'lenses' : 'vents');
      } else if (e instanceof ApiError) {
        const body = e.body as { error?: string } | null;
        setGenError(body?.error ?? 'The lens could not respond right now. Please try again.');
      } else {
        setGenError('Could not reach the lens. Check your connection and try again.');
      }
      setLoading(false);
      setSelected(null);
      return;
    }
    setLoading(false);
    setSelected(null);
    router.push('/response');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.palette.bg }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 32, gap: 24 }}>
        {/* Vent preview — read-only input chrome */}
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={{
            ...borderStyle(t.input.border),
            borderRadius: t.input.radius,
            boxShadow: t.input.shadow ?? t.card.shadow,
            filter: t.card.filter,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              backgroundColor: t.input.headerBg,
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderBottomWidth: 1,
              borderBottomColor: t.input.divider,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: t.fonts.body.bold ?? t.fonts.body.regular,
                fontWeight: '700',
                fontSize: 11,
                letterSpacing: 0.8,
                lineHeight: 14,
                textTransform: 'uppercase',
                textAlign: 'center',
                color: t.text.body,
              }}
            >
              {getVentLabel(vent)}
            </Text>
          </View>
          <View style={{ backgroundColor: t.input.bg, paddingVertical: 12, paddingHorizontal: 16 }}>
            <Text
              style={{
                fontFamily: t.fonts.body.regular,
                fontSize: 14,
                letterSpacing: 0.5,
                lineHeight: 20,
                color: t.text.body,
              }}
            >
              {vent}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: t.input.bg,
              borderTopWidth: 1,
              borderTopColor: t.input.divider,
              paddingVertical: 4,
              paddingHorizontal: 12,
              alignItems: 'flex-end',
            }}
          >
            <Text
              style={{
                fontFamily: t.fonts.body.regular,
                fontSize: 10,
                letterSpacing: 1,
                lineHeight: 12,
                textTransform: 'uppercase',
                color: t.text.sub,
              }}
            >
              {vent.length}/{MAX_CHARS} characters
            </Text>
          </View>
        </Animated.View>

        {/* Generation / network error — fail loud, no fake fallback */}
        {genError && (
          <Card style={{ padding: 16, gap: 4 }}>
            <Text
              style={{
                fontFamily: t.fonts.display.bold ?? t.fonts.display.regular,
                fontWeight: '700',
                fontSize: 13,
                letterSpacing: 1,
                textTransform: 'uppercase',
                color: t.palette.pink,
              }}
            >
              Lens unavailable
            </Text>
            <Text
              style={{
                fontFamily: t.fonts.body.regular,
                fontSize: 13,
                lineHeight: 18,
                color: t.text.sub,
              }}
            >
              {genError}
            </Text>
          </Card>
        )}

        {limitError && (
          <LimitCard
            kind={limitError}
            onCreateAccount={() =>
              router.push({
                pathname: '/(auth)/sign-up',
                params: { reason: `${limitError}_limit` },
              })
            }
          />
        )}

        <Animated.Text
          entering={FadeIn.duration(300).delay(100)}
          style={{
            fontFamily: t.fonts.body.bold ?? t.fonts.body.regular,
            fontWeight: '700',
            fontSize: 12,
            letterSpacing: 1.3,
            lineHeight: 14,
            textTransform: 'uppercase',
            textAlign: 'center',
            color: t.palette.violet,
          }}
        >
          Choose:
        </Animated.Text>

        {/* Figure grid — tap to open the detail overlay */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {FIGURES.map((fig, i) => {
            const isSelected = selected === fig.id;
            return (
              <Animated.View
                key={fig.id}
                entering={FadeInDown.duration(250).delay(40 + i * 25)}
                style={{ width: '31%', flexGrow: 1 }}
              >
                <Pressable
                  onPress={() => setPreviewIndex(i)}
                  accessibilityRole="button"
                  accessibilityLabel={fig.name}
                  style={{
                    backgroundColor: t.fig.bg,
                    ...sideStyle(isSelected ? t.fig.borderSel : t.fig.border),
                    borderRadius: t.fig.radius,
                    boxShadow: isSelected ? t.fig.shadowSel : undefined,
                    paddingVertical: 10,
                    paddingHorizontal: 8,
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <FigurePortrait
                    figureId={fig.id}
                    name={fig.name}
                    size={76}
                    ring={t.fig.avatar.border}
                    shadow={t.fig.avatar.shadow}
                  />
                  <Text
                    style={{
                      fontFamily: t.fonts.display.bold ?? t.fonts.display.regular,
                      fontWeight: '700',
                      fontSize: 10,
                      letterSpacing: 1,
                      lineHeight: 13,
                      textTransform: 'uppercase',
                      textAlign: 'center',
                      color: isSelected ? t.fig.nameSel : t.fig.nameUnsel,
                    }}
                  >
                    {fig.name}
                  </Text>
                  <Text
                    style={{
                      fontFamily: t.fonts.body.regular,
                      fontSize: 8,
                      letterSpacing: 0.6,
                      lineHeight: 11,
                      textTransform: 'uppercase',
                      textAlign: 'center',
                      color: t.fig.desc,
                    }}
                  >
                    {fig.descriptor}
                  </Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      {/* Lens detail overlay — shared picker. Select generates the response
          and routes to /response; Back returns to the grid. */}
      <LensPickerSheet
        open={previewIndex !== null}
        startIndex={previewIndex ?? 0}
        loading={loading}
        onBack={() => setPreviewIndex(null)}
        onSelect={(figureId) => {
          setPreviewIndex(null);
          handleGetPerspective(figureId);
        }}
      />
    </SafeAreaView>
  );
}
