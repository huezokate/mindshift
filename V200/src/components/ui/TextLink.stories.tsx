import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import TextLink from '@/components/ui/TextLink'

// Design-system text link (Kate 2026-07-11): underlined 14px body text in the
// theme's --link-color, padded to the secondary button's 8px vertical rhythm
// so the tap target clears WCAG comfortably. <a> with href, <button> with
// onClick. Flip the theme toolbar: cyan / teal / notepad blue.
const meta: Meta<typeof TextLink> = {
  title: 'UI/TextLink',
  component: TextLink,
  args: { children: 'Drop us a line →' },
}
export default meta

type Story = StoryObj<typeof TextLink>

export const AsAnchor: Story = { args: { href: 'mailto:hello@minds-shift.com' } }
export const AsButton: Story = { args: { onClick: () => {}, children: 'Learn more' } }
