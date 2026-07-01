import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import JournalPreviewCard from '@/components/journal/JournalPreviewCard'
import type { JournalEntry } from '@/lib/journal-types'
import { DEMO_ENTRY } from '@/components/__fixtures__/journal'

// Journal feed card (T-022-04 smoke → expanded in T-023-02). Presentational; only
// Next dependency is useRouter() (nav mock). The AC-critical multi-state component:
// covers has-lens (avatar stack + share badge) vs no-lens (the "Apply a lens →"
// invite), and long/short vent bodies (the body clamps to 3 lines). onAddLens is a
// no-op so tapping the footer stays silent. Re-themes via the toolbar.
const meta: Meta<typeof JournalPreviewCard> = {
  title: 'Journal/JournalPreviewCard',
  component: JournalPreviewCard,
  args: { entry: DEMO_ENTRY, onAddLens: () => {} },
}
export default meta

type Story = StoryObj<typeof JournalPreviewCard>

// DEMO_ENTRY: two lenses, one with an Instagram share (badge tucks into the avatar).
export const Default: Story = {}

// No lenses yet → footer becomes the "Apply a lens →" invitation.
export const NoLens: Story = {
  args: { entry: { ...DEMO_ENTRY, lens_responses: [] } },
}

// Long vent → the body clamps to 3 lines (-webkit-line-clamp).
export const LongVent: Story = {
  args: {
    entry: {
      ...DEMO_ENTRY,
      vent_text:
        "Every standup I say I'll leave on time and every night I don't. The work is genuinely interesting, which is the trap — I keep telling myself one more hour, and then it's dark outside and I've missed dinner again. I'm not sure whether I'm committed or just bad at boundaries, and I resent that I can't tell the difference anymore.",
    },
  },
}

// Short vent, no lens → the tightest card.
export const ShortVent: Story = {
  args: {
    entry: { ...DEMO_ENTRY, vent_text: 'Quick note to myself.', lens_responses: [] },
  },
}

// Several lenses → the overlapping avatar stack with mixed share badges.
const MANY_LENSES: JournalEntry = {
  ...DEMO_ENTRY,
  lens_responses: [
    { id: 'l1', figure_id: 'a-lincoln', response_text: 'Begin with one Tuesday.', is_favorite: true, created_at: '2026-06-02T22:15:00.000Z', shares: [{ id: 's1', platform: 'instagram', shared_at: '2026-06-03T09:00:00.000Z' }] },
    { id: 'l2', figure_id: 'marilyn-monroe', response_text: 'Go home at six.', is_favorite: false, created_at: '2026-06-02T22:16:00.000Z', shares: [{ id: 's2', platform: 'tiktok', shared_at: '2026-06-03T10:00:00.000Z' }] },
    { id: 'l3', figure_id: 'socrates', response_text: 'What do you owe them, exactly?', is_favorite: false, created_at: '2026-06-02T22:17:00.000Z', shares: [] },
    { id: 'l4', figure_id: 'maya-angelou', response_text: 'You are not the hours you give away.', is_favorite: false, created_at: '2026-06-02T22:18:00.000Z', shares: [{ id: 's4', platform: 'facebook', shared_at: '2026-06-03T11:00:00.000Z' }] },
  ],
}

export const ManyLenses: Story = {
  args: { entry: MANY_LENSES },
}
