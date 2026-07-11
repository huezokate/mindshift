import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { Text } from 'react-native';

import { Button } from '@/components/ui/button';

import { LensPickerSheet } from './lens-picker-sheet';

/** Port source: V200/src/components/journal/LensPickerSheet.tsx. Portraits
    stream from the backend (EXPO_PUBLIC_API_URL) — offline the initial-on-
    gradient fallback renders instead. */
const meta = {
  title: 'Journal/LensPickerSheet',
  component: LensPickerSheet,
} satisfies Meta<typeof LensPickerSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

function Harness(props: { loading?: boolean; error?: string | null; startIndex?: number }) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <>
      <Button variant="primary" onPress={() => setOpen(true)}>
        Open picker
      </Button>
      {picked ? <Text style={{ marginTop: 12 }}>selected: {picked}</Text> : null}
      <LensPickerSheet
        open={open}
        onBack={() => setOpen(false)}
        onSelect={(id) => {
          setPicked(id);
          setOpen(false);
        }}
        {...props}
      />
    </>
  );
}

export const Default: Story = {
  args: { open: false, onBack: () => {}, onSelect: () => {} },
  render: () => <Harness />,
};

export const Loading: Story = {
  args: { open: false, onBack: () => {}, onSelect: () => {} },
  render: () => <Harness loading />,
};

export const WithError: Story = {
  args: { open: false, onBack: () => {}, onSelect: () => {} },
  render: () => <Harness error="You've reached today's free limit — sign up to continue." />,
};

export const StartAtLenin: Story = {
  args: { open: false, onBack: () => {}, onSelect: () => {} },
  render: () => <Harness startIndex={14} />,
};
