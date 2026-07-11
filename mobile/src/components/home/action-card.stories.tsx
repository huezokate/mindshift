import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { ActionCard } from './action-card';

/** Port source: the hub cards on V200/src/app/app/home/page.tsx. */
const meta = {
  title: 'Home/ActionCard',
  component: ActionCard,
  args: { onPress: () => {} },
} satisfies Meta<typeof ActionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NewVent: Story = {
  args: {
    eyebrow: 'Start',
    title: 'New vent',
    body: 'Something on your mind? Vent it and pick a lens.',
  },
};

export const HubStack: Story = {
  args: { eyebrow: 'Start', title: 'New vent', body: '…' },
  render: () => (
    <View style={{ gap: 14 }}>
      <ActionCard
        eyebrow="Start"
        title="New vent"
        body="Something on your mind? Vent it and pick a lens."
        onPress={() => {}}
      />
      <ActionCard
        eyebrow="Your map"
        title="Visit your map"
        body="See your areas of life and how the year is moving."
        onPress={() => {}}
      />
      <ActionCard
        eyebrow="Archive"
        title="Open journal"
        body="Every reflection you’ve saved, in one place."
        onPress={() => {}}
      />
    </View>
  ),
};
