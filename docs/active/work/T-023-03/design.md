# T-023-03 · Design — Nav & Mindmap component stories

Decisions, grounded in Research. Each acceptance criterion mapped to a concrete
story shape. Rejected alternatives recorded with rationale.

## Guiding decision: mirror the established CSF3 precedent

T-023-01/02 set the house style: CSF3, `title: '<Group>/<Component>'`, per-state
named exports, a header comment explaining what the story proves and which mock it
leans on. Every story here follows that — no new patterns invented. This keeps the
whole Storybook legible as one thing and lets the two global decorators (theme
toolbar + Clerk state) do all the cross-cutting work.

## Per-component story design

### AppHeader — keep smoke, add an opened-dropdown story
Existing `SignedIn`/`SignedOut` already satisfy AC-#1 and AC-#4 (mounts with the
router + Clerk mocks). But the bar alone hides the interesting surface: the
dropdown rows are the design-system `Button` variants (primary/journal/mindmap)
that carry the per-theme accent swap — exactly what a cross-theme reviewer wants
to see. The `open` state is internal (no prop).

**Decision:** keep `SignedIn` (with `entryCount`/`lensCount` so the collapsed meta
labels populate and the counts fetch is short-circuited) and `SignedOut`, and add
one `MenuOpen` story that uses a Storybook **play function** to click the "Account
menu" button so the dropdown renders in the canvas. Play interactions are already
available via the framework; a single `userEvent.click` keeps it minimal.

- *Rejected — expose an `open`/`defaultOpen` prop just for stories.* Changing the
  component API to serve Storybook is backwards; a stories ticket must not mutate
  component internals. Play function reaches the same state with zero app changes.
- *Rejected — leave AppHeader untouched (bar only).* Legal per AC but wastes the
  richest per-theme surface in the ticket; the dropdown Button variants are the
  whole reason AppHeader is worth a story.

### EntryAuthRow — keep both auth states (already correct)
`SignedOut` + `SignedIn` via `parameters.clerk` directly satisfy AC-#1 ("both auth
states"). No change beyond committing the file. Header comment already explains it.

### MindmapAreaCard — folded + unfolded + a multi-area gallery
Props need an `area` (from `AREAS`) and an `AreaDetail`. No fixture exists, so
build one: `src/components/__fixtures__/mindmap.ts` exporting a small
`AREA_DETAILS: Record<AreaId, AreaDetail>` (or a `detailFor(id)` helper) with
realistic description + 2–3 milestones + done/total per area. Mirrors the
tree-shaken `__fixtures__/journal.ts` precedent.

Stories:
- `Folded` — one card (career), `unfolded={false}`: shows progress bar + the
  "N milestones / M actions planned" summary.
- `Unfolded` — same area, `unfolded`: shows the overall-progress box + full
  milestone/action list (the tall detail state).
- `Gallery` — a `render` fn laying 3 folded cards side by side (career / health /
  relationship) so the different `AreaIcon`s + labels are visible together and
  cross-theme consistency of the card chrome is obvious at a glance. Satisfies
  AC-#2 ("multiple area variants").

- *Rejected — one story per area (5 folded + 5 unfolded).* Ten near-identical
  stories add noise, not signal; a single gallery communicates the variance better
  and the two singles cover the two render modes. AC asks for "a few representative
  areas", not all five twice.
- *Rejected — inline the `AreaDetail` data in each story.* Duplicated demo prose
  across stories drifts; a shared fixture (like journal.ts) keeps it in one place
  and documents intent once.
- *Note on re-theme:* the card's accents are tokens (re-skin), only the paper
  drop-shadow + one rgba label are fixed (Research §3). Accept as-is; call it out
  in Review. Not a blocker for AC-#3 (the card DOES re-theme its structural colors).

### AreaIcon — the full icon set as a labeled grid
AC-#2 wants "the full icon set". `AreaIcon` renders `fill=currentColor`, so wrap
the grid in a `var(--cyan)`-colored container to make glyphs visible on every
theme (mirrors `Icon.stories.tsx` `Glyphs`).

Stories:
- `AllAreas` — a `render` grid over `AREAS`, each cell = the icon (size ~36) +
  its `area.label` caption. One glance proves all five glyphs paint and recolor.
- `Single` — a default single icon (career) with an `id` arg control, so the
  Controls panel can swap between the five ids. Cheap, matches Icon.stories.

- *Rejected — hardcode the five ids in the story.* Reading `AREAS`/`AreaId` from
  the source keeps the grid in lockstep if an area is ever added/removed.

### ThemeSwitcher — single smoke story
AC-#1 only needs one story; the ticket frames it as a smoke check redundant with
the toolbar. One `Default` export rendering `<ThemeSwitcher />`. Header comment
documents the no-provider caveat (renders cyberpunk active, clicks inert, does not
drive the toolbar) so a reviewer doesn't mistake inertness for a bug.

- *Rejected — wrap the story in a real `ThemeProvider` so clicks work.* The
  provider writes `localStorage` + sets `data-theme` on `<html>`, which would fight
  the `withTheme` toolbar decorator (two writers of the same attribute) and leak
  state between stories. The toolbar is the sanctioned theme control; the switcher
  story is deliberately a passive render.

### AuthBanner — keep Default + WithReason (already correct)
Satisfies the "include if quick" note; the `nextjs.navigation.query` override
proves the `useSearchParams` mock. Commit as-is.

## Cross-cutting decisions

- **AC-#3 (re-theme across 3 themes)** is delivered by the global `withTheme`
  toolbar, not per-story wiring — no story sets `data-theme` itself. Verified by
  eyeballing the toolbar cycle. Structural-token components (all six) re-skin;
  MindmapAreaCard's fixed paper shadow is the one documented exception.
- **AC-#4 (router/Clerk mount safely)** — AppHeader is the proof; passing counts
  props avoids the only mount-time fetch. Nothing else here fetches.
- **AC-#5 (no console errors)** — the play-function click on AppHeader must target
  an accessible name that exists (`aria-label="Account menu"`); everything else is
  static render. Verified in the visual pass.
- **Fixture placement** — `__fixtures__/mindmap.ts`, stories-only import, so it's
  tree-shaken from `next build` (identical rationale to journal.ts).

## Verification strategy (feeds Plan)

1. `npm run build-storybook` — compiles/type-checks every story incl. the new
   fixture and the play function. Build-time proof of AC-#1/#4.
2. `npm run storybook` visual pass — cycle the toolbar on each new story for
   AC-#3, confirm the AreaIcon grid paints (not fallback text) and AppHeader's
   dropdown opens cleanly with no red console output (AC-#5).
