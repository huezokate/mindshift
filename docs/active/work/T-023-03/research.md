# T-023-03 · Research — Nav & Mindmap component stories

Descriptive map of the nav/mindmap/root presentational surface and the Storybook
infra the stories plug into. What exists, where, how it connects. No solutions.

## Scope (from ticket)

Remaining presentational components outside `ui/` and `journal/`:

| Component | Path | Story today? |
|---|---|---|
| AppHeader | `src/components/nav/AppHeader.tsx` | **exists** (untracked) |
| EntryAuthRow | `src/components/nav/EntryAuthRow.tsx` | **exists** (untracked) |
| MindmapAreaCard | `src/components/mindmap/MindmapAreaCard.tsx` | missing |
| AreaIcon | `src/components/mindmap/AreaIcon.tsx` | missing |
| ThemeSwitcher | `src/components/ThemeSwitcher.tsx` | missing |
| AuthBanner | `src/components/AuthBanner.tsx` | **exists** (untracked) |

Three story files already exist from the T-022-04 smoke era (untracked in git):
`AppHeader.stories.tsx`, `EntryAuthRow.stories.tsx`, `AuthBanner.stories.tsx`.
They must be **committed / expanded**, not recreated. The three genuinely-new
stories are MindmapAreaCard, AreaIcon, ThemeSwitcher.

## Storybook infra already in place (deps: S-022, T-023-01)

- `.storybook/main.ts` — globs `../src/**/*.stories.@(tsx|mdx)`; framework
  `@storybook/nextjs-vite`; `staticDirs: ['../public']`; Tailwind v4 via
  `@tailwindcss/vite`; aliases bare `@clerk/nextjs` → `.storybook/mocks/clerk.tsx`
  (exact-match regex, leaves `/server` alone).
- `.storybook/preview.tsx` — two global decorators + toolbar:
  - `withTheme` — sets `data-theme` on the iframe `<html>` from the Theme toolbar
    (cyberpunk / kawaii / notepad). Token skins are scoped `html[data-theme="…"]`;
    cyberpunk is bare `:root`. A wrapper `<div data-theme>` does NOT re-theme.
  - `withClerkState` — pushes `parameters.clerk` into the Clerk mock singleton
    before render. Default `{ signedIn: true }`.
  - `parameters.nextjs.appDirectory: true` — every story gets the framework's
    `next/navigation` mock, so `useRouter()/usePathname()/useSearchParams()`
    return spies instead of throwing. No per-story router setup needed.
- `.storybook/mocks/clerk.tsx` — module-singleton mock: `useUser`, `useAuth`,
  `useClerk` (`signOut` = async noop), `ClerkProvider`, `SignedIn/Out`, etc.
  Default user "Ada Lovelace". Flip per story via `parameters: { clerk: {...} }`.
- `src/components/__fixtures__/journal.ts` — precedent for a tree-shaken,
  stories-only fixture module. Nothing equivalent yet for mindmap data.
- Scripts: `npm run build-storybook` (build-time compile of every story = the
  headless proof); `npm run storybook` (human visual/theme pass).

## Component inventory

### AppHeader (`nav/AppHeader.tsx`, `'use client'`)
- Props: `entryCount?`, `lensCount?`, `mindmapHorizon?`, `mindmapProgress?`.
- Runtime deps: `useRouter` (nav mock), `useUser` + `useClerk` (Clerk mock —
  reads `user.username` / `primaryEmailAddress`, calls `signOut`), `useTheme`.
- Heaviest isolation case: the only component touching **all three** mock
  surfaces. Renders a bar (brand + Menu button); the dropdown is internal
  `open` state (default closed) — the rows (design-system `Button` variants
  primary/journal/mindmap) only appear after the Menu click.
- Self-fetches `/api/journal-v2/counts` on mount **only** when signed-in AND
  counts not passed as props. In Storybook that 404s; the fetch is `.catch(()=>{})`
  guarded and `r.ok`-checked → degrades to 0, no crash. Passing `entryCount`/
  `lensCount` as props short-circuits the effect entirely (no fetch).

### EntryAuthRow (`nav/EntryAuthRow.tsx`, `'use client'`)
- Props: `maxWidth?`, `className?`.
- Runtime deps: `useUser` only. Its entire job is auth-state-dependent:
  signed-in → greeting reading the mock user's `firstName`; signed-out (and the
  undefined/loading state) → two equal Log in / Sign up pills (`next/link`).
- Cheapest auth-dependent component — the canonical AC-#2 demo (both states).

### MindmapAreaCard (`mindmap/MindmapAreaCard.tsx`, server-safe, no hooks)
- Props: `area: Area`, `detail: AreaDetail`, `unfolded = false`, `width = 331`.
- `AreaDetail = { description, done, total, milestones: {title, actions[]}[] }`.
- No runtime deps beyond `AreaIcon` (pure) — a plain presentational card. No
  Clerk/router/theme hooks. Renders **folded** (progress bar + milestone/action
  counts) or **unfolded** (overall-progress box + full milestone list).
- Tokens: `--card-bg`, `--bg`, `--text-body`, `--pink`, `--font-display`,
  `--font-body`; `BLUE = var(--cyan)`, `GREEN = var(--green)`. So it **does**
  re-theme on the structural accents. Two constants are hardcoded: the paper
  drop-shadow `#d4cbbf` and an inline `rgba(30,30,64,0.55)` sub-label — cosmetic,
  designed for the notepad frame, do not re-theme (noted for Design).

### AreaIcon (`mindmap/AreaIcon.tsx`, pure)
- Props: `id: AreaId`, `size = 24`. Renders one 24×24 `<svg>` with `fill=currentColor`.
- `PATHS: Record<AreaId, string>` — five glyphs: `career, health, relationship,
  personal, finance`. Inherits surrounding text color (so color it via a wrapper).

### ThemeSwitcher (`components/ThemeSwitcher.tsx`, `'use client'`)
- No props. `useTheme()` (from `src/lib/theme.tsx`). Maps `THEMES`
  (`['cyberpunk','kawaii','notepad']`) to `.ms-switcher-btn` buttons with
  `data-active`. Styling lives in `globals.css` (`.ms-switcher*`, `--sw-*-bg`
  tokens) — imported by `preview.tsx`, so it paints in Storybook.
- **No ThemeProvider in the preview cascade.** `useTheme()` falls back to the
  context default (`theme: 'cyberpunk'`, `setTheme` = noop), so the switcher
  renders with cyberpunk marked active and clicks are inert (no crash). It does
  NOT drive the toolbar — the toolbar is the real theme control (redundant, per
  ticket). This is a smoke check that the control itself paints per theme.

### AuthBanner (`components/AuthBanner.tsx`, `'use client'`)
- No props. `useSearchParams().get('reason')` picks copy from a `REASONS` map
  (`lens_limit/vent_limit/save/journal`) else `DEFAULT`. Story overrides the
  mocked query via `parameters.nextjs.navigation.query`.

## Data & types

- `src/lib/mindmap-areas.ts` — `AreaId`, `Area {id,label,prompt}`, `AREAS[]`
  (5 areas), `AREA_BY_ID`. The single source of truth the stories should read
  from (never redefine areas inline).
- No existing fixture for `AreaDetail` — the mindmap card needs one built for
  stories (description + milestones + done/total per area).

## Constraints / assumptions surfaced

1. **No Supabase/network in stories** (AC). MindmapAreaCard/AreaIcon/ThemeSwitcher
   are all network-free. AppHeader's only mount-time async is the guarded counts
   fetch — neutralized by passing `entryCount`/`lensCount` props on signed-in.
2. **Re-theme via the toolbar only** — never a `data-theme` wrapper (won't cascade
   onto `html`).
3. **MindmapAreaCard is notepad-first.** Its structural accents are tokens (re-skin),
   but the paper drop-shadow + one rgba sub-label are fixed. It will render on all
   three themes without error; the shadow just stays paper-colored. Design decision:
   accept as-is (a stories ticket does not refactor component internals).
4. **AreaIcon `fill=currentColor`** — a story must wrap it in a colored container
   (`var(--cyan)`) or the glyphs inherit whatever the canvas text color is.
5. **ThemeSwitcher without a provider** is intentionally inert — document it so a
   reviewer doesn't file "clicking does nothing" as a bug.
6. Verification: `npm run build-storybook` compiles every story (headless proof);
   `npm run storybook` for the visual/theme eyeball pass (AC: no console errors).
