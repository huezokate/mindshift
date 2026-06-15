# T-018-04 — Plan

Ordered, independently-verifiable steps. One atomic commit at the end (single logical
change: extract shared arrow + move inside popup + card glyph audit).

## Step 1 — Create `CircularArrow` primitive

- New file `V200/src/components/ui/CircularArrow.tsx` per structure.md interface.
- Props: `direction`, `onClick`, `ariaLabel`, `size = 44`, `disabled = false`, `style`.
- Renders `<button type="button">` circle (2px cyan border, card-bg, cyan color) wrapping
  `<Icon name="chevron_left|chevron_right" size={round(size*0.6)} weight={500} />`.
- **Verify:** `npx tsc --noEmit` clean (component compiles standalone, unused-import-free).

## Step 2 — Wire arrows into the popup, remove edge arrows

- In `lens/page.tsx`:
  - Add imports: `CircularArrow` and `Icon`.
  - Delete the two overlay-edge `<button>`s (literal `‹` / `›`, `absolute left-3/right-3`).
  - Wrap the 120px portrait in a `flex items-center justify-between w-full` row with
    `<CircularArrow direction="prev"…/>` before and `direction="next"` after, each
    `onClick={e => { e.stopPropagation(); prev/nextPreview() }}`.
- **Verify:** `npx tsc --noEmit` clean; visually (read-through) the overlay `motion.div`
  has no `absolute` children; arrows sit in the portrait row.

## Step 3 — Card iconography audit (Back glyph → Material Symbols)

- Replace the literal `← Back` with `<Icon name="arrow_back" size={16}/>` + `Back` in a
  flex row (gap ~6px), keeping the existing button tokens/padding.
- Confirm no other literal-glyph icons remain in the popup card; confirm no hardcoded hex
  introduced (tokens only).
- **Verify:** `npx tsc --noEmit` clean.

## Step 4 — Full-file review + theme reasoning

- Re-read the modified overlay block end-to-end:
  - arrows are children of the card, not the overlay;
  - `prev/next` still cycle modulo `FIGURES.length`;
  - backdrop click still closes; arrow clicks still `stopPropagation`;
  - all colors via `var(--cyan)`, `var(--card-bg)`, `--fig-*`, `--btn-*` (no hex).
- Reason through 3 themes: cyan + card-bg + card borders resolve per theme → arrows and
  card inherit each theme automatically.
- **Verify:** final `npx tsc --noEmit` → 0 errors.

## Step 5 — Commit

- Stage **only** `V200/src/components/ui/CircularArrow.tsx` and
  `V200/src/app/app/lens/page.tsx` (leave all sibling-ticket uncommitted edits intact).
- Message:
  `refactor(lens): shared CircularArrow inside picker popup + Material chevrons (T-018-04)`
- Co-authored trailer per repo convention.

## Testing strategy

- **No unit-test harness in the repo** for these presentational client components
  (consistent with sibling T-018 tickets, which verified via tsc + read-through). So:
  - **Type check** is the automated gate: `npx tsc --noEmit` must stay at 0 errors.
  - **Static review** substitutes for runtime: confirm render-tree move + token-only
    styling + Material-Symbols-only icons.
- **Manual QA deferred to Kate / a browser session** (cannot launch a browser here):
  - Open `/app/lens`, tap a figure → popup; arrows render as cyan circles flanking the
    portrait, inside the card; ‹/› navigate; Back/Select unchanged.
  - Repeat in kawaii + notepad (theme-select) → arrows recolor via tokens.
- **Verification criteria (AC mapping):**
  - "arrows = shared circular arrow component, inside the popup" → `CircularArrow` exists
    in `components/ui/`, used by both arrows, rendered within the card. ✅
  - "lens card audited against get_design_context; discrepancies fixed" → Back glyph
    migrated to Material Symbols; tokens-only confirmed; residual pixel-spec items
    flagged in review.md as needing the live Figma node. ✅ (partial — see review).
  - "tsc clean" → Step 4 gate. ✅

## Rollback

- Single commit; revert restores the prior overlay-edge arrows. The new file is inert if
  unreferenced. No data/migration/runtime-state involved.
