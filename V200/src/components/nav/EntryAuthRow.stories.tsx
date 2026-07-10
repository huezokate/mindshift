import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import EntryAuthRow from '@/components/nav/EntryAuthRow'

// Smoke story (T-022-04) + the canonical AC-#2 demo: the cheapest auth-dependent
// component, shown in both Clerk states via `parameters.clerk`. Signed-in renders
// the greeting (reads the mock user's name); signed-out renders the sign-in pills.
const meta: Meta<typeof EntryAuthRow> = {
  title: 'Nav/EntryAuthRow',
  component: EntryAuthRow,
  args: { maxWidth: 400 },
}
export default meta

type Story = StoryObj<typeof EntryAuthRow>

export const SignedOut: Story = {
  parameters: { clerk: { signedIn: false } },
}

export const SignedIn: Story = {
  parameters: { clerk: { signedIn: true } },
}
