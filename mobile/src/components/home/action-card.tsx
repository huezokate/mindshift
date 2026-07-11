import { Pressable, Text } from 'react-native';

import { useTheme } from '@/theme';

/**
 * Home-hub action card — RN port of the web /app/home cards: pink 1.5px
 * border on the card surface, eyebrow / title / body.
 */
export function ActionCard({
  eyebrow,
  title,
  body,
  onPress,
}: {
  eyebrow: string;
  title: string;
  body: string;
  onPress: () => void;
}) {
  const { tokens: t } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={{
        backgroundColor: t.card.bg,
        borderWidth: 1.5,
        borderColor: t.palette.pink,
        borderRadius: t.card.radius,
        filter: t.card.filter,
        paddingVertical: 18,
        paddingHorizontal: 20,
      }}
    >
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
        {eyebrow}
      </Text>
      <Text
        style={{
          fontFamily: t.fonts.display.bold ?? t.fonts.display.regular,
          fontWeight: '700',
          fontSize: 21,
          letterSpacing: -0.3,
          color: t.text.h1,
          marginTop: 5,
          marginBottom: 6,
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
        }}
      >
        {body}
      </Text>
    </Pressable>
  );
}
