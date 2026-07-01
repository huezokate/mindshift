# T-023-03 · Structure — file-level blueprint

The shape of the change: which files are created/modified, their public surface,
and the ordering. Not code — the blueprint.

## File change map

| Action | Path | Purpose |
|---|---|---|
| **create** | `src/components/__fixtures__/mindmap.ts` | Tree-shaken `AreaDetail` fixtures for the MindmapAreaCard stories |
| **create** | `src/components/mindmap/MindmapAreaCard.stories.tsx` | Folded / Unfolded / Gallery |
| **create** | `src/components/mindmap/AreaIcon.stories.tsx` | AllAreas grid + Single (arg control) |
| **create** | `src/components/ThemeSwitcher.stories.tsx` | Single smoke render |
| **modify** | `src/components/nav/AppHeader.stories.tsx` | Add `MenuOpen` play-function story; keep SignedIn/SignedOut |
| **commit as-is** | `src/components/nav/EntryAuthRow.stories.tsx` | Already correct (both auth states) |
| **commit as-is** | `src/components/AuthBanner.stories.tsx` | Already correct (Default / WithReason) |

No app/runtime source files change. No config changes (main.ts/preview.tsx already
provide every mock the new stories need). Nothing new is added to `package.json` —
`storybook/test` is a bundled entrypoint of the existing `storybook` dep.

## `__fixtures__/mindmap.ts` — public surface

```
import type { AreaId } from '@/lib/mindmap-areas'
import type { AreaDetail } from '@/components/mindmap/MindmapAreaCard'

export const AREA_DETAILS: Record<AreaId, AreaDetail>
```

- One `AreaDetail` per area id: a one-sentence `description`, `done`/`total`
  counts, and 2–3 `milestones` each with 2–3 `actions`. Realistic but short.
- Re-exports nothing else. Imported only by `*.stories.tsx` → tree-shaken from
  `next build` (same guarantee as `__fixtures__/journal.ts`).
- `AreaDetail` type is imported from the component file (it is exported there),
  not redefined — single source of truth.

## `MindmapAreaCard.stories.tsx` — public surface

```
meta = { title: 'Mindmap/MindmapAreaCard', component: MindmapAreaCard }
Folded:   { args: { area: AREA_BY_ID.career, detail: AREA_DETAILS.career } }
Unfolded: { args: { area: AREA_BY_ID.career, detail: AREA_DETAILS.career, unfolded: true } }
Gallery:  { render: () => <row of 3 folded cards: career, health, relationship> }
```

- `area` sourced from `AREA_BY_ID` (mindmap-areas), `detail` from `AREA_DETAILS`.
- Gallery uses a flex-wrap row with generous gap so the corner sticker icons
  (which overflow `top:-16 left:-14`) aren't clipped — wrap in a padded container.
- Header comment: pure presentational card, no mocks needed; notes the fixed
  paper drop-shadow doesn't re-theme (structural accents do).

## `AreaIcon.stories.tsx` — public surface

```
meta = { title: 'Mindmap/AreaIcon', component: AreaIcon, args: { id: 'career', size: 36 },
         argTypes: { id: { control: 'inline-radio', options: [5 AreaIds] }, size: { control: 'number' } } }
Single:   { args: { id: 'career', size: 48 } }   // wrapped/colored via a decorator or render
AllAreas: { render: () => <grid over AREAS: icon(size 36) + label caption> }
```

- Both stories render inside a `color: var(--cyan)` container so the
  `fill=currentColor` glyphs are visible on every theme (mirrors Icon.stories
  `Glyphs`). For `Single`, a `decorators` wrapper applies the color so the arg
  control still drives `id`/`size`.
- `AllAreas` maps `AREAS` (not a hardcoded list) → stays in sync with the source.

## `ThemeSwitcher.stories.tsx` — public surface

```
meta = { title: 'Components/ThemeSwitcher', component: ThemeSwitcher }
Default: {}   // bare render
```

- Header comment documents the no-provider caveat: `useTheme()` resolves to the
  context default, so cyberpunk shows active and clicks are inert; the toolbar is
  the real theme control. Smoke check that `.ms-switcher` paints per theme.

## `AppHeader.stories.tsx` — modification

Keep the existing `meta`, `SignedIn`, `SignedOut`. Add:

```
import { within, userEvent } from 'storybook/test'

MenuOpen: {
  args: { entryCount: 12, lensCount: 34 },
  parameters: { clerk: { signedIn: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Account menu' }))
  },
}
```

- Targets the existing `aria-label="Account menu"` trigger; opens the dropdown so
  the primary/journal/mindmap Button variants render for cross-theme review.
- `entryCount`/`lensCount` as props short-circuit the counts fetch (no network).
- Import path `storybook/test` (SB10 bundled entry — confirmed resolvable), not
  `@storybook/test` (not a dependency).

## Ordering of changes

1. `__fixtures__/mindmap.ts` first — the MindmapAreaCard story depends on it.
2. `MindmapAreaCard.stories.tsx`, `AreaIcon.stories.tsx`, `ThemeSwitcher.stories.tsx`
   (independent of each other).
3. `AppHeader.stories.tsx` MenuOpen edit.
4. `build-storybook` to type-check/compile all of it; fix any errors.
5. Visual pass, then commit (fixtures + new stories in one logical unit; the
   pre-existing untracked stories committed alongside).

## Module boundaries / invariants preserved

- Stories never import app data layers (Supabase/fetch) — only fixtures, the
  areas source, and the components. AppHeader's guarded fetch is neutralized by props.
- No `data-theme` set inside any story (toolbar owns it).
- Areas/icon ids always read from `mindmap-areas.ts`, never re-listed, so the
  stories can't drift from the app's area set.
