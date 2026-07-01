import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import Button from '@/components/ui/Button'

// First REAL design-system story (T-022-02). It's the verification fixture for the
// styling pipeline: Button is fully token-driven (font/color/border/radius/shadow via
// --btn-* vars) AND renders a Material Symbol through <Icon> when given `icon`. So a
// correctly-rendered Button proves, in one component:
//   • globals.css cascade + all three token files are loaded (colors/fonts/borders)
//   • Tailwind v4 is processing under the Vite builder (globals.css `@import "tailwindcss"`)
//   • the Material Symbols webfont paints (preview-head.html) → glyph, not ligature text
//   • the `@/*` alias resolves under Vite (Button imports `@/components/ui/Icon`)
// The theme toolbar is T-022-03; to spot-check kawaii/notepad here, temporarily set
// data-theme on the iframe <html> in devtools and watch the treatment change.
const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  args: {
    children: 'Enter MindShift',
    theme: 'cyberpunk',
  },
}
export default meta

type Story = StoryObj<typeof Button>

// CTA treatment (cyberpunk green). Confirms tokens + font + borders + radius.
export const Primary: Story = {
  args: { variant: 'primary' },
}

// Leading Material Symbol — the load-bearing icon check (AC #1). If preview-head.html
// isn't wired, this renders the word "favorite" instead of a glyph.
export const WithIcon: Story = {
  args: { variant: 'primary', icon: 'favorite' },
}

// Additional token families resolve (pink / cyan accents).
export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Secondary' },
}

export const Secondary2: Story = {
  args: { variant: 'secondary2', children: 'Secondary 2' },
}

// AC #2 spot-check: a utility-heavy element proves Tailwind classes actually emit
// under the Vite builder (gap / rounded / padding / text-size / border).
export const TailwindUtilities: StoryObj = {
  render: () => (
    <div className="flex items-center gap-4 rounded-lg border border-cyan-400 p-6 text-2xl font-bold text-cyan-300">
      <span>Tailwind</span>
      <span>utilities</span>
      <span>resolve</span>
    </div>
  ),
}
