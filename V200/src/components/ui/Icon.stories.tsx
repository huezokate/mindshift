import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import Icon from '@/components/ui/Icon'

// Coverage story for the Material Symbols (Sharp) primitive (T-023-01). The load-
// bearing check: glyphs must PAINT (webfont from .storybook/preview-head.html), not
// fall back to ligature text ("favorite"). Colored with var(--cyan) so the grid is
// visible on every theme's body — flip the toolbar to confirm it recolors.
const meta: Meta<typeof Icon> = {
  title: 'UI/Icon',
  component: Icon,
  args: { name: 'favorite', size: 40 },
  argTypes: {
    size: { control: { type: 'number' } },
    fill: { control: { type: 'inline-radio' }, options: [0, 1] },
    weight: { control: { type: 'number' } },
  },
}
export default meta

type Story = StoryObj<typeof Icon>

// Single glyph — proves the webfont resolves to a symbol, not the word.
export const Default: Story = {
  args: { name: 'favorite', size: 40, style: { color: 'var(--cyan)' } },
}

// fill=1 flips the Material Symbols FILL axis (outline → solid).
export const Filled: Story = {
  args: { name: 'favorite', size: 40, fill: 1, style: { color: 'var(--cyan)' } },
}

// Representative glyphs at two sizes — the at-a-glance "do our icons render" grid.
const GLYPHS = ['favorite', 'bolt', 'psychology', 'auto_awesome', 'chevron_right', 'close']

export const Glyphs: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, color: 'var(--cyan)' }}>
      {GLYPHS.map((name) => (
        <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 96 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
            <Icon name={name} size={24} />
            <Icon name={name} size={40} />
          </div>
          <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 12, opacity: 0.8 }}>{name}</span>
        </div>
      ))}
    </div>
  ),
}
