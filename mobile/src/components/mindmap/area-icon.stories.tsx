import type { Meta, StoryObj } from '@storybook/react-native';
import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

import { AreaIcon } from './area-icon';
import { AREA_LABELS, type AreaId } from './area-icon-paths';

/** Port source: V200/src/components/mindmap/AreaIcon.tsx (+ stories). */
const meta = {
  title: 'Mindmap/AreaIcon',
  component: AreaIcon,
  args: { id: 'career', size: 48 },
} satisfies Meta<typeof AreaIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {};

const IDS: AreaId[] = ['career', 'health', 'relationship', 'personal', 'finance'];

function AllAreasGrid() {
  const { tokens: t } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
      {IDS.map((id) => (
        <View key={id} style={{ alignItems: 'center', gap: 6, width: 90 }}>
          <AreaIcon id={id} size={32} />
          <Text
            style={{
              color: t.text.sub,
              fontSize: 10,
              fontFamily: t.fonts.body.regular,
              textAlign: 'center',
            }}
          >
            {AREA_LABELS[id]}
          </Text>
        </View>
      ))}
    </View>
  );
}

export const AllAreas: Story = {
  render: () => <AllAreasGrid />,
};
