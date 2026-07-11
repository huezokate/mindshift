import type { Meta, StoryObj } from '@storybook/react-native';
import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

import { Icon } from './icon';

/** Port source: V200/src/components/ui/Icon.tsx (+ Icon.stories.tsx).
    RN renders the font's baked instance — no runtime FILL/wght axes. */
const meta = {
  title: 'UI/Icon',
  component: Icon,
  args: { name: 'psychology', size: 48 },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const GLYPHS = [
  'home',
  'book_2',
  'graph_3',
  'person',
  'psychology',
  'favorite',
  'auto_awesome',
  'bookmark',
  'bookmark_added',
  'add',
  'close',
  'chevron_left',
  'chevron_right',
  'arrow_upward',
  'share',
  'release_alert',
  'edit',
  'delete',
  'check',
  'menu',
];

export const Glyphs: Story = {
  render: () => <GlyphGrid />,
};

function GlyphGrid() {
  const { tokens: t } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
      {GLYPHS.map((g) => (
        <View key={g} style={{ alignItems: 'center', width: 72, gap: 4 }}>
          <Icon name={g} size={28} />
          <Text style={{ color: t.text.meta, fontSize: 9, fontFamily: t.fonts.body.regular }}>
            {g}
          </Text>
        </View>
      ))}
    </View>
  );
}
