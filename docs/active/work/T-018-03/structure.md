# T-018-03 — Structure

The blueprint. One file changes; no files created or deleted; no new modules.

## Files

| File | Change |
|---|---|
| `V200/src/app/app/response/page.tsx` | **Modified** — add AppHeader import + mount; delete brand bar; delete footer; delete `handleNew`; replace `iconBtn()` with `actionBtn`; restyle action row; shrink scroll padding |

No new components, hooks, tokens, routes, or APIs. `AppHeader`, `Icon`, the
motion/Clerk imports already present are reused as-is.

## `page.tsx` shape after the edit

Imports (top): add `import AppHeader from '@/components/nav/AppHeader'`.
Everything else unchanged (`Icon` stays — used by the action row).

Component body — removals/changes by region:

1. **`iconBtn()` helper (103–116)** → delete. Replace with a const
   `actionBtn: React.CSSProperties` (transparent / border-none / padding 6 /
   `color: var(--text-muted)`) per design.md. Save's active accent is applied
   inline at the call site (`color: saveState === 'saved' ? 'var(--cyan)' :
   'var(--text-muted)'`), so `actionBtn` itself takes no argument.

2. **`handleNew` (98–101)** → delete (only the footer called it).

3. **Render tree:**
   - Root `<div className="min-h-dvh flex flex-col">` unchanged.
   - **Insert `<AppHeader />`** as the first child of the root, *before* the
     scroll container — matching EntryDetail (`<AppHeader/>` full-width, padded
     content below).
   - Scroll container: `padding: '24px 24px 100px'` → `'24px 24px 32px'`.
   - **Delete section 2** (brand bar, the `<motion.div>` with two "Mindshift"
     wordmarks + centered camera Icon, 162–178).
   - Sections 1 (user quote) and 3 (lens card) unchanged.
   - **Section 4 (action row)** — keep the `done` gate, the `<motion.div
     className="flex gap-1 justify-end">` wrapper, and the three buttons, but:
     - Save `<motion.button>`: `style={{ ...actionBtn, color: saveState ===
       'saved' ? 'var(--cyan)' : 'var(--text-muted)' }}`, keep `animate=
       {saveControls}`, `whileTap`, `onClick={handleSave}`, title, `Icon
       name="bookmark" size={20}`.
     - Decorate `<button disabled>`: `style={{ ...actionBtn, opacity: 0.3,
       cursor: 'not-allowed' }}`, `Icon name="palette" size={20}`.
     - Share `<button>`: `style={actionBtn}`, `onClick={handleShare}`, `Icon
       name="ios_share" size={20}`.
   - Error row (`saveState === 'error'`) unchanged.
   - **Delete section 5** (the entire `position: fixed` footer `<div>` and its
     three buttons, 274–333).

## Public interface / behaviour contract (unchanged)

- Route `/app/response` and its sessionStorage contract (`ms_figure_id`,
  `ms_response`, `ms_vent`, `ms_session_id`) untouched.
- `handleSave` (POST `/api/save-response` → save-pop → push
  `/app/journal-v2/{id}`) untouched.
- `handleShare` untouched.
- Typewriter effect + `done` gate untouched.

## Ordering of changes

Single atomic edit to one file (small enough to commit as one). Internal order
within the edit is irrelevant since it's one file; logical grouping:
(a) add import, (b) delete `iconBtn`/`handleNew`, add `actionBtn`,
(c) mount AppHeader + padding, (d) delete brand bar, (e) restyle action row,
(f) delete footer.

## Risk surface

- **Token availability:** `--text-muted` and `--cyan` must exist in all three
  token sets. Confirmed in use by `LensCard.tsx` across themes → safe.
- **AppHeader on an anon-friendly route:** the dropdown shows Profile / Log out
  to anonymous users (response screen is anon-friendly). Cosmetic only; noted as
  an open concern in review, not a blocker for this ticket.
- **`tsc`:** removing `handleNew` and `iconBtn` must not leave dangling refs —
  grep after edit to confirm no other caller.
