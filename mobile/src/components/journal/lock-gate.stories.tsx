import type { Meta, StoryObj } from '@storybook/react-native';

import { LockGateView } from './lock-gate';

/** The Face ID gate card (T-030-05 D8). The live LockGate wires
    expo-local-authentication; this drives the visual state. */
const meta = {
  title: 'Journal/LockGate',
  component: LockGateView,
  args: { onUnlock: () => {} },
} satisfies Meta<typeof LockGateView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Locked: Story = {};
