# T-018-06 — Review

Handoff for the entry-screen flow corrections #1 (theme-select) + #4 (auth visibility).
Committed as `00a3e61`.

## What changed

### New files
- **`V200/src/components/ui/CircleArrow.tsx`** — presentational circular nav button
  (44px, 2px cyan ring on `--card-bg`, Material `chevron_left`/`chevron_right`). Requires
  `aria-label`. Mirrors the lens-picker overlay arrow; adoptable by lens later.
- **`V200/src/components/nav/EntryAuthRow.tsx`** — client component (`useUser`). Signed-out:
  equal-footprint "Log in" (secondary tokens) + "Sign up" (primary tokens). Signed-in:
  `person` icon + "Hi, {firstName ?? username ?? email}". Loading state renders the
  signed-out row as a stable placeholder.

### Modified
- **`V200/src/styles/tokens.css` / `tokens-kawaii.css` / `tokens-notepad.css`** — added
  `--cta-solid-bg` + `--cta-solid-bg-disabled` per theme (cyberpunk `#080810`/`#14141f`,
  kawaii `#ffe2ac`/`#e8e4dc`, notepad `#ffffff`/`#ece8e0`).
- **`V200/src/app/app/theme-select/page.tsx`** — `EntryAuthRow` atop the column; native
  checkbox → `div role="checkbox"` + Material glyph (unticked by default, keyboard-accessible);
  `‹`/`›` text buttons → `CircleArrow`; CTA hardcoded hex → `--cta-solid-bg` tokens.
- **`V200/src/app/app/onboarding/page.tsx`** — lone "Sign Up" link → `<EntryAuthRow />`.

## Acceptance criteria

| Criterion | Status |
|---|---|
| Theme-select arrows match the shared circular component | ✅ `CircleArrow`, 44px cyan ring |
| Checkmark unticked by default | ✅ `check_box_outline_blank` until tapped, `--text-sub` |
| Solid button fill (cyberpunk black) | ✅ `--cta-solid-bg` = `#080810` cyberpunk; opaque all themes |
| Log-in prominent / equal focus | ✅ equal-footprint Log in + Sign up pills |
| Sign-up prominent for anon | ✅ primary-token Sign up pill, on entry screens |
| Name shown when authed | ✅ "Hi, {name}" via `useUser()` |
| `tsc` clean | ✅ `npx tsc --noEmit` exit 0 |
| `get_design_context` | ⚠️ see Open concerns |

## Test coverage

- **Automated:** `npx tsc --noEmit` → clean. `eslint` on the four touched files → no new
  findings. (Two pre-existing reports remain in unmodified theme-select code: `setState` in the
  localStorage-hydration `useEffect` (line 61) and an `<img>` in the figure grid (line 133) —
  both predate this ticket.)
- **No unit/integration tests** added: these are presentational screens with no business logic
  and the repo has no component test harness for them. Gap is intentional and consistent with
  the rest of the entry flow.
- **Manual checklist** (in `plan.md`) — recommended before merge, per theme: arrow cycling,
  fresh-load empty checkbox + toggle, Learn-more not toggling the box, opaque CTA over the figure
  grid (black in cyberpunk), and the signed-out/signed-in auth states.

## Open concerns / follow-ups

1. **`get_design_context` not run against the FigJam correction nodes (95:2150 / 95:2186).**
   The Figma MCP is interactively auth-gated and the FigJam board's file key isn't in the repo,
   so it couldn't be fetched in this automated run. Implementation was driven instead by the
   in-code reference the ticket names — the lens-picker overlay arrow — plus the explicit ticket
   copy. **A human should eyeball the result against the two FigJam frames before merge.**
2. **Pre-existing theme-select lint** (`setState`-in-effect, `<img>`) left as-is — out of scope,
   but worth a separate cleanup ticket.
3. **Lens overlay arrows not yet using `CircleArrow`.** Deliberately deferred to keep this diff
   focused; a trivial future follow-up can DRY the two inlined copies in `lens/page.tsx` (note:
   those are 48px / glyph 30 over a scrim, vs. 44px inline here — adjust `size` on adoption).
4. **`EntryAuthRow` width** is caller-controlled (`maxWidth` prop): 376 on theme-select to match
   the cards, 280 on onboarding to match the CTA stack. Verify both read well on small viewports.

## Risk assessment
Low. No DB/API/route/middleware changes, no new dependencies. Token additions are additive;
kawaii CTA preserves its prior cream so there's no visual regression. The only structural change
is the checkbox element swap, covered by `role`/`aria-checked`/keyboard handling and the
preserved nested Learn-more `stopPropagation`.
