import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { MindmapAreaCard } from './mindmap-area-card';

/** Port source: V200/src/components/mindmap/MindmapAreaCard.tsx (+ stories). */
const meta = {
  title: 'Mindmap/MindmapAreaCard',
  component: MindmapAreaCard,
  args: { area: 'career', milestones: 3, actions: 7 },
} satisfies Meta<typeof MindmapAreaCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: { area: 'health', selected: true, milestones: 1, actions: 4 },
};

export const Pair: Story = {
  render: () => (
    <View style={{ gap: 16, alignItems: 'center' }}>
      <MindmapAreaCard area="career" milestones={3} actions={7} />
      <MindmapAreaCard area="relationship" selected milestones={1} actions={2} />
    </View>
  ),
};
