import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent } from 'storybook/test'
import AppHeader from '@/components/nav/AppHeader'

// Smoke + coverage story (T-022-04 / expanded T-023-03). AppHeader is the heaviest
// isolation case: useRouter() (nav mock), useUser() AND useClerk() (Clerk mock's
// signOut). All states mount without crashing; passing entryCount/lensCount drives
// the collapsed meta labels AND short-circuits the /api/journal-v2/counts fetch so
// no network is attempted in the iframe.
const meta: Meta<typeof AppHeader> = {
  title: 'Nav/AppHeader',
  component: AppHeader,
}
export default meta

type Story = StoryObj<typeof AppHeader>

export const SignedIn: Story = {
  args: { entryCount: 12, lensCount: 34 },
  parameters: { clerk: { signedIn: true } },
}

export const SignedOut: Story = {
  parameters: { clerk: { signedIn: false } },
}

// Opens the dropdown via a play-function click on the "Account menu" trigger, so
// the design-system Button rows (primary / journal / mindmap variants — the
// per-theme accent swap) render in the canvas for a cross-theme review. Uses the
// bundled `storybook/test` entry (SB10), not the un-installed @storybook/test.
export const MenuOpen: Story = {
  args: { entryCount: 12, lensCount: 34, mindmapHorizon: '90-day', mindmapProgress: '40%' },
  parameters: { clerk: { signedIn: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Account menu' }))
  },
}
