import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import UpcomingChip from '@/components/journal/UpcomingChip'

// Presentational, prop-less pill (T-023-02). Just proves it renders the
// `release_alert` Material Symbol (glyph, not the word) in the pink accent and
// re-themes via the toolbar (red / magenta / hot-pink). No network, no state.
const meta: Meta<typeof UpcomingChip> = {
  title: 'Journal/UpcomingChip',
  component: UpcomingChip,
}
export default meta

type Story = StoryObj<typeof UpcomingChip>

export const Default: Story = {}
