import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import LensCard from '@/components/journal/LensCard'
import type { LensResponseV2 } from '@/lib/journal-types'
import { DEMO_ENTRY } from '@/components/__fixtures__/journal'

// Lens response card (T-023-02). Renders the figure avatar + name, the figure's
// signature quote (cyberpunk/kawaii only), the response text, and a "SHARED …"
// log when the response has shares. Re-themes via the toolbar.
//
// DEVIATION FROM TICKET: the ticket's suggested "collapsed/expanded" and
// "favorited vs not" states no longer exist — the current LensCard is a flat card
// and the save/star affordance was removed (sharing moved to the detail page,
// see LensCard.tsx L29-32). So `is_favorite` does not affect the render. We cover
// the states that DO vary the output instead: shares, figure identity, and the
// unknown-figure fallback.
const BASE: LensResponseV2 = DEMO_ENTRY.lens_responses[0] // a-lincoln, 1 share
const MARILYN: LensResponseV2 = DEMO_ENTRY.lens_responses[1] // marilyn-monroe, no shares

const meta: Meta<typeof LensCard> = {
  title: 'Journal/LensCard',
  component: LensCard,
  args: {
    response: BASE,
    ventText: DEMO_ENTRY.vent_text,
    isEntryPublic: false,
  },
}
export default meta

type Story = StoryObj<typeof LensCard>

// Lincoln, quote + response + a single Instagram share in the log.
export const Default: Story = {}

// Multiple shares → the "SHARED …" footer lists each with relative timestamps.
export const WithShares: Story = {
  args: {
    response: {
      ...BASE,
      shares: [
        { id: 's1', platform: 'instagram', shared_at: '2026-06-03T09:00:00.000Z' },
        { id: 's2', platform: 'tiktok', shared_at: '2026-06-04T18:30:00.000Z' },
      ],
    },
  },
}

// No shares → the share log is omitted entirely.
export const NoShares: Story = {
  args: { response: { ...BASE, shares: [] } },
}

// A different figure — different portrait, name, and signature quote.
export const DifferentFigure: Story = {
  args: { response: MARILYN },
}

// figure_id not present in FIGURES → falls back to showing the raw id as the name,
// no portrait, and no quote block. Guards the "unknown/legacy figure" path.
export const UnknownFigure: Story = {
  args: {
    response: { ...BASE, figure_id: 'not-a-figure', shares: [] },
  },
}
