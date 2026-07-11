import type { Meta, StoryObj } from '@storybook/react-native';

import { EntryAuthRowView } from './entry-auth-row';

/** Port source: V200/src/components/nav/EntryAuthRow.tsx. Stories drive the
    presentational View — both auth states without Clerk (web parity with
    parameters.clerk.signedIn). */
const meta = {
  title: 'Nav/EntryAuthRow',
  component: EntryAuthRowView,
  args: { signedIn: false },
} satisfies Meta<typeof EntryAuthRowView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedOut: Story = {};

export const SignedIn: Story = {
  args: { signedIn: true, subtext: '@kate' },
};
