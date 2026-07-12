import { ClerkProvider } from '@clerk/clerk-expo';
import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { Text } from 'react-native';

import { Button } from '@/components/ui/button';
import { CLERK_PUBLISHABLE_KEY } from '@/lib/config';

import { ShareSheet } from './share-sheet';

/** Port source: V200 ShareSheet.tsx. Wrapped in ClerkProvider because the
    sheet resolves auth for share logging (anon in Storybook — logs skip). */
const meta = {
  title: 'Share/ShareSheet',
  component: ShareSheet,
} satisfies Meta<typeof ShareSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

function Harness() {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState<string | null>(null);
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <Button variant="primary" onPress={() => setOpen(true)}>
        Open share sheet
      </Button>
      {last ? <Text style={{ marginTop: 12 }}>shared: {last}</Text> : null}
      <ShareSheet
        open={open}
        figureId="socrates"
        responseText="The unexamined life is not worth living — and you, my friend, are doing the examining."
        ventText="I keep second-guessing my career choice."
        onClose={() => setOpen(false)}
        onShared={(p) => setLast(p)}
      />
    </ClerkProvider>
  );
}

export const Default: Story = {
  args: {
    open: false,
    figureId: 'socrates',
    responseText: '',
    ventText: '',
    onClose: () => {},
  },
  render: () => <Harness />,
};
