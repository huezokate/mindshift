import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import CircleArrow from '@/components/ui/CircleArrow'

// Circular nav-arrow used by the lens-picker / theme-select overlays (T-023-01).
// Token-driven: cyan ring on var(--card-bg). Rendered inside a padded var(--bg)
// box so the ring reads against the themed body across all three themes.
const meta: Meta<typeof CircleArrow> = {
  title: 'UI/CircleArrow',
  component: CircleArrow,
  args: { direction: 'right', 'aria-label': 'Next', onClick: () => {} },
  argTypes: {
    direction: { control: { type: 'inline-radio' }, options: ['left', 'right'] },
    size: { control: { type: 'number' } },
  },
  decorators: [
    (Story) => (
      <div style={{ display: 'inline-flex', gap: 16, padding: 24, background: 'var(--bg)' }}>
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof CircleArrow>

export const Default: Story = {}

// Both directions side by side — the prev/next pair as used in the overlays.
export const Pair: StoryObj = {
  render: () => (
    <>
      <CircleArrow direction="left" aria-label="Previous" onClick={() => {}} />
      <CircleArrow direction="right" aria-label="Next" onClick={() => {}} />
    </>
  ),
}

export const Large: Story = {
  args: { size: 72 },
}
