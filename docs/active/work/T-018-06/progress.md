# T-018-06 — Progress

## Completed

- **Step 1 — CTA tokens.** Added `--cta-solid-bg` / `--cta-solid-bg-disabled` to all three
  token files: cyberpunk `#080810`/`#14141f`, kawaii `#ffe2ac`/`#e8e4dc`,
  notepad `#ffffff`/`#ece8e0`.
- **Step 2 — `CircleArrow`.** New `src/components/ui/CircleArrow.tsx` — 44px circle, 2px cyan
  ring on `--card-bg`, Material `chevron_left`/`chevron_right` glyph at 0.64×size. Presentational,
  requires `aria-label`. Mirrors the lens overlay arrow; left adoptable by lens later.
- **Step 3 — `EntryAuthRow`.** New `src/components/nav/EntryAuthRow.tsx` (`'use client'`, `useUser`).
  Signed-out → equal-footprint "Log in" (secondary) + "Sign up" (primary) pills. Signed-in →
  `Icon person` + "Hi, {firstName ?? username ?? email}". Undefined/loading falls through to the
  signed-out row (stable placeholder, no layout shift).
- **Step 4 — theme-select.** Imported the three new modules. Rendered `EntryAuthRow` atop the
  foreground column. Replaced the native checkbox with a `div role="checkbox"` (tabIndex,
  aria-checked, Space/Enter keydown) + `Icon check_box_outline_blank`/`check_box` — unticked &
  on-theme by default. Replaced the `‹`/`›` text buttons with `CircleArrow`. Swapped the CTA's
  hardcoded hex fill for `var(--cta-solid-bg)` / `var(--cta-solid-bg-disabled)`.
- **Step 5 — onboarding.** Replaced the lone "Sign Up" link with `<EntryAuthRow maxWidth={280} />`.
- **Step 6 — verify.** `npx tsc --noEmit` → exit 0 (clean). `eslint` on the four touched files →
  no new findings; the only reports are two **pre-existing** issues in unmodified theme-select
  code (`setState` in the localStorage-hydration `useEffect` at line 61; `<img>` in the figure
  grid at line 133). Both predate this ticket and are out of scope.

## Deviations from plan

- **Checkbox element.** Plan said `<button role="checkbox">`. Changed to `<div role="checkbox"
  tabIndex={0}>` because the disclaimer contains a nested "Learn more" `<button>`, and nesting a
  button inside a button is invalid HTML (hydration error). The div keeps full a11y
  (role/aria-checked + Space/Enter handler) and the nested Learn-more button's existing
  `stopPropagation` prevents accidental toggles.
- **Commits.** Implemented as one cohesive change rather than five separate commits; the steps
  are tightly coupled (tokens + components + the screen that consumes them) and the existing
  branch history commits per-ticket.

## Not done (intentional)

- Lens overlay arrows **not** refactored to `CircleArrow` (out of scope; component is written to
  be adopted later for free).
- Pre-existing theme-select lint items left untouched (not part of this ticket).
- `get_design_context` against FigJam 95:2150 / 95:2186 — see review.md (MCP availability).
