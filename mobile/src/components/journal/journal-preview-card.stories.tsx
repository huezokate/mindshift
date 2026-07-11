import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { entryNoLenses, entryWithLenses } from './__fixtures__/journal';
import { JournalPreviewCard } from './journal-preview-card';

/** Port source: V200/src/components/journal/JournalPreviewCard.tsx
    (Figma 604:7285…7473). Check the footer + badges in all three modes —
    the S-030 review flagged badge contrast on kawaii. */
const meta = {
  title: 'Journal/JournalPreviewCard',
  component: JournalPreviewCard,
  args: { entry: entryWithLenses },
} satisfies Meta<typeof JournalPreviewCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithLensesShared: Story = {};

export const NoLensesPrivate: Story = {
  args: { entry: entryNoLenses },
};

export const Feed: Story = {
  render: () => (
    <View style={{ gap: 24 }}>
      <JournalPreviewCard entry={entryWithLenses} />
      <JournalPreviewCard entry={entryNoLenses} />
    </View>
  ),
};
