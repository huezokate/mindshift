import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AreaIcon } from '@/components/mindmap/AreaIcon'
import { AREAS, type AreaId } from '@/lib/mindmap-areas'

// Coverage story (T-023-03). AreaIcon renders one 24×24 <svg> with
// `fill=currentColor`, so both stories sit inside a `var(--cyan)` container to make
// the glyphs visible on every theme (flip the toolbar to confirm they recolor).
// The full set is driven off AREAS so the grid can't drift from the app's areas.
const IDS = AREAS.map((a) => a.id)

const meta: Meta<typeof AreaIcon> = {
  title: 'Mindmap/AreaIcon',
  component: AreaIcon,
  args: { id: 'career', size: 48 },
  argTypes: {
    id: { control: { type: 'inline-radio' }, options: IDS },
    size: { control: { type: 'number' } },
  },
  // Color wrapper so `currentColor` resolves to a visible accent per theme, while
  // the Controls panel still drives `id`/`size` on the single icon.
  decorators: [(Story) => <div style={{ color: 'var(--cyan)' }}><Story /></div>],
}
export default meta

type Story = StoryObj<typeof AreaIcon>

// Single glyph — arg-controlled id/size (swap the area from the Controls panel).
export const Single: Story = {}

// The full icon set as a labeled grid — one glance proves all five paint + recolor.
export const AllAreas: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, color: 'var(--cyan)' }}>
      {AREAS.map((area) => (
        <div key={area.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 96 }}>
          <AreaIcon id={area.id as AreaId} size={40} />
          <span style={{ fontFamily: 'var(--font-body, monospace)', fontSize: 12, opacity: 0.85, color: 'var(--text-body)' }}>
            {area.label}
          </span>
        </div>
      ))}
    </div>
  ),
}
