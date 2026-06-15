# T-018-04 — Research

Map of the codebase relevant to "lens-picker popup polish." Descriptive only.

## Ticket scope (two corrections)

From FigJam flow corrections **#6 (95:2218)** + **#7 (95:2223)**:

1. The lens-picker **arrows** should live **inside the popup** and match the
   **screen-1 circular arrow component** (a shared, reusable circular arrow).
2. The lens **card** should be **audited against `get_design_context`** to confirm
   it uses the real Figma components, not look-alike frames; fix discrepancies.

Depends on **T-018-01** (done) — the Material Symbols icon system + `<Icon>` primitive.

## The lens picker lives in `/app/lens/page.tsx`

`V200/src/app/app/lens/page.tsx` (client). This is the figure-selection screen in the
vent flow (anon-friendly). Structure:

- **Screen 1 — the figure grid** (lines 220–268): a 3-col grid of `motion.button`
  tiles, one per `FIGURES` entry. Each tile = avatar (76px circle) + name + descriptor.
  Tapping a tile sets `previewIndex` → opens the detail overlay. No arrows on this screen.
- **The popup — figure detail overlay** (lines 272–404): an `AnimatePresence` fixed
  overlay (`rgba(0,0,0,0.45)` + blur). Contains:
  - **Left arrow** (lines 285–293): `<button>` positioned `absolute left-3` on the
    **overlay** (NOT inside the card). 48px circle, `2px solid var(--cyan)`, `card-bg`,
    renders a literal `‹` glyph (font-size 30). `z-index: 51`.
  - **Detail card** (lines 296–391): `motion.div`, `maxWidth: 320`, card borders/shadow
    from `--card-*` tokens. Portrait (120px) + name + era + quote + bio + a 2-button row
    (**← Back** / **Select**). This is the "lens card" the AC refers to.
  - **Right arrow** (lines 393–401): mirror of left, `absolute right-3`, literal `›`.

`prevPreview()` / `nextPreview()` (lines 119–125) cycle `previewIndex` modulo
`FIGURES.length`. Arrow buttons `stopPropagation` so they don't close the overlay.

## The two problems, concretely

1. **Arrows are outside the popup.** They are children of the overlay `motion.div`,
   absolutely positioned against the viewport edges (`left-3` / `right-3`), so they sit
   in the dark gutter beside the card, not within it. Correction #6/#7 wants them
   **inside** the popup card.
2. **Arrows are look-alike, not the shared component.** They use literal `‹` / `›`
   typographic glyphs in inline-styled `<button>`s, duplicated almost verbatim
   (left vs right differ only by side + glyph). There is **no shared arrow component** —
   `grep CircularArrow|ArrowButton` returns nothing. T-018-01 established that ALL icons
   come from Material Symbols via `<Icon>`; these glyphs predate / bypass that rule and
   are exactly the "look-alike frames" the ticket flags.

## Related arrows elsewhere (for "the shared component")

- `V200/src/app/app/theme-select/page.tsx` (lines 394–445) — screen-1 of the entry flow
  (`/app` → `/app/theme-select` → `/app/onboarding`). Its prev/next theme arrows are
  **plain glyphs** (`‹` / `›`, no circle, `background: none`, no border). So the *code*
  has no circular arrow component yet on any screen — the "screen-1 circular arrow
  component" is a **Figma** component the implementation must converge on, shared across
  the lens popup (this ticket) and, eventually, theme-select.

## Existing primitives & conventions

- `V200/src/components/ui/Icon.tsx` — the **only** icon source. `<Icon name size fill
  weight grade />` renders a Material Symbols Sharp glyph, inherits `currentColor`,
  `opsz` tracks size. Relevant glyphs: `chevron_left`, `chevron_right`, `arrow_back_ios`,
  `arrow_forward_ios`, `arrow_circle_left/right`.
- `V200/src/lib/figures.ts` — `Figure` type (`id, name, descriptor, era, quote, bio,
  img{Kawaii,Cyberpunk,Notepad}, systemPrompt`) + `FIGURES[]` + `portraitFor(fig,theme)`
  / `getFigureImg(fig,theme)`. The detail card already reads name/era/quote/bio.
- **Token-driven, no hex.** Components read `--card-*`, `--cyan`, `--violet`, `--fig-*`,
  `--btn-*`, `--font-display` (Alumni Sans SC), `--font-body` (Courier). Per-theme
  branching via `useTheme()` → `theme ∈ {cyberpunk, kawaii, notepad}`.
- `V200/src/components/journal/LensCard.tsx` is a **different** component (the journal
  lens-response display card). Not in this ticket's path; named similarly but unrelated
  to the picker popup. Noted to avoid confusion.

## Constraints & assumptions

- **Uncommitted sibling edits** are present in the tree (`journal-v2`, `save-response`,
  `JournalPreviewCard.tsx`, `journal-types.ts`, etc., from T-018-02/03/05/07). This
  ticket touches **only** `/app/lens/page.tsx` and adds a new shared component — no
  overlap with sibling paths, satisfying the DAG (depends_on: T-018-01 only).
- The FigJam fileKey for nodes 95:2218 / 95:2223 is not pinned in the repo, and the
  design-file node for the lens screen is not given in the ticket. The `get_design_context`
  audit is therefore grounded in: (a) the established T-018 conventions (Material Symbols
  only; shared, token-driven components; ≥44px tap targets), and (b) the detail card's
  current fields. Any pixel-spec deltas that require the live Figma node are flagged in
  `design.md` / `review.md` as a verification follow-up, not silently assumed closed.
- tsc is **clean** at baseline (`npx tsc --noEmit` → 0 errors).
- Cannot run a live browser this session; "parity across 3 themes" is satisfied by
  keeping the change purely token / theme-branch driven (no hardcoded hex) + tsc clean.
- Next.js 16 conventions apply (App Router; `proxy.ts`, not middleware).
