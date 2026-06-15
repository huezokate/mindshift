# T-018-03 — Review

Handoff doc for a human reviewer. Flow correction #8 (FigJam `95:2228`):
strip the response screen's footer + brand bar and fix the lens-adjacent buttons.

## What changed

One file, one commit (`f57627b`).

`V200/src/app/app/response/page.tsx`:
- **Added** `<AppHeader />` (import + mounted at top of the page). The header
  dropdown is now the screen's navigation — the note's "we use the header
  dropdown now / instead". It also carries the MindShift wordmark + camera badge,
  absorbing the removed brand bar.
- **Removed** the central brand bar (two "Mindshift" wordmarks + `camera` Icon).
- **Removed** the entire `position: fixed` footer action bar (Try another / New /
  Converse) and the now-orphaned `handleNew()`.
- **Restyled** the Save / Decorate / Share row from `iconBtn()` 54×54 pills to a
  flat, transparent `actionBtn` matching `LensCard.tsx` `headerActions`
  (transparent bg, no border, padding 6, `var(--text-muted)`, Icons size 20;
  Save goes `var(--cyan)` when saved). Behaviour (save-pop, routing, share)
  unchanged.
- **Shrank** the scroll container's bottom padding `100px → 32px` (the reserve
  only existed to clear the fixed footer).

Net: −63 lines of footer/brand/pill code, +1 component reuse.

## Acceptance criteria

| AC | Status |
|---|---|
| No bottom footer / central camera-MindShift container | ✅ both deleted |
| Lens-adjacent buttons match Figma (lens-card button row) | ✅ flat transparent idiom from `LensCard.tsx` |
| Tokens only (no hex) | ✅ `--text-muted`, `--cyan`, existing card/input tokens |
| `tsc` clean | ✅ `npx tsc --noEmit` passes |
| QA in 3 themes | ⏳ manual — see below |

## Test coverage

- **Static:** `tsc --noEmit` green; grep confirms no dangling `handleNew` /
  `iconBtn` and no orphaned icon names (`refresh`/`note_add`/`forum`/`camera`
  all gone). Only `bookmark`/`palette`/`ios_share` remain.
- **No automated UI tests** exist for V200 page components (visual pages, no
  harness). Coverage gap is pre-existing, not introduced here.
- **Manual QA pending** (the AC's "QA in 3 themes"): verify per theme that the
  header renders + dropdown opens/routes, footer and mid-page brand bar are
  gone, the action row reads as flat icons (not pills) and is legible on each
  background, and Save still pops cyan + routes to `/app/journal-v2/{id}`.

## Open concerns / flags for human attention

1. **Scope call — AppHeader was added, not just the footer removed.** The ticket
   AC lists only "no footer / no brand container" + "fix buttons". I mounted
   `<AppHeader/>` because (a) the note explicitly says the header dropdown
   *replaces* the footer, and (b) the response screen had **no** top nav
   (`/app/layout.tsx` doesn't mount AppHeader globally), so a literal
   footer-only deletion would strand the screen. If Kate wants AppHeader scoped
   to a different ticket, drop the `<AppHeader/>` line — the rest stands alone.
   Rationale in `design.md` (Ask 1).
2. **AppHeader on an anon-friendly route.** `/app/response` is anon-friendly, but
   AppHeader's dropdown shows Profile / Log out rows (Clerk-driven). For an
   anonymous user these route to `/app/profile` / `signOut` — cosmetically odd.
   Not introduced behaviour per se (AppHeader's own concern), but now visible on
   an anon screen. Worth a follow-up: hide account rows when signed out.
3. **Action accents differ from LensCard by design.** LensCard's favorite uses
   `var(--amber)` + filled star; here Save uses `var(--cyan)` because "favorite"
   is meaningless pre-save and `--cyan` is this screen's existing active accent
   (typewriter cursor). Intentional, documented in `design.md` (Ask 3).
4. **Lost nav affordances.** "Try another" (→ lens) and "Converse" (→ journal)
   no longer have dedicated buttons. Journal/New are reachable via the dropdown;
   "try another lens for this vent" is not directly surfaced anymore. If that
   flow matters, it likely belongs to the lens-picker / detail "+Lens" work
   (T-018-02), not here.

## Risk

Low. One file, reversible via `git revert f57627b`. No token, route, API, or
schema changes.
