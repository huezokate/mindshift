import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { QuoteCard } from './quote-card';

/** Port source: V200 QuoteCardCanvas.ts (1080×1350 canvas → RN view). */
const meta = {
  title: 'Share/QuoteCard',
  component: QuoteCard,
} satisfies Meta<typeof QuoteCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const BASE = {
  figureId: 'socrates',
  figureName: 'Socrates',
  era: 'Ancient Greece',
  responseText:
    'The unexamined life is not worth living — and you, my friend, are doing the examining. Every doubt you feel is a sign of an active mind. Most who seem certain have simply stopped asking questions.',
  ventText: 'I keep second-guessing my career choice and it is exhausting.',
};

export const Default: Story = { args: BASE };

export const WithVent: Story = { args: { ...BASE, includeVent: true } };

export const LongResponse: Story = {
  args: {
    ...BASE,
    figureId: 'm-ali',
    figureName: 'Muhammad Ali',
    era: 'Boxing champion, 1942–2016',
    responseText: `${BASE.responseText} Your hesitation is not weakness; it is wisdom in its earliest form. The champion is not the one who never doubts — it is the one who steps into the ring carrying the doubt and swings anyway. Float above the noise of other people's certainty; it was never yours to carry.`,
  },
};

export const Pair: Story = {
  args: BASE,
  render: () => (
    <View style={{ gap: 16, alignItems: 'center' }}>
      <QuoteCard {...BASE} />
      <QuoteCard {...BASE} includeVent />
    </View>
  ),
};
