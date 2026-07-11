import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { LimitCard } from './limit-card';

/** Port source: the inline limit card on V200/src/app/app/lens/page.tsx. */
const meta = {
  title: 'Journal/LimitCard',
  component: LimitCard,
  args: { onCreateAccount: () => {} },
} satisfies Meta<typeof LimitCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Lenses: Story = { args: { kind: 'lenses' } };

export const Vents: Story = { args: { kind: 'vents' } };

export const Both: Story = {
  args: { kind: 'lenses' },
  render: () => (
    <View style={{ gap: 16 }}>
      <LimitCard kind="lenses" onCreateAccount={() => {}} />
      <LimitCard kind="vents" onCreateAccount={() => {}} />
    </View>
  ),
};
