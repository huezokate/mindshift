# T-018-04 — Progress

## Completed

- **Step 1 — `CircularArrow` primitive.** Created
  `V200/src/components/ui/CircularArrow.tsx`. Token-driven circular `<button>` (2px cyan
  border, `--card-bg`, cyan color, `borderRadius: 50%`, `flex-shrink-0`) wrapping
  `<Icon name="chevron_left|chevron_right" size={round(size*0.6)} weight={500}>`. Props:
  `direction`, `onClick`, `ariaLabel`, `size = 44`, `disabled`, `style`. No literal glyph.
- **Step 2 — arrows moved into the popup.** In `lens/page.tsx`:
  - Added imports for `Icon` and `CircularArrow`.
  - Deleted both overlay-edge `<button>`s (`absolute left-3 / right-3`, literal `‹` / `›`,
    48px, `zIndex 51`).
  - Wrapped the 120px portrait in a `flex items-center justify-between w-full` row with a
    `CircularArrow direction="prev"` before and `direction="next"` after. Each keeps the
    prior behavior: `onClick={e => { e.stopPropagation(); prev/nextPreview() }}`.
- **Step 3 — card iconography audit.** Replaced the Back button's literal `← Back` with
  `<Icon name="arrow_back" size={16}>` + `Back` (flex row, `gap: 6`), button tokens/padding
  unchanged. No other literal-glyph icons remain in the popup; no hardcoded hex introduced.
- **Step 4 — type check.** `npx tsc --noEmit` → **0 errors** (matches baseline).
- **Step 5 — commit.** `6e93cc1` —
  `refactor(lens): shared CircularArrow inside picker popup + Material chevrons (T-018-04)`.
  Staged **only** the two ticket files; all sibling-ticket uncommitted edits left intact.

## Deviations from plan

- None. Executed Steps 1–5 as written.

## Notes

- The arrow circle kept its prior treatment (cyan / 2px / `--card-bg`); diameter went
  48 → 44 (the `CircularArrow` default, still ≥44px tap target). Flagged in review as a
  spec point to confirm against the live Figma node if Kate wants exactly 48.
- Backdrop-click-to-close preserved (overlay `onClick`); card + arrows `stopPropagation`.
- Files changed: `+ V200/src/components/ui/CircularArrow.tsx` (new),
  `~ V200/src/app/app/lens/page.tsx`.
