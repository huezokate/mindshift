import type { Meta, StoryObj } from '@storybook/react-native';

import { WelcomeCard } from './welcome-card';

/** Port source: V200/src/components/journal/WelcomeCard.tsx (Figma 469:4036). */
const meta = {
  title: 'Journal/WelcomeCard',
  component: WelcomeCard,
} satisfies Meta<typeof WelcomeCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDemoSeed: Story = {
  args: { onLoadDemo: () => {} },
};

export const Seeding: Story = {
  args: { onLoadDemo: () => {}, seeding: true, seedMsg: 'Seeding 10 demo entries…' },
};
