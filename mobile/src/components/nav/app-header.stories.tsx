import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { AppHeaderView } from './app-header';

/**
 * Port source: V200/src/components/nav/AppHeader.tsx (Figma 624:8265).
 * The dropdown rows are THE semantic accent-swap surface: Journal group →
 * secondary, Mind Map group → secondary2, Profile/Logout → primary. Open the
 * menu and cycle all three modes — which palette each family gets must flip
 * per mode without the groups ever collapsing into one color.
 */
const meta = {
  title: 'Nav/AppHeader',
  component: AppHeaderView,
  args: { signedIn: true, username: '@kate', entryCount: 12, lensCount: 31 },
} satisfies Meta<typeof AppHeaderView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedIn: Story = {
  render: (args) => (
    <View style={{ minHeight: 480 }}>
      <AppHeaderView {...args} mindmapHorizon="5 years" mindmapProgress="2/9 done" />
    </View>
  ),
};

export const SignedOut: Story = {
  args: { signedIn: false, username: undefined, entryCount: 0, lensCount: 0 },
  render: (args) => (
    <View style={{ minHeight: 480 }}>
      <AppHeaderView {...args} />
    </View>
  ),
};
