import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import Logo from '@/components/ui/Logo'

// Brand logo (Figma 483:2747) — the layered-icon mark (camera aperture +
// psychology_alt) on a theme-bg disc, ± the "Minds Shift" wordmark. Token
// driven (--logo-*), so flip the Theme toolbar to see all three treatments.
const meta: Meta<typeof Logo> = {
  title: 'UI/Logo',
  component: Logo,
  argTypes: {
    size: { control: { type: 'select' }, options: [24, 48, 80] },
    name: { control: { type: 'boolean' } },
  },
}
export default meta

type Story = StoryObj<typeof Logo>

export const Lens24: Story = { args: { size: 24 } }
export const Lens48: Story = { args: { size: 48 } }
export const Lens48WithName: Story = { args: { size: 48, name: true } }
export const Lens80WithName: Story = { args: { size: 80, name: true } }

// All Figma variants at once — the review grid.
export const AllSizes: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 32, padding: 24 }}>
      <Logo size={24} />
      <Logo size={48} />
      <Logo size={48} name />
      <Logo size={80} name />
    </div>
  ),
}
