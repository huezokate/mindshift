# T-018-03 — Plan

Ordered, verifiable steps. The whole change is one file → one commit, but the
steps below are the execution checklist.

## Step 1 — Add AppHeader import + mount

- Add `import AppHeader from '@/components/nav/AppHeader'` to the import block.
- Render `<AppHeader />` as the first child inside the root
  `<div className="min-h-dvh flex flex-col">`, before the scroll container.
- Verify: `<AppHeader/>` is full-width (it manages its own padding) and sits
  above the padded content, matching EntryDetail.

## Step 2 — Remove the brand bar (Ask 2)

- Delete section 2: the `<motion.div … className="flex items-center
  justify-between w-full px-1">` block containing the two "Mindshift" wordmarks
  and the centered `<Icon name="camera" />`.

## Step 3 — Replace `iconBtn()` with `actionBtn` + restyle the action row (Ask 3)

- Delete the `iconBtn` helper.
- Add `const actionBtn: React.CSSProperties = { display:'flex',
  alignItems:'center', justifyContent:'center', background:'transparent',
  border:'none', padding:6, cursor:'pointer', color:'var(--text-muted)',
  transition:'color 0.15s' }`.
- Save button → `style={{ ...actionBtn, color: saveState === 'saved'
  ? 'var(--cyan)' : 'var(--text-muted)' }}`; keep `animate={saveControls}`,
  `whileTap`, `onClick`, `title`; `<Icon name="bookmark" size={20} />`.
- Decorate button → `style={{ ...actionBtn, opacity:0.3,
  cursor:'not-allowed' }}`; `<Icon name="palette" size={20} />`.
- Share button → `style={actionBtn}`; `<Icon name="ios_share" size={20} />`.
- Keep the `done` gate and the `flex gap-1 justify-end` wrapper.

## Step 4 — Remove the footer + dead code (Ask 1)

- Delete section 5: the entire `position: fixed` footer `<div>` and its three
  buttons (Try another / New / Converse).
- Delete the now-unused `handleNew` function.

## Step 5 — Shrink scroll padding

- Scroll container: `padding: '24px 24px 100px'` → `'24px 24px 32px'`.

## Step 6 — Static verification

- `cd V200 && npx tsc --noEmit` → must be clean.
- `grep -n 'handleNew\|iconBtn\|refresh\|note_add\|forum' src/app/app/response/page.tsx`
  → no matches (all removed references gone).
- Confirm remaining `<Icon>` names are only `bookmark`, `palette`, `ios_share`.

## Step 7 — Commit

One atomic commit:
`refactor(response): drop footer + brand bar, lens-card-style action row (T-018-03)`

## Testing strategy

- **Type safety:** `tsc --noEmit` is the gate (no unit-test harness in V200 for
  page components; pages are visual).
- **Manual QA** (the AC's "QA in 3 themes"), per theme cyberpunk/kawaii/notepad:
  1. AppHeader renders; tap account badge → dropdown opens; Journal/New/Mind Map
     rows route.
  2. No fixed footer; no mid-page camera+MindShift bar.
  3. Action row is flat/transparent (no pills), right-aligned under the lens
     card; icons legible on each theme background.
  4. Save → bookmark pops, turns cyan, routes to `/app/journal-v2/{id}` (signed
     in) or `/sign-in` (anon).
  5. Share → native share / clipboard.
- **Verification criteria:** AC met — no footer, no brand container, buttons
  match the lens-card idiom, tokens only, `tsc` clean.

## Rollback

Single-file, single-commit → `git revert` restores prior behaviour cleanly.
