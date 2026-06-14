# T-018-06 — Design

Decisions for the four sub-fixes, grounded in the research. Each lists options
considered and the rationale for the choice.

## 1. Circular theme-picker arrows

**Target:** lens overlay arrows — 48px circle, 2px cyan border, `--card-bg` fill, cyan glyph.

Options:
- **A. Extract a shared `CircleArrow` component** and use it in theme-select (and refactor
  the two inlined lens copies to use it).
- B. Inline-match the lens style directly in theme-select (copy/paste).
- C. Restyle the existing tiny text buttons (just bump size + add a border).

**Chosen: A (partial).** Create `src/components/ui/CircleArrow.tsx` and use it in theme-select.
Refactoring the lens overlay is desirable (DRY) but expands blast radius into an unrelated
screen; **defer the lens refactor** and only adopt the shared component in theme-select to
keep the diff focused — the component is written so lens can adopt it later for free.
Rationale: a named component is the literal ask ("same component as the lens picker") and
avoids a third inlined copy of the circle style. Glyphs switch from literal `‹`/`›` to
Material Symbols `chevron_left`/`chevron_right` via `Icon`, matching the app-wide icon system
(T-018-01) and rendering crisper than the typographic guillemets.

Size: **44px** circle, **28px** glyph — "massive (~40px)" per ticket, a touch larger than the
40 floor for a confident tap target, smaller than the 48px overlay arrows (those float over a
scrim; these sit inline in a card).

## 2. Disclaimer checkbox — kill the "auto-tapped" look

The native `<input>` with a cyan `accentColor` on the near-black cyberpunk bg reads as
pre-filled. Options:
- A. Keep native input, restyle (border, larger, theme-aware) — still browser-dependent.
- **B. Custom checkbox: a `<button role="checkbox">` rendering `Icon` `check_box_outline_blank`
  (unticked) / `check_box` (ticked).**

**Chosen: B.** A token-driven Material Symbol gives an unambiguous empty box by default across
all three themes — no native rendering surprises, fully on-theme, and visibly "unticked by
default" (the AC). The real `<input>` is removed; the `<label>` becomes a `<button>` with
`role="checkbox"` + `aria-checked` for accessibility, wired to the existing `toggleAck()`.
The empty-box glyph uses `--text-sub`; the checked glyph uses `--cyan` (fill=1) so the tick is
clearly a deliberate user action, not a default state. `acknowledged` still hydrates from
`localStorage` in the existing `useEffect`, so a returning user who already acknowledged stays
acknowledged — but on a fresh visit it is unmistakably empty.

## 3. Solid CTA fill → cyberpunk black

The CTA must stay **opaque** over the figure grid in every theme; cyberpunk specifically wants
black. Options:
- A. Theme-conditional inline values keyed off `theme` (more hardcoded hex).
- **B. New per-theme tokens `--cta-solid-bg` / `--cta-solid-bg-disabled`** in all three
  `tokens*.css`, replacing the hardcoded `#ffe2ac` / `#e8e4dc`.

**Chosen: B.** Aligns with the V200 rule "never hardcode hex; use tokens" — the current hack
explicitly violates it. Values:

| token | cyberpunk | kawaii | notepad |
|---|---|---|---|
| `--cta-solid-bg` | `#080810` (black) | `#ffe2ac` | `#ffffff` |
| `--cta-solid-bg-disabled` | `#14141f` | `#e8e4dc` | `#ece8e0` |

Cyberpunk gets the requested black; kawaii preserves today's cream (no visual regression);
notepad gets paper-white. Active text stays `--violet`, disabled `--text-sub`, borders from
`--card-b*`, radius `--btn-radius` — all already token-driven. The CTA now re-themes correctly
instead of being cream in all three skins.

## 4. Auth visibility — log-in equal focus, sign-up prominent, name when signed in

Where: theme-select is the **first** entry screen, so auth belongs here. Options for placement:
- A. Reuse `AppHeader` on theme-select — too heavy (full dropdown nav, journal/mindmap rows)
  for an entry screen, and pulls in unrelated counts.
- **B. A small dedicated inline auth row** at the top of the foreground column.

**Chosen: B — new `src/components/nav/EntryAuthRow.tsx`** (client, `useUser()`):
- **Signed out:** two **equal-weight** pill links — **"Log in"** (`/sign-in`) and **"Sign up"**
  (`/sign-up`) — side by side, same size/treatment, satisfying "log-in equal focus" *and*
  "sign-up more visible". Sign-up uses the primary button tokens (`--btn-*`), log-in the
  secondary tokens (`--btn-secondary-*`) so both are visible but sign-up reads as the nudge.
  Equal focus = equal footprint and adjacency, not identical styling.
- **Signed in:** a compact greeting — `Icon person` + **"Hi, {firstName ?? username ?? email}"** —
  reusing AppHeader's name-resolution logic. No auth buttons.

`EntryAuthRow` renders at the top of the theme-select foreground column (above the hero card).
It is self-contained and token-driven so any entry screen can adopt it.

**Onboarding:** swap its lone always-on "Sign Up" link to the same name-aware pattern (show the
greeting when signed in, the sign-up link when not) for consistency — minimal change, reuses
`EntryAuthRow`'s logic. To keep the diff tight, onboarding will render `EntryAuthRow` in place
of the bare Sign Up link.

## Rejected globally
- Adding `AppHeader` to entry screens (scope creep, wrong altitude).
- Refactoring lens overlay arrows now (out of scope; component left adoptable).
- Restyling the native checkbox (browser-dependent; doesn't reliably fix the look).

## Acceptance mapping
- Arrows → shared circular `CircleArrow` (#1). Checkbox unticked by default → custom Icon box (#2).
- Solid fill cyberpunk black → `--cta-solid-bg` token (#3). Log-in equal + sign-up prominent +
  name when authed → `EntryAuthRow` (#4). `get_design_context` + `tsc` clean → verified in Review.
