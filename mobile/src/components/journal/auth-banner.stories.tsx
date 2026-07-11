import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { AuthBanner } from './auth-banner';

/** Port source: V200/src/components/AuthBanner.tsx. Web reads ?reason= from
    the URL; the RN component takes it as a prop. */
const meta = {
  title: 'Journal/AuthBanner',
  component: AuthBanner,
} satisfies Meta<typeof AuthBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LensLimit: Story = { args: { reason: 'lens_limit' } };

export const AllReasons: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <AuthBanner />
      <AuthBanner reason="lens_limit" />
      <AuthBanner reason="vent_limit" />
      <AuthBanner reason="save" />
      <AuthBanner reason="journal" />
    </View>
  ),
};
