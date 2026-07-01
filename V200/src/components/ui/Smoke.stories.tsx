import type { Meta, StoryObj } from '@storybook/nextjs-vite'

// Trivial compat smoke test for T-022-01: proves Storybook boots and renders on
// Next 16 + React 19 with zero token/Tailwind/alias dependency. Styling wiring is
// T-022-02; the theme toolbar is T-022-03; import mocks are T-022-04. Keep this
// dependency-free so a boot failure is unambiguously a framework/compat problem.
const Smoke = () => (
  <div style={{ padding: 24, fontFamily: 'system-ui', fontSize: 16 }}>
    Storybook is alive on Next 16 + React 19.
  </div>
)

const meta: Meta<typeof Smoke> = {
  title: 'Smoke/Boot',
  component: Smoke,
}
export default meta

type Story = StoryObj<typeof Smoke>

export const Default: Story = {}
