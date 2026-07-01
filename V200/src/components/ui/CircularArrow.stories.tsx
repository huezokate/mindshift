import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import CircularArrow from '@/components/ui/CircularArrow'

// Shared circular prev/next arrow (T-023-01). Sibling of CircleArrow with a
// disabled state (opacity 0.5 + not-allowed). Cyan ring on var(--card-bg), boxed
// on var(--bg) so it reads on every theme.
const meta: Meta<typeof CircularArrow> = {
  title: 'UI/CircularArrow',
  component: CircularArrow,
  args: { direction: 'next', ariaLabel: 'Next', onClick: () => {} },
  argTypes: {
    direction: { control: { type: 'inline-radio' }, options: ['prev', 'next'] },
    size: { control: { type: 'number' } },
    disabled: { control: { type: 'boolean' } },
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

type Story = StoryObj<typeof CircularArrow>

export const Default: Story = {}

// prev + next together.
export const Pair: StoryObj = {
  render: () => (
    <>
      <CircularArrow direction="prev" ariaLabel="Previous" onClick={() => {}} />
      <CircularArrow direction="next" ariaLabel="Next" onClick={() => {}} />
    </>
  ),
}

// Dimmed, non-interactive treatment (e.g. first/last item).
export const Disabled: Story = {
  args: { disabled: true },
}

export const Large: Story = {
  args: { size: 72 },
}
