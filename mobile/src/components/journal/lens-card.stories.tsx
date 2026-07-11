import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { cleopatraResponse, napoleonResponse } from './__fixtures__/journal';
import { LensCard } from './lens-card';

/** Port source: V200/src/components/journal/LensResponseCard.tsx (+ stories).
    Chrome is fully theme-branched — check all three modes. */
const meta = {
  title: 'Journal/LensCard',
  component: LensCard,
  args: { response: napoleonResponse },
} satisfies Meta<typeof LensCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithQuoteAndShares: Story = {};

export const NoShares: Story = {
  args: { response: cleopatraResponse },
};

export const Pair: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <LensCard response={napoleonResponse} />
      <LensCard response={cleopatraResponse} />
    </View>
  ),
};
