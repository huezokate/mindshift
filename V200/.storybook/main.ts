import type { StorybookConfig } from '@storybook/nextjs-vite';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

// Storybook-only substitute for @clerk/nextjs (T-022-04). The framework mocks
// next/navigation itself, but Clerk has no Storybook context, so its hooks crash
// on mount — we alias the bare specifier to a hand-written mock.
const clerkMock = fileURLToPath(new URL('./mocks/clerk.tsx', import.meta.url));

const config: StorybookConfig = {
  // `*.stories.@(tsx|mdx)` for component stories; `*.mdx` also, so docs-only
  // pages without the `.stories.` infix (e.g. src/stories/Themes.mdx, T-023-04)
  // are discovered. The `.mdx` glob is scoped to src and matches nothing else today.
  stories: ['../src/**/*.stories.@(tsx|mdx)', '../src/**/*.mdx'],
  addons: ['@storybook/addon-docs'],
  framework: '@storybook/nextjs-vite',
  staticDirs: ['../public'],
  // Tailwind v4 is CSS-first (`@import "tailwindcss"` in globals.css). The Vite
  // builder needs the first-party @tailwindcss/vite plugin to expand it — the
  // app's @tailwindcss/postcss pipeline does NOT flow into Storybook (T-022-02).
  viteFinal: async (cfg) => {
    cfg.plugins = cfg.plugins ?? [];
    cfg.plugins.push(tailwindcss());

    // Exact-match regex (anchored) so ONLY the bare `@clerk/nextjs` import is
    // swallowed — `@clerk/nextjs/server` (used by server code, never in stories)
    // is left alone. resolve.alias can be an object or an array; normalize to the
    // array form before appending.
    cfg.resolve = cfg.resolve ?? {};
    const existing = cfg.resolve.alias;
    const aliases = Array.isArray(existing)
      ? existing
      : Object.entries(existing ?? {}).map(([find, replacement]) => ({
          find,
          replacement: replacement as string,
        }));
    aliases.push({ find: /^@clerk\/nextjs$/, replacement: clerkMock });
    cfg.resolve.alias = aliases;

    return cfg;
  },
};
export default config;
