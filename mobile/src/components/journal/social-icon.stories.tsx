import type { Meta, StoryObj } from '@storybook/react-native';
import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

import { SocialIcon } from './social-icon';
import type { SharePlatform } from './social-svgs';

/** Port source: V200/src/components/journal/SocialIcon.tsx (+ stories).
    The artwork itself is per-theme — check all three modes. */
const meta = {
  title: 'Journal/SocialIcon',
  component: SocialIcon,
  args: { platform: 'instagram', size: 32 },
} satisfies Meta<typeof SocialIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {};

const PLATFORMS: SharePlatform[] = ['instagram', 'tiktok', 'facebook', 'link', 'native', 'download'];

function AllPlatformsGrid() {
  const { tokens: t } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
      {PLATFORMS.map((p) => (
        <View key={p} style={{ alignItems: 'center', gap: 6, width: 72 }}>
          <SocialIcon platform={p} size={32} />
          <Text style={{ color: t.text.sub, fontSize: 10, fontFamily: t.fonts.body.regular }}>
            {p}
          </Text>
        </View>
      ))}
    </View>
  );
}

export const AllPlatforms: Story = {
  render: () => <AllPlatformsGrid />,
};
