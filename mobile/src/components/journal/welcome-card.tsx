import { Pressable, Text, View } from 'react-native';

import { borderStyle, useTheme } from '@/theme';

/**
 * First-run / empty-state card — RN port of V200/src/components/journal/
 * WelcomeCard.tsx (Figma 469:4036). Pink-accent surface; the demo-seed
 * affordance is preserved beneath the welcome copy.
 */
export function WelcomeCard({
  onLoadDemo,
  seeding,
  seedMsg,
}: {
  onLoadDemo?: () => void;
  seeding?: boolean;
  seedMsg?: string | null;
}) {
  const { mode, tokens: t } = useTheme();
  const pink = t.palette.pink;

  // Pink-accent borders per theme (web cardBorder); kawaii keeps its own
  // --card-* chrome.
  const chrome =
    mode === 'cyberpunk'
      ? {
          borderTopWidth: 1,
          borderLeftWidth: 4,
          borderRightWidth: 4,
          borderBottomWidth: 2,
          borderColor: pink,
          borderRadius: t.card.radius,
          backgroundColor: t.card.bg,
        }
      : mode === 'kawaii'
        ? {
            ...borderStyle(t.card.border),
            borderRadius: t.card.radius,
            backgroundColor: t.card.bg,
            boxShadow: t.card.shadow,
          }
        : {
            borderTopWidth: 1.5,
            borderLeftWidth: 4,
            borderRightWidth: 1.5,
            borderBottomWidth: 1.5,
            borderColor: pink,
            borderRadius: 8,
            backgroundColor: t.card.bg,
          };

  return (
    <View style={{ filter: mode === 'notepad' ? t.card.filter : undefined }}>
      <View
        style={{
          ...chrome,
          paddingVertical: 20,
          paddingHorizontal: 24,
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Text
          style={{
            fontFamily: t.fonts.body.bold ?? t.fonts.body.regular,
            fontWeight: '700',
            fontSize: 18,
            letterSpacing: 1.44,
            lineHeight: 20,
            color: t.text.body,
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          Welcome to the journal feature!
        </Text>
        <Text
          style={{
            fontFamily: t.fonts.body.bold ?? t.fonts.body.regular,
            fontWeight: '700',
            fontSize: 12,
            letterSpacing: 1.32,
            lineHeight: 14,
            color: t.palette.cyan,
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          Your personal hub to save and share all future mindShifts
        </Text>
        <View style={{ alignSelf: 'stretch', marginTop: 4, gap: 2 }}>
          {['Journal', 'Set of free stickers'].map((item) => (
            <Text
              key={item}
              style={{
                fontFamily: t.fonts.body.regular,
                fontSize: 14,
                lineHeight: 20,
                letterSpacing: 0.52,
                color: t.palette.cyan,
                paddingLeft: 8,
              }}
            >
              {'•'}  {item}
            </Text>
          ))}
        </View>

        {onLoadDemo ? (
          <Pressable
            onPress={onLoadDemo}
            disabled={seeding}
            accessibilityRole="button"
            style={{
              marginTop: 8,
              minHeight: 44,
              paddingVertical: 12,
              paddingHorizontal: 24,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: t.btn.bg,
              ...borderStyle(t.btn.border),
              borderRadius: t.btn.radius,
              boxShadow: t.btn.shadow,
            }}
          >
            <Text
              style={{
                fontFamily: t.fonts.btn.bold ?? t.fonts.btn.regular,
                fontWeight: '600',
                fontSize: 13,
                letterSpacing: t.btn.letterSpacing,
                textTransform: 'uppercase',
                color: t.btn.color,
              }}
            >
              {seeding ? 'Loading demo…' : 'Load 10-entry demo'}
            </Text>
          </Pressable>
        ) : null}
        {seedMsg ? (
          <Text style={{ fontFamily: t.fonts.body.regular, fontSize: 12, color: t.text.meta }}>
            {seedMsg}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
