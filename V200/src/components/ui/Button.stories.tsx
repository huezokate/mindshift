import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import Button, { type ButtonVariant, type ThemeName } from '@/components/ui/Button'

// Full coverage story for the design-system Button (T-023-01) — the flagship
// consistency check for S-023. Button is entirely token-driven (--btn-* families)
// and renders a Material Symbol via <Icon> when given `icon`, so it exercises the
// whole styling pipeline (tokens + fonts + borders + webfont) in one component.
//
// The subtle bit these stories exist to catch: the SEMANTIC variants `journal` and
// `mindmap` resolve to a DIFFERENT --btn-* family per theme (the accent slots are
// swapped between cyberpunk and kawaii/notepad). Journal must read pink/red and
// Mind Map cyan/mint/green in EVERY theme — so those stories must forward the
// active toolbar theme as the `theme` prop, or the swap mis-resolves and the bug
// hides. See resolveFamily() in Button.tsx.
const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  args: { children: 'Enter MindShift' },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'secondary2', 'journal', 'mindmap'],
    },
    theme: {
      control: { type: 'select' },
      options: ['cyberpunk', 'kawaii', 'notepad'],
    },
    disabled: { control: { type: 'boolean' } },
    tall: { control: { type: 'boolean' } },
    fullWidth: { control: { type: 'boolean' } },
    icon: { control: { type: 'text' } },
    children: { control: { type: 'text' } },
  },
}
export default meta

type Story = StoryObj<typeof Button>

// Reads the toolbar theme so a story renders in whatever the toolbar is set to.
const themeOf = (ctx: { globals: { theme?: string } }): ThemeName =>
  (ctx.globals.theme as ThemeName) ?? 'cyberpunk'

// ── Structural variants (family is theme-independent) ─────────────────────────
// CTA treatment (cyber green / kawaii amber / notepad white+dropshadow).
export const Primary: Story = { args: { variant: 'primary' } }
export const Secondary: Story = { args: { variant: 'secondary', children: 'Secondary' } }
export const Secondary2: Story = { args: { variant: 'secondary2', children: 'Secondary 2' } }

// ── Semantic variants (must resolve against the active theme) ─────────────────
// Journal → pink/red family in every theme; Mind Map → cyan/mint/green family.
export const Journal: Story = {
  args: { variant: 'journal', children: 'Journal' },
  render: (args, ctx) => <Button {...args} theme={themeOf(ctx)} />,
}
export const Mindmap: Story = {
  args: { variant: 'mindmap', children: 'Mind Map' },
  render: (args, ctx) => <Button {...args} theme={themeOf(ctx)} />,
}

// ── States ────────────────────────────────────────────────────────────────────
// Leading Material Symbol — the load-bearing glyph check (renders a symbol, not
// the word "favorite", when the webfont is wired).
export const WithIcon: Story = { args: { variant: 'primary', icon: 'favorite' } }
export const Disabled: Story = { args: { variant: 'primary', disabled: true } }
export const Tall: Story = { args: { variant: 'primary', tall: true, children: 'Section header' } }
export const FullWidth: Story = {
  args: { variant: 'primary', fullWidth: true, children: 'Full width' },
  render: (args) => (
    <div style={{ width: 320 }}>
      <Button {...args} />
    </div>
  ),
}

// ── The money shot: variants × states, re-themed by the toolbar ───────────────
// All five variants (rows) with their default + key states, all resolved against
// the toolbar's current theme. Flip the Theme toolbar (Cyberpunk / Kawaii /
// Notepad) to compare — that's the theme axis. Semantic rows forward `theme` so
// the family swap is visible: Journal stays pink/red, Mind Map stays cyan-family,
// in all three themes.
const STRUCTURAL: ButtonVariant[] = ['primary', 'secondary', 'secondary2']
const SEMANTIC: ButtonVariant[] = ['journal', 'mindmap']

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
  render: (_args, ctx) => {
    const theme = themeOf(ctx)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 24 }}>
        <p style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 13, opacity: 0.7, color: 'var(--fg, currentColor)', margin: 0 }}>
          Flip the Theme toolbar to compare Cyberpunk / Kawaii / Notepad.
        </p>
        {STRUCTURAL.map((variant) => (
          <Row key={variant} label={variant}>
            <Button variant={variant} theme={theme}>Default</Button>
            <Button variant={variant} theme={theme} disabled>Disabled</Button>
            <Button variant={variant} theme={theme} tall>Tall</Button>
            <Button variant={variant} theme={theme} icon="bolt">Icon</Button>
          </Row>
        ))}
        {SEMANTIC.map((variant) => (
          <Row key={variant} label={variant}>
            <Button variant={variant} theme={theme}>{variant === 'journal' ? 'Journal' : 'Mind Map'}</Button>
            <Button variant={variant} theme={theme} disabled>Disabled</Button>
          </Row>
        ))}
      </div>
    )
  },
}
