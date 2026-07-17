import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import ThemeButton, { type ThemeButtonTheme } from '@/components/ui/ThemeButton'

// Theme-selection button (Kate 2026-07-16) — the "pick your world" control
// born on the landing's phone-morph section. Always the NOTEPAD primary shape;
// the advertised theme paints text + outline + paper dropshadow with its
// accent (notepad blue / kawaii red / cyberpunk green).
//
// Interaction model (deviates from Button's .ds-btn on purpose):
//   hover            → grows (scale 1.04)
//   selected/pressed → stroke thickens by 2px (1.5 → 3.5); selected also sits
//                      pressed INTO the paper (dropshadow gone, translated
//                      into its place) at full opacity, unselected idle at
//                      the 0.6 dim recipe.
const meta: Meta<typeof ThemeButton> = {
  title: 'UI/ThemeButton',
  component: ThemeButton,
  args: { theme: 'notepad' },
  argTypes: {
    theme: {
      control: { type: 'select' },
      options: ['notepad', 'kawaii', 'cyberpunk'],
    },
    selected: { control: { type: 'boolean' } },
  },
}
export default meta

type Story = StoryObj<typeof ThemeButton>

// ── One per theme (accent check: blue / red / green) ─────────────────────────
export const Notepad: Story = { args: { theme: 'notepad' } }
export const Kawaii: Story = { args: { theme: 'kawaii' } }
export const Cyberpunk: Story = { args: { theme: 'cyberpunk' } }

// ── Selected: pressed into the paper + 2px thicker stroke ────────────────────
export const Selected: Story = { args: { theme: 'notepad', selected: true } }

// ── The row as the landing uses it — click to move the pressed state ─────────
function PickerDemo() {
  const [picked, setPicked] = useState<ThemeButtonTheme>('notepad')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
      <p style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 13, opacity: 0.7, color: 'var(--fg, currentColor)', margin: 0 }}>
        Hover = grow · hold = stroke +2px · click = select (pressed into the paper, stroke +2px).
      </p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {(['notepad', 'kawaii', 'cyberpunk'] as ThemeButtonTheme[]).map(t => (
          <ThemeButton key={t} theme={t} selected={picked === t} onClick={() => setPicked(t)} />
        ))}
      </div>
    </div>
  )
}

export const PickerRow: StoryObj = { render: () => <PickerDemo /> }
