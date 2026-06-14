# T-018-06 — Plan

Ordered, independently-verifiable steps. Each step is a clean commit boundary.
No automated test suite exists for these visual screens (see Testing strategy);
verification is `tsc`, production build, and a manual checklist.

## Step 1 — Add CTA tokens to all three themes
- `tokens.css`: `--cta-solid-bg: #080810; --cta-solid-bg-disabled: #14141f;`
- `tokens-kawaii.css`: `--cta-solid-bg: #ffe2ac; --cta-solid-bg-disabled: #e8e4dc;`
- `tokens-notepad.css`: `--cta-solid-bg: #ffffff; --cta-solid-bg-disabled: #ece8e0;`
- Verify: grep confirms the token in all three files.
- Commit: `style(tokens): solid CTA fill tokens per theme (T-018-06)`

## Step 2 — `CircleArrow` component
- Create `src/components/ui/CircleArrow.tsx` per structure.md.
- Verify: `tsc --noEmit` clean; component imports `Icon` correctly.
- Commit: `feat(ui): CircleArrow nav button (T-018-06)`

## Step 3 — `EntryAuthRow` component
- Create `src/components/nav/EntryAuthRow.tsx` per structure.md.
- Signed-out → equal Log in / Sign up links; signed-in → "Hi, {name}".
- Handle `isSignedIn === undefined` (render signed-out placeholder).
- Verify: `tsc --noEmit` clean.
- Commit: `feat(nav): EntryAuthRow — sign-up prominent + name when authed (T-018-06)`

## Step 4 — theme-select wiring
- Add imports (`Icon`, `CircleArrow`, `EntryAuthRow`).
- Render `EntryAuthRow` atop the foreground column.
- Replace native checkbox with custom `role="checkbox"` button + Icon glyph; preserve the
  nested Learn-more toggle's `preventDefault`/`stopPropagation`.
- Replace `‹`/`›` text buttons with `CircleArrow`.
- Swap CTA hardcoded fill → `var(--cta-solid-bg)` / `var(--cta-solid-bg-disabled)`.
- Verify: `tsc --noEmit` clean; visual checklist below.
- Commit: `feat(theme-select): circular arrows, custom checkbox, solid CTA, auth row (T-018-06)`

## Step 5 — onboarding auth unification
- Replace the lone "Sign Up" link with `<EntryAuthRow />`.
- Verify: `tsc --noEmit` clean.
- Commit: `refactor(onboarding): use EntryAuthRow for auth visibility (T-018-06)`

## Step 6 — verify & design context
- `npx tsc --noEmit` → clean (hard gate).
- `npm run build` (or lint) → no new errors on touched files.
- `get_design_context` against FigJam 95:2150 / 95:2186 if the Figma MCP is reachable in this
  environment; otherwise record in review.md that it must be checked by a human against the
  Figma file (auth-gated MCP may be unavailable in an automated run).
- No commit (verification only) unless lint autofix touches files.

## Testing strategy
- **No unit/integration tests** — these are presentational screens with no business logic;
  the repo has no component test harness for them. Adding one is out of scope for this ticket.
- **Type safety:** `tsc --noEmit` is the primary automated gate (explicit AC).
- **Manual visual checklist** (run per theme — cyberpunk / kawaii / notepad):
  1. Theme arrows are large circles, cyan border, crisp chevrons; prev/next cycle themes.
  2. Disclaimer box renders empty (unticked) on a fresh load (clear `ms_disclaimer_ack`);
     tapping toggles to a filled cyan check; Learn-more still expands without toggling the box.
  3. "Enter MindShift" is fully opaque over the figure grid; cyberpunk fill is black; disabled
     state visibly muted; enables only after acknowledging.
  4. Signed out: Log in + Sign up appear with equal footprint atop theme-select and on
     onboarding. Signed in: greeting with the user's name replaces the buttons; no auth links.
  5. No hydration warning in console for `EntryAuthRow`.
- **Regression watch:** kawaii CTA must look identical to before (cream); onboarding "Try the
  mind-mapping tool" link unaffected.

## Rollback
Each step is an isolated commit; revert Step 4/5 independently of the token + component steps.
Tokens and new components are additive and safe to leave even if a screen edit is reverted.
