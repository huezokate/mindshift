import { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/sheet';
import { FIGURES } from '@/lib/figures';
import { useTheme } from '@/theme';

import { FigurePortrait } from './figure-portrait';

type Props = {
  open: boolean;
  /** Figure index to open on (default 0 = Socrates). */
  startIndex?: number;
  loading?: boolean;
  selectLabel?: string;
  /** Inline error (e.g. tier limit) shown above the buttons; keeps the sheet open. */
  error?: string | null;
  onSelect: (figureId: string) => void;
  onBack: () => void;
};

/**
 * Reusable lens-picker popup — RN port of V200 LensPickerSheet. Endless
 * carousel (wraps Socrates → … → Lenin → Socrates) over the Sheet primitive
 * (center/card chrome). Presentational: the parent owns Select and Back.
 */
export function LensPickerSheet({
  open,
  startIndex = 0,
  loading = false,
  selectLabel = 'Select',
  error = null,
  onSelect,
  onBack,
}: Props) {
  const { tokens: t } = useTheme();
  const [index, setIndex] = useState(startIndex);
  const [prevOpen, setPrevOpen] = useState(open);
  // Web parity: the text area is always as tall as the LONGEST figure block so
  // the card, arrows, and buttons never move between figures. RN has no CSS
  // grid stacking — every block renders absolutely and reports its height.
  const [textH, setTextH] = useState(0);

  // Reset to the requested start figure each time the sheet opens (render-time
  // state sync, same trick as the web component).
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setIndex(startIndex);
  }

  const fig = FIGURES[index];
  const prev = () => setIndex((i) => (i - 1 + FIGURES.length) % FIGURES.length);
  const next = () => setIndex((i) => (i + 1) % FIGURES.length);
  if (!fig) return null;

  return (
    <Sheet open={open} onClose={onBack} position="center" chrome="card">
      <View style={{ alignItems: 'center', gap: 16 }}>
        {/* Portrait + in-popup nav arrows (icon-only design-system Button) */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <Button
            variant="secondary"
            icon="chevron_left"
            accessibilityLabel="Previous figure"
            onPress={prev}
          />
          <Animated.View key={fig.id} entering={FadeIn.duration(160)}>
            <FigurePortrait
              figureId={fig.id}
              name={fig.name}
              size={120}
              ring={t.fig.avatar.border}
              shadow={t.fig.avatar.shadow}
            />
          </Animated.View>
          <Button
            variant="secondary"
            icon="chevron_right"
            accessibilityLabel="Next figure"
            onPress={next}
          />
        </View>

        {/* Fixed-height text area sized to the longest figure block. */}
        <View style={{ width: '100%', minHeight: textH }}>
          {FIGURES.map((f) => {
            const active = f.id === fig.id;
            return (
              <View
                key={f.id}
                onLayout={(e) => {
                  const h = e.nativeEvent.layout.height;
                  setTextH((cur) => (h > cur ? h : cur));
                }}
                pointerEvents={active ? 'auto' : 'none'}
                accessibilityElementsHidden={!active}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  opacity: active ? 1 : 0,
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Text
                  style={{
                    fontFamily: t.fonts.display.bold ?? t.fonts.display.regular,
                    fontWeight: '700',
                    fontSize: 18,
                    letterSpacing: 1.5,
                    lineHeight: 22,
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    color: t.palette.violet,
                  }}
                >
                  {f.name}
                </Text>
                <Text
                  style={{
                    fontFamily: t.fonts.body.regular,
                    fontSize: 10,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    color: t.text.sub,
                  }}
                >
                  {f.era}
                </Text>
                <Text
                  style={{
                    fontFamily: t.fonts.body.regular,
                    fontSize: 13,
                    lineHeight: 20,
                    fontStyle: 'italic',
                    textAlign: 'center',
                    color: t.text.body,
                    marginTop: 4,
                  }}
                >
                  “{f.quote}”
                </Text>
                <Text
                  style={{
                    fontFamily: t.fonts.body.regular,
                    fontSize: 13,
                    lineHeight: 20,
                    textAlign: 'center',
                    color: t.text.body,
                  }}
                >
                  {f.bio}
                </Text>
              </View>
            );
          })}
        </View>

        {error ? (
          <Text
            style={{
              fontFamily: t.fonts.body.regular,
              fontSize: 12,
              lineHeight: 16,
              textAlign: 'center',
              color: t.palette.pink,
            }}
          >
            {error}
          </Text>
        ) : null}

        {/* Back = secondary2 (red), Select = secondary (blue) — the
            positive/negative button rule. */}
        <View style={{ flexDirection: 'row', gap: 12, width: '100%', marginTop: 4 }}>
          <View style={{ flex: 1 }}>
            <Button variant="secondary2" icon="arrow_back" iconSize={16} fullWidth onPress={onBack}>
              Back
            </Button>
          </View>
          <View style={{ flex: 1 }}>
            <Button
              variant="secondary"
              disabled={loading}
              fullWidth
              onPress={() => onSelect(fig.id)}
            >
              {loading ? 'Loading…' : selectLabel}
            </Button>
          </View>
        </View>
      </View>
    </Sheet>
  );
}
