import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import WelcomeCard from '@/components/journal/WelcomeCard'

// First-run / empty-state card (T-023-02). Pink-accent surface with the welcome
// copy + feature list, plus the optional demo-seed affordance. States exercise the
// demo button's presence, its seeding/disabled state, and the seed-result note.
// Presentational (useTheme only) — no network.
const meta: Meta<typeof WelcomeCard> = {
  title: 'Journal/WelcomeCard',
  component: WelcomeCard,
  args: { onLoadDemo: () => {} },
}
export default meta

type Story = StoryObj<typeof WelcomeCard>

// Welcome copy + "Load 10-entry demo" button.
export const Default: Story = {}

// Seeding in progress → button disabled + "Loading demo…" label.
export const Seeding: Story = {
  args: { seeding: true },
}

// After a seed run → the result note renders beneath the button.
export const WithSeedMessage: Story = {
  args: { seedMsg: 'Loaded 10 demo entries.' },
}

// No demo affordance (onLoadDemo omitted) → just the welcome copy + feature list.
export const NoDemoButton: Story = {
  args: { onLoadDemo: undefined },
}
