import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

import { Button } from './button';
import { Sheet } from './sheet';

/** Port source: the shared overlay shape behind V200's ShareSheet (bottom,
    --fcard-* chrome) and LensPickerSheet (centered, --card-* chrome). */
const meta = {
  title: 'UI/Sheet',
  component: Sheet,
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

function SheetDemo({ position, chrome }: { position: 'bottom' | 'center'; chrome: 'card' | 'fcard' }) {
  const [open, setOpen] = useState(false);
  const { tokens: t } = useTheme();
  return (
    <View style={{ gap: 12 }}>
      <Button variant="secondary" onPress={() => setOpen(true)}>
        Open {position} sheet
      </Button>
      <Sheet open={open} onClose={() => setOpen(false)} position={position} chrome={chrome}>
        <View style={{ gap: 12 }}>
          <Text
            style={{
              fontFamily: t.fonts.display.bold ?? t.fonts.display.regular,
              fontSize: 20,
              color: t.text.h1,
              textAlign: 'center',
            }}
          >
            {chrome === 'fcard' ? 'Share your shift' : 'Pick a lens'}
          </Text>
          <Text style={{ fontFamily: t.fonts.body.regular, fontSize: 14, color: t.text.body }}>
            Tap the scrim to close. The panel chrome comes from the {chrome} token family.
          </Text>
          <Button variant="secondary2" onPress={() => setOpen(false)}>
            Close
          </Button>
        </View>
      </Sheet>
    </View>
  );
}

export const Bottom: Story = {
  args: { open: false, onClose: () => {}, children: null },
  render: () => <SheetDemo position="bottom" chrome="fcard" />,
};

export const Centered: Story = {
  args: { open: false, onClose: () => {}, children: null },
  render: () => <SheetDemo position="center" chrome="card" />,
};
