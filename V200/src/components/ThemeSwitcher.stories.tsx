import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import ThemeSwitcher from '@/components/ThemeSwitcher'

// Smoke story (T-023-03). ThemeSwitcher drives the app's own theme via useTheme().
// There is no ThemeProvider in the Storybook cascade, so useTheme() resolves to the
// context default: `theme` reads 'cyberpunk' (that button shows active) and
// `setTheme` is a noop — clicks are intentionally inert and do NOT move the Theme
// toolbar (the toolbar is the real theme control; this story is redundant with it
// but useful to see the control itself paint per theme). Styling comes from the
// `.ms-switcher*` rules + `--sw-*-bg` tokens in globals.css (imported by preview).
const meta: Meta<typeof ThemeSwitcher> = {
  title: 'Components/ThemeSwitcher',
  component: ThemeSwitcher,
}
export default meta

type Story = StoryObj<typeof ThemeSwitcher>

// Bare render — flip the Theme toolbar to confirm the control re-skins per theme.
export const Default: Story = {}
