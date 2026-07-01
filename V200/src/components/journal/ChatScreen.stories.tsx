import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import ChatScreen from '@/components/journal/ChatScreen'
import { DEMO_FIGURE_ID } from '@/components/__fixtures__/journal'

// Smoke story (T-022-04). ChatScreen calls useRouter() (nav mock) + useUser()
// (Clerk mock). The Anon variant (sessionId:null, signed-out) exercises the
// ephemeral sessionStorage path with NO network — an ISOLATION-ONLY crash-free
// proof that the component survives a null session. It is NOT a shipped product
// mode: there is no product entry point to anon chat today (T-025-02, deferred per
// S-025) — this story is the only place that branch runs. The SignedIn variant
// fires a mount-time fetch to /api/chat-with-lens/history; there's no backend in
// Storybook so it rejects, but the component guards with `r.ok`, so it falls back
// to an empty thread rather than crashing.
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

// Anonymous, unsaved thread — no network on mount. Isolation-only (no product
// entry point reaches this configuration today — T-025-02).
export const Anon: Story = {
  args: { sessionId: null },
  parameters: { clerk: { signedIn: false } },
}

// Signed-in, persisted session — exercises the history-fetch guard.
export const SignedIn: Story = {
  args: { sessionId: 'entry_demo_1' },
  parameters: { clerk: { signedIn: true } },
}
