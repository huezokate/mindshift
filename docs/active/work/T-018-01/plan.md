# T-018-01 — Plan

Ordered, independently-verifiable steps. No test runner exists; verification is
tsc + eslint + grep proof + reasoned visual parity.

## Step 1 — Migrate `response/page.tsx` (primary scope)

- Add `import Icon from '@/components/ui/Icon'`.
- Replace the 7 call sites with `<Icon name … size … />` per structure.md.
- Delete the 7 local `IconX` functions.
- **Verify:** `rg '<svg' src/app/app/response/page.tsx` → no matches;
  `rg 'function Icon' src/app/app/response/page.tsx` → no matches.
- Commit: `refactor(response): hand-rolled icons → Material Symbols (T-018-01)`.

## Step 2 — Migrate `journal/page.tsx` (legacy footer nav)

- Add `import Icon from '@/components/ui/Icon'`.
- Replace `CameraIcon`/`BookIcon`/`PersonIcon` call sites; delete the functions.
- **Verify:** `rg '<svg' src/app/app/journal/page.tsx` → no matches.
- Commit: `refactor(journal): footer nav icons → Material Symbols (T-018-01)`.

## Step 3 — Migrate `SessionCard.tsx`

- Add `import Icon from '@/components/ui/Icon'`.
- Replace every `<ShareIcon />` and `<MindIcon />` (each appears in all 3 theme
  branches); delete the two functions.
- **Verify:** `rg '<svg' src/components/SessionCard.tsx` → no matches.
- Commit: `refactor(journal): SessionCard icons → Material Symbols (T-018-01)`.

## Step 4 — Whole-ticket verification

1. **Type check:** `npx tsc --noEmit` from `V200/` → clean. (AC: tsc clean.)
2. **Lint:** `npx eslint src/app/app/response/page.tsx
   src/app/app/journal/page.tsx src/components/SessionCard.tsx` → no new errors
   (confirms no unused imports / leftover dead functions).
3. **Scope proof:** `rg '<svg' src/app/app/response src/app/app/journal
   src/app/app/lens src/app/app/onboarding src/components/SessionCard.tsx
   src/components/journal` → no matches (excludes out-of-scope library/mindmap).
4. **Sanity:** `rg '<Icon' across the three files lists the expected names.

## Step 5 — Review artifact

- Write `review.md`: files changed, name-mapping table, the one open taste call
  (`forum` vs `comic_bubble` for "Converse"), test-coverage gap (no runner →
  manual 3-theme visual check needed), and the legacy-journal lifespan caveat.

## Testing strategy

| Concern | Method | Why |
|---|---|---|
| Type safety | `tsc --noEmit` | AC requires tsc clean. |
| Dead code / unused imports | `eslint` | Catches leftover wrappers/imports. |
| Scope completeness | `rg '<svg'` over scope dirs | Proves AC "no remaining custom svg". |
| Glyph correctness | reasoned mapping (design.md) | No automated way to assert glyph identity. |
| Visual parity ×3 themes | manual (flagged) | No browser in headless pass; currentColor + preserved wrappers make regressions unlikely but not zero. |

## Rollback

Each step is one file, one commit. Any step reverts independently with
`git revert` of its commit. No schema, no shared module, no infra touched, so
blast radius is per-file.

## Risk register

- **Low:** `forum`/`note_add` are valid Material Symbols Sharp glyph names; if a
  name were wrong the glyph renders as literal text (ligature miss) — caught in
  the manual visual check. Names chosen are all standard Material Symbols.
- **Low:** server-component render of `<Icon>` in `journal/page.tsx` — `<Icon>`
  is a pure span, no `'use client'` directive, no hooks; renders server-side
  fine (already imported by client files, but nothing client-only inside).
- **None:** no runtime/data/auth paths touched.
