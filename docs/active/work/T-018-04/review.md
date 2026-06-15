# T-018-04 — Review

Handoff for the lens-picker popup polish. Commit `6e93cc1` on
`feat/landing-figure-vent`.

## What changed

| File | Change |
|---|---|
| `V200/src/components/ui/CircularArrow.tsx` | **New.** Shared circular nav-arrow primitive. Token-driven `<button>` (2px `--cyan` border, `--card-bg`, `--cyan` glyph, 50% radius, `flex-shrink-0`, `disabled`/`opacity` states) wrapping a Material Symbols `<Icon name="chevron_left\|chevron_right">`. Props: `direction`, `onClick`, `ariaLabel`, `size = 44`, `disabled`, `style`. |
| `V200/src/app/app/lens/page.tsx` | Imports `Icon` + `CircularArrow`. Removed both overlay-edge absolute arrows (literal `‹`/`›`). Portrait now sits in a `flex justify-between` row flanked by `CircularArrow` prev/next **inside** the popup card. Back button's literal `←` → `<Icon name="arrow_back">`. |

Net: `+1` file, `~1` file. No token files, no sibling-ticket files, no API/schema/route
changes.

## Acceptance-criteria mapping

- ✅ **"Lens-picker arrows = the shared circular arrow component, inside the popup."**
  A single reusable `CircularArrow` (in `components/ui/`, alongside `Icon`) now backs both
  arrows, and they render within the detail `motion.div` (the popup), no longer pinned to
  the overlay edges. The overlay `motion.div` has zero absolutely-positioned children now.
- ◑ **"Lens card audited against get_design_context; discrepancies fixed."** Audited
  against the established T-018 conventions and the card's data contract: migrated the
  last literal-glyph icon (Back `←` → Material Symbols), confirmed tokens-only styling
  (no hex), confirmed the card reads the real `Figure` fields (name/era/quote/bio) rather
  than a hardcoded look-alike. **Partial:** see "Open concerns" for the items that need
  the live Figma node to close fully.
- ✅ **"tsc clean."** `npx tsc --noEmit` → 0 errors, unchanged from baseline.

## Test coverage

- **Automated:** type check only (`npx tsc --noEmit`, clean). The repo has **no unit/test
  harness** for these presentational client components — consistent with sibling T-018
  tickets, which gate on tsc + static review. No tests were added (none to extend; the new
  component is pure presentational with no logic branches beyond `direction`/`disabled`).
- **Static review (done):** render-tree move verified by re-read; `prev/nextPreview`
  cycling unchanged; backdrop-close + arrow `stopPropagation` preserved; styling resolves
  entirely from `--cyan` / `--card-bg` / `--fig-*` / `--btn-*` tokens.
- **Not run (needs a browser — deferred to Kate / a verify session):**
  - Visual: arrows render as cyan circles flanking the 120px portrait inside the card;
    ‹/› navigate figures; Back/Select unchanged.
  - 3-theme parity: switch kawaii / notepad → arrows + card recolor via tokens (no hex,
    so this is expected to hold, but unconfirmed at runtime).

## Open concerns / follow-ups

1. **Figma pixel-spec confirmation (the main gap).** The ticket cites FigJam flow nodes
   `95:2218` / `95:2223`, but the FigJam fileKey isn't in the repo and no design-file node
   for the lens screen was pinned, so I could not run `get_design_context` against the
   actual "screen-1 circular arrow component." I converged on the **existing** treatment
   (cyan, 2px border, `card-bg`) and the `CircularArrow` default **44px** diameter (was
   48px). If Kate has the design node handy, confirm: arrow diameter (44 vs 48), border
   weight, chevron weight/optical size, portrait↔arrow gap, and whether the arrow accent
   is cyan in all three themes or theme-specific. Adjusting any of these is a one-line
   prop/token tweak — `CircularArrow` was built to absorb it.
2. **"Screen-1" reuse.** `theme-select/page.tsx` still uses plain (non-circular) glyph
   arrows. If the design intends one shared circular arrow across screen-1 **and** the
   lens popup, adopting `CircularArrow` there is the natural next step — intentionally left
   out of this ticket's scope (would touch a non-ticket file).
3. **Material Symbols glyph availability.** `chevron_left/right` + `arrow_back` are
   standard Sharp glyphs and the stylesheet is loaded globally in `layout.tsx`; rendering
   was not visually confirmed this session (no browser).

## Risk assessment

Low. Additive primitive + a contained render-tree move within one client page, token-only
styling, tsc-clean, scoped to two files with no overlap against the in-flight sibling-
ticket edits. Reverting `6e93cc1` fully restores prior behavior; the new file is inert if
unreferenced.
