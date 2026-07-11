import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { ChatBubble, TypingDots } from './chat-bubble';

/** Port source: ChatScreen's inline chatBubble + typingDots helpers
    (V200/src/components/journal/ChatScreen.tsx). */
const meta = {
  title: 'UI/ChatBubble',
  component: ChatBubble,
  args: { role: 'user', children: 'I keep replaying that meeting in my head.' },
} satisfies Meta<typeof ChatBubble>;

export default meta;
type Story = StoryObj<typeof meta>;

export const User: Story = {};

export const Lens: Story = {
  args: {
    role: 'lens',
    children:
      'A meeting is one battle, not the war. I lost at Ligny two days before Waterloo — the replaying is only useful if it changes your next order.',
  },
};

export const Conversation: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <ChatBubble role="user">
        My boss rewrote my proposal an hour before the meeting and presented it as a team effort.
      </ChatBubble>
      <ChatBubble role="lens">
        Ah — the marshal who claims the victory dispatch. Ask yourself: do you want the credit, or
        the command? They are different campaigns.
      </ChatBubble>
      <ChatBubble role="user">Honestly? Both.</ChatBubble>
      <TypingDots />
    </View>
  ),
};
