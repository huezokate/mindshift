import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import type { ChatMessage } from '@/lib/chat-logic';

import { ChatComposer } from './chat-composer';
import { ChatThread, SoftCloseDivider } from './chat-thread';

/** Port source: V200 ChatScreen.tsx (thread area + composer + arc states). */
const meta = {
  title: 'Chat/ChatThread',
  component: ChatThread,
} satisfies Meta<typeof ChatThread>;

export default meta;
type Story = StoryObj<typeof meta>;

const BASE = {
  figureId: 'socrates',
  figureName: 'Socrates',
  ventText: 'I keep second-guessing my career choice and it is exhausting.',
  seedReply:
    'The unexamined life is not worth living — and you, my friend, are doing the examining.',
  pending: false,
  error: null,
};

const TURNS: ChatMessage[] = [
  { role: 'user', content: 'But how do I know when the doubt is a signal?', turn_index: 0 },
  {
    role: 'lens',
    content: 'Ask instead: what would certainty cost you? The one who stops questioning stops steering.',
    turn_index: 1,
  },
];

export const Opening: Story = { args: { ...BASE, messages: [] } };

export const MidConversation: Story = { args: { ...BASE, messages: TURNS } };

export const Thinking: Story = { args: { ...BASE, messages: TURNS, pending: true } };

export const SendError: Story = {
  args: { ...BASE, messages: TURNS, error: 'The lens could not respond.' },
};

export const RestingWindDown: Story = {
  args: {
    ...BASE,
    messages: [
      ...TURNS,
      { role: 'lens', content: 'Carry the question with you — it is a compass.', turn_index: 2, done: true },
    ],
  },
  render: (args) => (
    <View>
      <ChatThread {...args} />
      <SoftCloseDivider subline="Sit with it." />
      <ChatComposer
        draft=""
        onChangeDraft={() => {}}
        onSend={() => {}}
        pending={false}
        locked={false}
        placeholder="Still here if you need more…"
        onReturn={() => {}}
      />
    </View>
  ),
};

export const HardCapLocked: Story = {
  args: { ...BASE, messages: TURNS },
  render: (args) => (
    <View>
      <ChatThread {...args} />
      <ChatComposer
        draft=""
        onChangeDraft={() => {}}
        onSend={() => {}}
        pending={false}
        locked
        placeholder=""
        onReturn={() => {}}
      />
    </View>
  ),
};
