import type { Meta, StoryObj } from '@storybook/react-native';
import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

/** Boot check: a token-colored square proves the themed decorator + token layer. */
function Smoke() {
  const { mode, tokens: t } = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: 12 }}>
      <View
        style={{
          width: 96,
          height: 96,
          backgroundColor: t.palette.cyan,
          borderRadius: t.radii.md,
          boxShadow: t.glow.cyan,
        }}
      />
      <Text style={{ color: t.text.body, fontFamily: t.fonts.body.regular }}>
        Storybook is alive in {mode}
      </Text>
    </View>
  );
}

const meta = {
  title: 'Smoke',
  component: Smoke,
} satisfies Meta<typeof Smoke>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
