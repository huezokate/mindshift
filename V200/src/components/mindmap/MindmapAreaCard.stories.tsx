import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { MindmapAreaCard } from '@/components/mindmap/MindmapAreaCard'
import { AREA_BY_ID } from '@/lib/mindmap-areas'
import { AREA_DETAILS } from '@/components/__fixtures__/mindmap'

// Coverage story (T-023-03). Pure presentational notepad card — no router/Clerk/
// theme hooks, so no mocks needed; feed it an `area` + an `AreaDetail` fixture.
// Two render modes: folded (progress bar + milestone/action counts) and unfolded
// (overall-progress box + full milestone list). Its structural accents are tokens
// (--cyan / --green / --pink / --card-bg) so it re-skins on the toolbar; the paper
// drop-shadow is a fixed notepad color and intentionally does NOT re-theme.
const meta: Meta<typeof MindmapAreaCard> = {
  title: 'Mindmap/MindmapAreaCard',
  component: MindmapAreaCard,
  // Padded so the corner sticker icon (overflows top/left) isn't clipped.
  decorators: [(Story) => <div style={{ padding: 24 }}><Story /></div>],
}
export default meta

type Story = StoryObj<typeof MindmapAreaCard>

// Folded — the on-map summary state.
export const Folded: Story = {
  args: { area: AREA_BY_ID.career, detail: AREA_DETAILS.career },
}

// Unfolded — tap-to-open detail: overall-progress box + milestones/actions.
export const Unfolded: Story = {
  args: { area: AREA_BY_ID.career, detail: AREA_DETAILS.career, unfolded: true },
}

// A few representative areas side by side so the different AreaIcons + labels and
// the cross-theme consistency of the card chrome are visible at a glance.
const GALLERY: Array<'career' | 'health' | 'relationship'> = ['career', 'health', 'relationship']

export const Gallery: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, padding: 8 }}>
      {GALLERY.map((id) => (
        <MindmapAreaCard key={id} area={AREA_BY_ID[id]} detail={AREA_DETAILS[id]} />
      ))}
    </div>
  ),
}
