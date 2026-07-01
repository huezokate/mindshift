import type { Preview } from '@storybook/nextjs-vite'
// The real app cascade — Tailwind v4 entry, all three token sets, the four text
// fonts, global resets, `.material-symbols-sharp`, and the `.ds-btn` layer. Reusing
// globals.css (not re-listing imports) keeps Storybook and production from drifting.
// NOTE: the Material Symbols WEBFONT itself is loaded via .storybook/preview-head.html
// (mirroring layout.tsx) — it is not part of globals.css.
import '../src/app/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Dark default reads against Cyberpunk (the `:root` theme) until the per-theme
    // toolbar lands in T-022-03. Value is the literal --bg (#080810).
    backgrounds: {
      default: 'cyberpunk',
      values: [
        { name: 'cyberpunk', value: '#080810' },
        { name: 'light', value: '#ffffff' },
      ],
    },
  },
};

export default preview;
