import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import LensPickerSheet from '@/components/journal/LensPickerSheet'

// Reusable lens-picker popup (T-023-02). A fixed inset-0 framer-motion overlay with
// the figure carousel — the decorator gives the iframe full viewport height so the
// centered card renders unclipped. Presentational: onSelect / onBack are no-ops.
// No network. Re-themes via the toolbar (Button/CircularArrow self-resolve tokens).
const meta: Meta<typeof LensPickerSheet> = {
  title: 'Journal/LensPickerSheet',
  component: LensPickerSheet,
  args: {
    open: true,
    onSelect: () => {},
    onBack: () => {},
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: '100dvh' }}>
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof LensPickerSheet>

// Open on the first figure (Socrates); arrows wrap the carousel.
export const Open: Story = {}

// Select button in its loading state ("Loading…", disabled).
export const Loading: Story = {
  args: { loading: true, selectLabel: 'Add lens' },
}

// Inline error above the buttons (e.g. tier limit) — the sheet stays open.
export const WithError: Story = {
  args: { error: "You've used all 3 free lenses today." },
}
