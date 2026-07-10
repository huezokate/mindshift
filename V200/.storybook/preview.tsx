import { useLayoutEffect } from 'react'
import { ThemeProvider } from '../src/lib/theme'
import type { Preview } from '@storybook/nextjs-vite'
import { __setClerkState, type ClerkState } from './mocks/clerk'
// The real app cascade — Tailwind v4 entry, all three token sets, the four text
// fonts, global resets, `.material-symbols-rounded`, and the `.ds-btn` layer. Reusing
// globals.css (not re-listing imports) keeps Storybook and production from drifting.
// NOTE: the Material Symbols WEBFONT itself is loaded via .storybook/preview-head.html
// (mirroring layout.tsx) — it is not part of globals.css.
import '../src/app/globals.css'

// Mode toolbar (T-022-03). The three skins are presented as MODES, not separate
// components: structure (lens cards, chat bubbles, sheets, screen layouts) is
// identical everywhere — only radii, shadows and colours change per mode. Mirrors
// the app's runtime switch in src/lib/theme.tsx: `data-theme` on <html>, with the
// token files scoping each skin (tokens-kawaii.css / tokens-notepad.css) and
// cyberpunk as the bare `:root` default. Ordered light → cheerful → dark.
const MODES = [
  { value: 'notepad', title: 'Light · Notepad' },
  { value: 'kawaii', title: 'Cheerful · Kawaii' },
  { value: 'cyberpunk', title: 'Dark · Cyberpunk' },
] as const

// Global decorator: apply the selected theme by setting `data-theme` on the iframe
// <html> — NOT a wrapper node. The token selectors are `html[data-theme="…"]`, so a
// wrapper would silently render cyberpunk regardless. Setting it on <html> also
// re-paints <body> per theme for free (kawaii pink / notepad ruled-paper / cyberpunk
// dark + scanline), which is why no manual `backgrounds` list is needed anymore.
// useLayoutEffect sets it before paint (no default-theme flash); keying on `theme`
// re-asserts on every theme change AND every story mount, so there's no leakage
// between stories.
// The hook lives in a real (capitalized) component so react-hooks/rules-of-hooks
// is satisfied — a bare decorator function is neither a component nor a hook.
function ThemeHtmlSync({ theme, children }: { theme: string; children: React.ReactNode }) {
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
  // ThemeProvider keyed on the toolbar theme: components that read useTheme() in
  // JS (portraits via portraitFor, semantic branches) need the real provider, not
  // the context default (cyberpunk). The key remounts it per toolbar switch so its
  // mount-time read of data-theme always matches. Without this, stories render
  // cyberpunk portraits in notepad/kawaii.
  return <ThemeProvider key={theme}>{children}</ThemeProvider>
}

// Compare-all-modes grid: render the story three times, once per skin, each in a
// wrapper scoped to that mode. Forces <html> to the cyberpunk :root base so the
// notepad/kawaii cells override cleanly via their element-scoped selectors and the
// cyberpunk cell inherits the base. This is why kawaii's tokens are element-scoped
// (tokens-kawaii.css) alongside notepad's.
// NOTE: best for inline components. A story that renders a fixed/portal overlay
// (the sheets) will stack three viewport-filling copies — use single mode there.
function CompareGrid({ Story }: { Story: () => React.JSX.Element }) {
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', 'cyberpunk')
  }, [])
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: '#d9d9e3', minHeight: '100vh' }}>
      {MODES.map((m) => (
        <div
          key={m.value}
          {...(m.value !== 'cyberpunk' ? { 'data-theme': m.value } : {})}
          style={{ background: 'var(--bg)', padding: 16, overflow: 'auto' }}
        >
          <div style={{ font: '600 11px system-ui', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-sub)', marginBottom: 12 }}>
            {m.title}
          </div>
          <Story />
        </div>
      ))}
    </div>
  )
}

const withModes = (
  Story: () => React.JSX.Element,
  context: { globals: { theme?: string; compare?: boolean } },
) => {
  if (context.globals.compare) return <CompareGrid Story={Story} />
  const theme = context.globals.theme ?? 'cyberpunk'
  return (
    <ThemeHtmlSync theme={theme}>
      <Story />
    </ThemeHtmlSync>
  )
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
  decorators: [withClerkState, withModes],
  globalTypes: {
    theme: {
      description: 'MindShift skin, as a mode (light / cheerful / dark)',
      toolbar: {
        title: 'Mode',
        icon: 'contrast',
        items: MODES.map((m) => ({ value: m.value, title: m.title })),
        dynamicTitle: true,
      },
    },
    compare: {
      description: 'Show one mode, or all three side by side',
      toolbar: {
        title: 'View',
        icon: 'sidebyside',
        items: [
          { value: false, title: 'Single mode' },
          { value: true, title: 'Compare all 3' },
        ],
        dynamicTitle: true,
      },
    },
  },
  // App default (src/lib/theme.tsx DEFAULT). Replaces the deprecated
  // globalTypes.defaultValue.
  initialGlobals: { theme: 'cyberpunk', compare: false },
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
