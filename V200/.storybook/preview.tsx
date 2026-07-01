import { useLayoutEffect } from 'react'
import type { Preview } from '@storybook/nextjs-vite'
import { __setClerkState, type ClerkState } from './mocks/clerk'
// The real app cascade — Tailwind v4 entry, all three token sets, the four text
// fonts, global resets, `.material-symbols-sharp`, and the `.ds-btn` layer. Reusing
// globals.css (not re-listing imports) keeps Storybook and production from drifting.
// NOTE: the Material Symbols WEBFONT itself is loaded via .storybook/preview-head.html
// (mirroring layout.tsx) — it is not part of globals.css.
import '../src/app/globals.css'

// Theme toolbar (T-022-03). Mirrors the app's runtime switch in src/lib/theme.tsx:
// theme is a document-level concern — the token files scope every non-cyberpunk
// skin to `html[data-theme="…"]` (tokens-kawaii.css / tokens-notepad.css), and
// cyberpunk is the bare `:root` default. Order matches THEMES in theme.tsx.
const THEMES = [
  { value: 'cyberpunk', title: 'Cyberpunk' },
  { value: 'kawaii', title: 'Kawaii' },
  { value: 'notepad', title: 'Notepad' },
] as const

// Global decorator: apply the selected theme by setting `data-theme` on the iframe
// <html> — NOT a wrapper node. The token selectors are `html[data-theme="…"]`, so a
// wrapper would silently render cyberpunk regardless. Setting it on <html> also
// re-paints <body> per theme for free (kawaii pink / notepad ruled-paper / cyberpunk
// dark + scanline), which is why no manual `backgrounds` list is needed anymore.
// useLayoutEffect sets it before paint (no default-theme flash); keying on `theme`
// re-asserts on every theme change AND every story mount, so there's no leakage
// between stories.
const withTheme = (Story: () => React.JSX.Element, context: { globals: { theme?: string } }) => {
  const theme = context.globals.theme ?? 'cyberpunk'
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
  return <Story />
}

// Clerk isolation decorator (T-022-04). The @clerk/nextjs mock (.storybook/mocks/
// clerk.tsx, aliased in main.ts) holds signed-in/out state in a module singleton;
// this pushes each story's `parameters.clerk` into it BEFORE render so auth-aware
// components (AppHeader, EntryAuthRow, ChatScreen) show the intended state. Passing
// undefined resets to the signed-in default, so state never bleeds between stories.
const withClerkState = (
  Story: () => React.JSX.Element,
  context: { parameters: { clerk?: Partial<ClerkState> } },
) => {
  __setClerkState(context.parameters.clerk)
  return <Story />
}

const preview: Preview = {
  decorators: [withClerkState, withTheme],
  globalTypes: {
    theme: {
      description: 'Global MindShift theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: THEMES.map((t) => ({ value: t.value, title: t.title })),
        dynamicTitle: true,
      },
    },
  },
  // App default (src/lib/theme.tsx DEFAULT). Replaces the deprecated
  // globalTypes.defaultValue.
  initialGlobals: { theme: 'cyberpunk' },
  parameters: {
    // App Router mocks (T-022-04): opt every story into @storybook/nextjs-vite's
    // built-in next/navigation mock so useRouter()/usePathname()/useSearchParams()
    // return sane spies instead of throwing the "expected app router" invariant.
    nextjs: { appDirectory: true },
    // Default Clerk identity for stories that don't set `parameters.clerk`.
    clerk: { signedIn: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // No static `backgrounds` here on purpose: the token files paint <body> per
    // `data-theme`, so once withTheme sets the attribute the canvas background is
    // already correct for every theme. A hardcoded backgrounds.default would
    // override that and force dark-on-light in kawaii/notepad (T-022-03 AC).
  },
};

export default preview;
