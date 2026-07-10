import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import AuthBanner from '@/components/AuthBanner'

// Smoke story (T-022-04). AuthBanner reads `useSearchParams().get('reason')` to
// pick its copy — the framework's next/navigation mock returns an empty query by
// default, and a story overrides it via `parameters.nextjs.navigation.query`.
// Grouped under Nav with the header/auth affordances (Kate 2026-07-10) —
// though structurally it's a card variant; if a Card family lands in the
// system, AuthBanner should become one of its forms.
const meta: Meta<typeof AuthBanner> = {
  title: 'Nav/AuthBanner',
  component: AuthBanner,
}
export default meta

type Story = StoryObj<typeof AuthBanner>

// No `reason` query → default copy. Proves the useSearchParams mock resolves.
export const Default: Story = {}

// Override the mocked query so the reason-specific headline/sub renders.
export const WithReason: Story = {
  parameters: { nextjs: { navigation: { query: { reason: 'save' } } } },
}
