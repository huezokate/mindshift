import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import Button, { type ButtonVariant } from '@/components/ui/Button'

// Full coverage story for the design-system Button (T-023-01) — the flagship
// consistency check for S-023. Button is entirely token-driven (--btn-* families)
// and renders a Material Symbol via <Icon> when given `icon`, so it exercises the
// whole styling pipeline (tokens + fonts + borders + webfont) in one component.
//
// The model (per Kate, 2026-07-09): THREE structural variants only — primary /
// secondary / secondary2 — colored natively by the active theme. `icon` and
// `disabled` are orthogonal modifiers available on every variant. Sizing is
// role-based: primary 56min/16×12 (the former "tall" specs are its default),
// secondaries 45min/12×8. Surfaces like the journal/mindmap dropdown rows pick
// from these three types; there are no semantic variants.
const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  args: { children: 'Enter Minds Shift' },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'secondary2'],
    },
    disabled: { control: { type: 'boolean' } },
    fullWidth: { control: { type: 'boolean' } },
    icon: { control: { type: 'text' } },
    children: { control: { type: 'text' } },
  },
}
export default meta

type Story = StoryObj<typeof Button>

// ── The three variants (family is theme-independent; theme paints them) ───────
// CTA treatment (cyber green / kawaii amber / notepad white+dropshadow).
export const Primary: Story = { args: { variant: 'primary' } }
export const Secondary: Story = { args: { variant: 'secondary', children: 'Secondary' } }
export const Secondary2: Story = { args: { variant: 'secondary2', children: 'Secondary 2' } }

// ── Modifiers (orthogonal — valid on every variant) ───────────────────────────
// Leading Material Symbol — the load-bearing glyph check (renders a symbol, not
// the word "favorite", when the webfont is wired).
export const WithIcon: Story = { args: { variant: 'primary', icon: 'favorite' } }
export const Disabled: Story = { args: { variant: 'primary', disabled: true } }
export const FullWidth: Story = {
  args: { variant: 'primary', fullWidth: true, children: 'Full width' },
  render: (args) => (
    <div style={{ width: 320 }}>
      <Button {...args} />
    </div>
  ),
}

// ── The money shot: variants × modifiers, re-themed by the toolbar ────────────
// All three variants (rows), each with the full modifier grid: default, icon,
// disabled, and icon+disabled. Flip the Theme toolbar (Cyberpunk / Kawaii /
// Notepad) to compare — the primary row should always read bigger (56/16×12)
// than the secondaries (45/12×8), with identical corner radii per theme.
const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'secondary2']

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <span style={{ width: 110, fontFamily: 'var(--font-mono, monospace)', fontSize: 13, opacity: 0.8, color: 'var(--fg, currentColor)' }}>
        {label}
      </span>
      {children}
    </div>
  )
}

export const AllVariants: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 24 }}>
      <p style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 13, opacity: 0.7, color: 'var(--fg, currentColor)', margin: 0 }}>
        Flip the Theme toolbar to compare Cyberpunk / Kawaii / Notepad.
      </p>
      {VARIANTS.map((variant) => (
        <Row key={variant} label={variant}>
          <Button variant={variant}>Default</Button>
          <Button variant={variant} icon="bolt">Icon</Button>
          <Button variant={variant} disabled>Disabled</Button>
          <Button variant={variant} icon="bolt" disabled>Icon</Button>
        </Row>
      ))}
    </div>
  ),
}
