import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import ChatScreen from '@/components/journal/ChatScreen'
import { DEMO_FIGURE_ID } from '@/components/__fixtures__/journal'

// Smoke story (T-022-04). ChatScreen calls useRouter() (nav mock) + useUser()
// (Clerk mock). Chat is SIGNED-IN ONLY (Kate 2026-07-10): the SignedOut story
// shows the sign-in gate, not a thread. The SignedIn variant fires a mount-time
// fetch to /api/chat-with-lens/history; there's no backend in Storybook so it
// rejects, but the component guards with `r.ok`, so it falls back to an empty
// thread rather than crashing.
const meta: Meta<typeof ChatScreen> = {
  title: 'Journal/ChatScreen',
  component: ChatScreen,
  args: {
    figureId: DEMO_FIGURE_ID,
    ventText:
      "Third Tuesday in a row I've worked until 11. I love the project but I'm resenting the team.",
    seedReply:
      'You have not failed at saying no; you have not yet practiced it. Begin with one Tuesday.',
  },
}
export default meta

type Story = StoryObj<typeof ChatScreen>

// Signed-out → the sign-in gate (chat has no anonymous mode).
export const SignedOut: Story = {
  args: { sessionId: null },
  parameters: { clerk: { signedIn: false } },
}

// Signed-in, persisted session — exercises the history-fetch guard.
export const SignedIn: Story = {
  args: { sessionId: 'entry_demo_1' },
  parameters: { clerk: { signedIn: true } },
}
