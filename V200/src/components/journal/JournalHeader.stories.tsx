import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import JournalHeader from '@/components/journal/JournalHeader'

// Personalized sub-heading under the app header (T-023-02). Two states: a named
// user ("{name}'s Journal") and the anonymous fallback ("Your Journal"). Pure —
// no router/Clerk; re-themes (violet accent) via the toolbar.
const meta: Meta<typeof JournalHeader> = {
  title: 'Journal/JournalHeader',
  component: JournalHeader,
}
export default meta

type Story = StoryObj<typeof JournalHeader>

export const WithName: Story = {
  args: { firstName: 'Ada' },
}

// null (and empty/whitespace) falls back to the generic title.
export const NoName: Story = {
  args: { firstName: null },
}
