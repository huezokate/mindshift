# T-018-01 — Design

Decisions and rationale, grounded in research.md. The infrastructure (`<Icon>`,
base CSS, stylesheet link) already exists and is correct, so this phase decides
**how to migrate the remaining hand-rolled SVGs** and **which Material name maps
to each glyph**.

## Decision 1 — Reuse the existing `<Icon>` primitive as-is

The `<Icon>` component already satisfies every component-level AC: renders
Material Symbols Sharp, `size`/`fill`/`weight`/`grade` props work, inherits
`currentColor`, optional `title` for a11y. No changes needed.

**Rejected:** extending `<Icon>` with an `as`/`button` variant or a preset-size
map. Unnecessary — call sites already own their wrapper buttons/spans and just
need the glyph swapped. Keep the primitive minimal.

## Decision 2 — Swap glyphs in place; delete the local SVG wrappers

For each in-scope file, replace the local `function IconX()` SVG component with a
direct `<Icon name="…" size={…} />` at the call site, then delete the now-unused
local function. This keeps the surrounding styled wrapper (button / span / link)
untouched, so color tokens, sizing, and layout are preserved.

**Rejected:** keeping the wrapper functions as thin shims around `<Icon>`
(e.g. `function IconShare(){ return <Icon name="ios_share" size={20}/> }`). It
leaves dead indirection and an inconsistent pattern vs. the already-migrated
journal-v2 files, which call `<Icon>` directly. Delete them.

## Decision 3 — Material name mapping

Chosen to (a) match the established AppHeader convention, (b) honor the ticket's
explicit candidate list, (c) preserve the semantic meaning of each glyph.

### `response/page.tsx`

| Local icon | Context | Material name | Rationale |
|---|---|---|---|
| `IconBookmark` | Save to journal | `bookmark` | Direct semantic match; standard save glyph. |
| `IconShare` | Share button | `ios_share` | Ticket explicitly lists `ios_share`; it's the share-sheet glyph and `handleShare()` invokes `navigator.share`. |
| `IconPalette` | Decorate (theme/stickers) | `palette` | Ticket lists `palette`; exact match. |
| `IconRefresh` | "Try another" | `refresh` | Standard reload glyph; routes back to `/app/lens`. |
| `IconNote` | "New" | `note_add` | Creates a new vent entry — `note_add` reads "new note" better than bare `add`. (AppHeader uses `add` for menu rows; here the glyph is a document, so `note_add` keeps the document semantic while signalling "new".) |
| `IconChat` | "Converse" | `forum` | Conversation glyph. Ticket lists `comic_bubble`, but that's a single speech bubble; "Converse" → ongoing dialog, for which `forum` (stacked bubbles) is the truer Material symbol. See alt below. |
| `IconCamera` | Brand bar screenshot mark | `camera` | Matches AppHeader's brand `camera`; consistent brand mark. |

**Chat glyph — `forum` vs `comic_bubble`:** the ticket's candidate list names
`comic_bubble`. `forum` is chosen because the button label is "Converse"
(two-way dialog) and AppHeader already owns the playful brand glyphs; a plain
conversation affordance reads clearer as `forum`. This is a low-stakes taste
call — `comic_bubble` is a one-line swap if Kate prefers the candidate. Flagged
in review.md as the single open taste item.

### `journal/page.tsx` (legacy footer nav)

| Local icon | Label | Material name | Rationale |
|---|---|---|---|
| `CameraIcon` | "Try another Lens" | `camera` | Matches AppHeader brand `camera`; the lens metaphor. |
| `BookIcon` | "Journal" | `auto_stories` | Ticket lists `auto_stories` (open book) — exact match for a journal. |
| `PersonIcon` | "Continue" | `person` | Direct match. |

### `SessionCard.tsx` (legacy session card)

| Local icon | Context | Material name | Rationale |
|---|---|---|---|
| `ShareIcon` | collapsed-card footer | `ios_share` | Consistent with response share glyph. |
| `MindIcon` | expanded lens-nav row | `psychology` | Ticket lists `psychology`; matches AppHeader's account/mind glyph. The MindShift brain mark. |

## Decision 4 — Size & fill preservation

Pass the exact pixel sizes the SVGs declared, so optical sizing (`opsz` tracks
`size` in `<Icon>`) and layout are unchanged:

- response: bookmark/share/palette `size={20}`, refresh/note/chat `size={18}`,
  camera `size={22}`.
- journal footer: all `size={24}`.
- SessionCard: ShareIcon `size={24}`, MindIcon `size={24}`.

Default `fill={0}` (outlined) is kept everywhere — the originals were stroked
outlines, not filled, so outlined Material glyphs preserve the look. No `weight`
override (default 400 matches the ~2px strokes).

## Decision 5 — Accessibility

The originals were decorative (label text sits beside them in every case), so
icons stay `aria-hidden` (the `<Icon>` default — no `title` passed). Labels
already provide the accessible name. Exception: none needed; no icon-only control
lacks an adjacent text label except the response action buttons, which already
carry `title=` on the button element itself (e.g. "Save to journal", "Share").

## Verification strategy (decided)

No unit-test runner exists. Verification is:
1. `npx tsc --noEmit` — clean (AC: "tsc clean").
2. `eslint` on changed files — no new errors (catches unused imports / dead
   wrapper functions left behind).
3. Grep proof: zero `<svg` remaining in the three in-scope files.
4. Visual parity is asserted by reasoning (currentColor + preserved wrappers +
   matching sizes) rather than a running browser, since this is a headless RDSPI
   pass; flagged for human visual check across the 3 themes in review.md.

## Summary of what changes

Three files edited: `response/page.tsx`, `journal/page.tsx`, `SessionCard.tsx`.
Each: add `import Icon from '@/components/ui/Icon'`, swap glyphs at call sites,
delete local SVG wrapper functions. No new files, no infra changes, no token
changes.
