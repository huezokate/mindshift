import type { Meta, StoryObj } from '@storybook/react-native';
import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

import { Card, HeadingCard } from './card';

/** Port source: the web's inline --card-* / --hcard-* token patterns
    (V200 onboarding/AuthBanner callsites — no web component exists). */
const meta = {
  title: 'UI/Card',
  component: Card,
  args: { children: null },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

function CardBody() {
  const { tokens: t } = useTheme();
  return (
    <View style={{ padding: 20, gap: 8 }}>
      <Text
        style={{
          fontFamily: t.fonts.display.bold ?? t.fonts.display.regular,
          fontSize: 22,
          color: t.text.h1,
        }}
      >
        Content card
      </Text>
      <Text style={{ fontFamily: t.fonts.body.regular, fontSize: 14, color: t.text.body }}>
        The --card-* family: background, per-side borders, radius, shadow and filter all come from
        the active mode.
      </Text>
    </View>
  );
}

function HeadingBody() {
  const { tokens: t } = useTheme();
  return (
    <>
      <Text
        style={{
          fontFamily: t.fonts.display.bold ?? t.fonts.display.regular,
          fontWeight: '700',
          fontSize: 28,
          lineHeight: 32,
          letterSpacing: 1.44,
          textTransform: 'uppercase',
          textAlign: 'center',
          color: t.palette.cyan,
          marginBottom: 8,
        }}
      >
        Get it off your chest
      </Text>
      <Text
        style={{
          fontFamily: t.fonts.body.regular,
          fontSize: 14,
          lineHeight: 20,
          letterSpacing: 0.52,
          textAlign: 'center',
          color: t.text.body,
        }}
      >
        Let it all out — then see it through the eyes of someone who lived through years of
        history.
      </Text>
    </>
  );
}

export const Content: Story = {
  render: () => (
    <Card>
      <CardBody />
    </Card>
  ),
};

export const Heading: Story = {
  render: () => (
    <HeadingCard>
      <HeadingBody />
    </HeadingCard>
  ),
};

export const Both: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <HeadingCard>
        <HeadingBody />
      </HeadingCard>
      <Card>
        <CardBody />
      </Card>
    </View>
  ),
};
