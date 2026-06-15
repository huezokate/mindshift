# T-018-01 — Structure

File-level blueprint. No new files; three existing files modified; zero deleted.
The `<Icon>` primitive, base CSS, and stylesheet link are pre-existing and
untouched.

## Files modified

### 1. `V200/src/app/app/response/page.tsx` (client component)

- **Add import** (top, with the other `@/lib` / `@/components` imports):
  `import Icon from '@/components/ui/Icon'`
- **Delete** local functions: `IconBookmark`, `IconShare`, `IconPalette`,
  `IconRefresh`, `IconNote`, `IconChat`, `IconCamera` (lines ~16-70).
- **Swap call sites** (wrappers preserved, only the glyph element changes):
  - brand bar `<IconCamera />` → `<Icon name="camera" size={22} />`
  - Save button `<IconBookmark />` → `<Icon name="bookmark" size={20} />`
  - Decorate button `<IconPalette />` → `<Icon name="palette" size={20} />`
  - Share button `<IconShare />` → `<Icon name="ios_share" size={20} />`
  - footer `<IconRefresh />` → `<Icon name="refresh" size={18} />`
  - footer `<IconNote />` → `<Icon name="note_add" size={18} />`
  - footer `<IconChat />` → `<Icon name="forum" size={18} />`
- **Interfaces:** none change. Component is the default export `ResponsePage`;
  signature unchanged.

### 2. `V200/src/app/app/journal/page.tsx` (server component)

- **Add import:** `import Icon from '@/components/ui/Icon'` (beside the existing
  `import Link from 'next/link'`).
- **Delete** local functions: `CameraIcon`, `BookIcon`, `PersonIcon`
  (lines ~11-33).
- **Swap call sites** inside `FooterNav`:
  - `<CameraIcon />` → `<Icon name="camera" size={24} />`
  - `<BookIcon />` → `<Icon name="auto_stories" size={24} />`
  - `<PersonIcon />` → `<Icon name="person" size={24} />`
- **Boundary note:** `<Icon>` is a pure presentational span (no hooks, no
  client-only APIs), so it is safe to render from this server component. No
  `'use client'` needed here.

### 3. `V200/src/components/SessionCard.tsx` (client component)

- **Add import:** `import Icon from '@/components/ui/Icon'` (beside existing
  imports).
- **Delete** local functions: `ShareIcon`, `MindIcon` (lines ~20-35).
- **Swap call sites** (each appears once per theme branch — collapsed cyberpunk/
  kawaii/notepad reuse `<ShareIcon />`; expanded branches reuse `<MindIcon />`):
  - every `<ShareIcon />` → `<Icon name="ios_share" size={24} />`
  - every `<MindIcon />` → `<Icon name="psychology" size={24} />`

## Files NOT touched (and why)

- `src/components/ui/Icon.tsx` — already satisfies all component AC.
- `src/app/globals.css`, `src/app/layout.tsx` — base CSS + stylesheet present.
- `src/components/journal/*` (LensCard, JournalPreviewCard, EntryDetail,
  UpcomingChip, JournalV2Client) — already migrated.
- `src/components/nav/AppHeader.tsx` — already migrated; source of naming
  convention.
- `src/components/journal/SocialIcon.tsx` — intentional brand glyphs, not in
  scope.
- `src/app/library/page.tsx`, `src/app/app/mindmap/reflect/page.tsx`,
  `src/components/mindmap/AreaIcon.tsx` — out of scope (library/mindmap domains;
  reflect ring is decorative).

## Ordering of changes

Order is independent (three separate files, no shared symbols), but execute in
this sequence for clean incremental commits:

1. `response/page.tsx` (primary scope — 7 icons).
2. `journal/page.tsx` (3 icons).
3. `SessionCard.tsx` (2 icons).

Each file is internally atomic: add import + swap all call sites + delete
wrappers in one edit pass, so the file never has a dangling reference to a
deleted function or an unused import (eslint-clean at every step).

## Invariants to preserve

- All styled wrappers (`iconBtn()`, footer `<button>`/`<Link>` styles, badge
  divs) stay exactly as-is — they own color tokens via `currentColor`.
- Pixel sizes carried over verbatim (see design.md Decision 4).
- No `fill`/`weight` overrides (defaults match the outlined originals).
- No token/hex introduced; color continues to flow from `var(--…)` on wrappers.

## Post-change shape

After the migration, a repo-wide `rg '<svg'` over `src/` returns only:
`library/page.tsx`, `mindmap/reflect/page.tsx`, `mindmap/AreaIcon.tsx`,
`SocialIcon` (img-based, no inline svg actually — served files) — i.e. nothing
in journal / nav / onboarding / lens / response. That is the structural
acceptance proof.
