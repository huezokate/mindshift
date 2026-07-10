import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import JournalHeader from '@/components/journal/JournalHeader'

// Personalized sub-heading under the app header (T-023-02). The journal is
// sign-in-gated so the header ALWAYS carries a name ("@{name}'s Journal") —
// the anonymous "Your Journal" state was removed (Kate 2026-07-10). Pure —
// no router/Clerk; re-themes (violet accent) via the toolbar.
const meta: Meta<typeof JournalHeader> = {
  title: 'Journal/JournalHeader',
  component: JournalHeader,
}
export default meta

type Story = StoryObj<typeof JournalHeader>

export const WithName: Story = {
  args: { name: 'Ada' },
}
