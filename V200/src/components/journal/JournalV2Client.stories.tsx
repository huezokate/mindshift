import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import JournalV2Client from '@/components/journal/JournalV2Client'
import type { JournalEntry } from '@/lib/journal-types'
import { DEMO_ENTRY } from '@/components/__fixtures__/journal'

// Page-like journal feed client (T-023-02). Larger + stateful, so per the ticket
// this is a single happy-path smoke rather than exhaustive state coverage.
//
// SAFE-TO-MOUNT: it only fetches via the IntersectionObserver, which is armed ONLY
// when `initialHasMore` is true — so with `initialHasMore: false` the story mounts
// network-free. (Switching the filter tab WOULD fetch, but that fetch is caught and
// stories don't click tabs.) It nests AppHeader (Clerk mock, signed-in by default)
// and renders the JournalPreviewCard list + the "Vent it out" CTA.
const SECOND_ENTRY: JournalEntry = {
  ...DEMO_ENTRY,
  id: 'entry_demo_2',
  title: 'Doubt on the pivot',
  vent_text: "We changed direction again and I can't tell if it's courage or thrashing.",
  created_at: '2026-05-28T14:00:00.000Z',
  lens_responses: [
    { id: 'l2a', figure_id: 'socrates', response_text: 'What would tell you the difference?', is_favorite: false, created_at: '2026-05-28T14:01:00.000Z', shares: [] },
  ],
}

const meta: Meta<typeof JournalV2Client> = {
  title: 'Journal/JournalV2Client',
  component: JournalV2Client,
  args: {
    initialEntries: [DEMO_ENTRY, SECOND_ENTRY],
    initialHasMore: false,
    firstName: 'Ada',
  },
}
export default meta

type Story = StoryObj<typeof JournalV2Client>

// Populated feed — header, tabs, two preview cards, the vent CTA, reset affordance.
export const Populated: Story = {}

// Empty feed → the WelcomeCard first-run state (demo-seed affordance).
export const Empty: Story = {
  args: { initialEntries: [], initialHasMore: false },
}
