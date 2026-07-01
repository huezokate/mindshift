# T-023-03 · Plan — ordered implementation steps

Small, independently-verifiable steps. Each is committable. Testing strategy is
build-time compile (every story type-checks under the Vite builder) + a visual
toolbar pass. There are no unit tests for `*.stories.tsx` — the build IS the test.

## Step 1 — Mindmap detail fixture
- Create `src/components/__fixtures__/mindmap.ts`.
- Export `AREA_DETAILS: Record<AreaId, AreaDetail>` — one entry per area
  (`career, health, relationship, personal, finance`), each with a short
  `description`, sensible `done`/`total`, and 2–3 `milestones` (2–3 `actions` each).
- Import `AreaDetail` type from `MindmapAreaCard`, `AreaId` from `mindmap-areas`.
- **Verify:** `tsc`/build picks up the type; no `any`. (Compiled in Step 6.)

## Step 2 — MindmapAreaCard stories
- Create `src/components/mindmap/MindmapAreaCard.stories.tsx`.
- `title: 'Mindmap/MindmapAreaCard'`. Stories: `Folded`, `Unfolded` (career +
  `AREA_DETAILS.career`), `Gallery` (career/health/relationship folded, in a
  padded flex-wrap row so sticker icons aren't clipped).
- Read `area` from `AREA_BY_ID`.
- **Verify:** renders all three modes; Gallery shows 3 distinct icons/labels.

## Step 3 — AreaIcon stories
- Create `src/components/mindmap/AreaIcon.stories.tsx`.
- `title: 'Mindmap/AreaIcon'`. `Single` (arg-controlled `id`/`size`, wrapped in a
  `var(--cyan)` decorator) + `AllAreas` (grid over `AREAS`: icon + label caption).
- `argTypes.id` = inline-radio of the five `AreaId`s.
- **Verify:** five glyphs paint; recolor with the toolbar.

## Step 4 — ThemeSwitcher story
- Create `src/components/ThemeSwitcher.stories.tsx`.
- `title: 'Components/ThemeSwitcher'`, single `Default` render.
- Header comment: no-provider caveat (renders inert; toolbar is the real control).
- **Verify:** `.ms-switcher` paints; buttons show per-theme `--sw-*-bg`.

## Step 5 — AppHeader MenuOpen story
- Edit `src/components/nav/AppHeader.stories.tsx`: add `MenuOpen` with a
  `play` fn (`storybook/test` → `within`/`userEvent`) clicking the
  `Account menu` button; args `entryCount:12, lensCount:34`, `clerk.signedIn:true`.
- Keep existing `SignedIn`/`SignedOut`.
- **Verify:** dropdown opens in the canvas; Button variants render; no fetch/console error.

## Step 6 — Build verification
- Run `npm run build-storybook`.
- **Pass criteria:** clean compile — every story (incl. the three pre-existing
  untracked ones + the new fixture + the play import) type-checks and builds.
- Fix any type/resolve errors surfaced, re-run until green.

## Step 7 — Lint the touched files
- `npm run lint` scoped to the new/edited files (or full if fast).
- **Pass criteria:** no new lint errors in the added stories/fixture.

## Step 8 — Commit
- Stage: `__fixtures__/mindmap.ts`, the four new/edited story files, and the three
  pre-existing untracked stories (AppHeader/EntryAuthRow/AuthBanner) that this
  ticket owns.
- One commit: `test(storybook): nav + mindmap component stories (T-023-03)`.
- Do NOT touch unrelated working-tree changes (portraits, other stories, etc.).

## Testing strategy summary
- **Build-time (automated):** `build-storybook` compiles/type-checks all stories.
  This is the objective gate for AC-#1 (each component has a story) and AC-#4
  (router/Clerk components mount — a mount crash fails the play/render at build in
  the test-runner sense; at minimum a type/resolve error fails the build).
- **Visual (manual, documented in Review):** `npm run storybook`, cycle the Theme
  toolbar on each new story → AC-#3 (re-theme) and AC-#5 (no console errors);
  confirm AreaIcon glyphs paint and AppHeader's dropdown opens cleanly.
- **Out of scope:** no component-behavior unit tests, no snapshot suite — this is a
  Storybook-coverage ticket; the app bundle is untouched (nothing imports `.stories`).

## Rollback
Each file is additive/isolated. Worst case: revert a single story file; the app
build and the other stories are unaffected.
