import { Text, View } from 'react-native';

import { FigurePortrait } from '@/components/journal/figure-portrait';
import { useTheme } from '@/theme';

/**
 * The shareable quote card — RN twin of the web's 1080×1350 canvas
 * (V200 QuoteCardCanvas.ts): framed card on the theme bg, figure header
 * (portrait + name + era), the response, optional vent context, wordmark
 * footer. Rendered at CARD_W×CARD_H logical points and captured at
 * 1080×1350 px by the share sheet (react-native-view-shot scales).
 */
export const CARD_W = 324;
export const CARD_H = 405; // 4:5, same ratio as the web card

export function QuoteCard({
  figureId,
  figureName,
  era,
  responseText,
  ventText,
  includeVent = false,
}: {
  figureId: string;
  figureName: string;
  era?: string;
  responseText: string;
  ventText?: string;
  includeVent?: boolean;
}) {
  const { tokens: t } = useTheme();
  // Web band-sizes the body font by length; two bands are enough here.
  const bodySize = responseText.length > 420 ? 11 : responseText.length > 260 ? 12 : 14;

  return (
    <View
      style={{
        width: CARD_W,
        height: CARD_H,
        backgroundColor: t.palette.bg,
        padding: 19, // web PADDING 64 / (1080/324)
        }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: t.card.bg,
          borderWidth: 1.5,
          borderColor: t.palette.cyan,
          borderRadius: t.card.radius,
          paddingVertical: 18,
          paddingHorizontal: 17,
          justifyContent: 'space-between',
        }}
      >
        {/* Figure header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <FigurePortrait
            figureId={figureId}
            name={figureName}
            size={44}
            ring={t.fig.avatar.border}
          />
          <View style={{ flexShrink: 1 }}>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: t.fonts.display.bold ?? t.fonts.display.regular,
                fontWeight: '700',
                fontSize: 15,
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                color: t.text.body,
              }}
            >
              {figureName}
            </Text>
            {era ? (
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: t.fonts.body.regular,
                  fontSize: 8,
                  letterSpacing: 0.5,
                  color: t.text.sub,
                }}
              >
                {era}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Response body */}
        <Text
          numberOfLines={13}
          style={{
            fontFamily: t.fonts.body.regular,
            fontSize: bodySize,
            lineHeight: Math.round(bodySize * 1.36),
            letterSpacing: 0.3,
            color: t.text.body,
          }}
        >
          {responseText}
        </Text>

        {/* Optional vent context */}
        {includeVent && ventText ? (
          <Text
            numberOfLines={2}
            style={{
              fontFamily: t.fonts.body.regular,
              fontSize: 8,
              lineHeight: 11,
              fontStyle: 'italic',
              color: t.text.sub,
            }}
          >
            “{ventText}”
          </Text>
        ) : null}

        {/* Wordmark footer */}
        <View>
          <Text
            style={{
              fontFamily: t.fonts.display.bold ?? t.fonts.display.regular,
              fontWeight: '700',
              fontSize: 9,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              color: t.palette.pink,
            }}
          >
            Minds Shift
          </Text>
          <Text
            style={{
              fontFamily: t.fonts.body.regular,
              fontSize: 7,
              letterSpacing: 0.4,
              color: t.text.sub,
              marginTop: 2,
            }}
          >
            minds-shift.com
          </Text>
        </View>
      </View>
    </View>
  );
}
