import type { Meta, StoryObj } from '@storybook/react-native';

import { UpcomingChip } from './upcoming-chip';

/** Port source: V200/src/components/journal/UpcomingChip.tsx (Figma 602:6889). */
const meta = {
  title: 'Journal/UpcomingChip',
  component: UpcomingChip,
} satisfies Meta<typeof UpcomingChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
