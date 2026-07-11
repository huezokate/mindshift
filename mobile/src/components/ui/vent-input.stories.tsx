import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';

import { VentInput } from './vent-input';

/** Port source: V200 onboarding page's --input-* textarea card
    (header row + textarea + char counter). */
const meta = {
  title: 'UI/VentInput',
  component: VentInput,
} satisfies Meta<typeof VentInput>;

export default meta;
type Story = StoryObj<typeof meta>;

function Interactive({ initial }: { initial: string }) {
  const [text, setText] = useState(initial);
  return <VentInput value={text} onChangeText={setText} />;
}

export const Empty: Story = {
  args: { value: '', onChangeText: () => {} },
  render: () => <Interactive initial="" />,
};

export const Filled: Story = {
  args: { value: '', onChangeText: () => {} },
  render: () => (
    <Interactive initial="My boss rewrote my entire proposal an hour before the meeting and presented it as a team effort. I don't even know if I'm angry at him or at myself for saying nothing." />
  ),
};

export const OverWarnThreshold: Story = {
  args: { value: '', onChangeText: () => {} },
  render: () => (
    <Interactive
      initial={'The counter below flips to the theme pink because this vent crossed 700 characters. '.repeat(
        9,
      )}
    />
  ),
};
