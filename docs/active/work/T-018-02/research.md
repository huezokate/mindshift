# T-018-02 — Research

Map of the codebase relevant to "detail header & vent CTAs." Descriptive only.

## Ticket scope (three affordances)

1. Shared `<AppHeader/>` bar on the entry **detail** page (replacing its placeholder
   medallion header). — Figma `602:6952` / detail screen `469:4431`.
2. **"+ Lens"** button on the detail vent card. — Figma `602:6511`.
3. **"Vent it out"** CTA at the bottom of the feed → routes to `/app/onboarding`. — Figma `606:7872`.

## Current state — already substantially built

Commit `857a756` ("feat(journal): detail AppHeader + Material icons + '+Lens'; feed
'Vent it out' CTA") landed alongside T-018-01 work, and `5019a31` tuned the -4px
overlap spacing. So the affordances exist; this ticket's job is to verify fidelity
against `get_design_context` for each node and close any gaps. tsc is currently clean.

## Relevant files

- `V200/src/app/app/journal-v2/[id]/page.tsx` — detail route (server component).
  Fetches `vent_sessions` + nested `lens_responses` + `lens_shares` for the owning
  user, normalizes to `JournalEntry`, renders `<EntryDetail entry={...}/>` inside a
  `maxWidth: 440` column. (Has uncommitted edits from sibling tickets T-018-05/07 —
  do not disturb.)
- `V200/src/components/journal/EntryDetail.tsx` — **detail client component**. Already:
  - `header = <AppHeader />` (line 41) — shared nav bar, replaces the old medallion.
  - `ventCardWrapped` (lines 91–125) — full vent card + right-aligned **"+ Lens"**
    button, green Button-Primary treatment, `-4px` overlap, click handler currently a
    `console.log` stub (lens picker is T-018-04).
  - billboard divider, lens carousel, per-lens button row, ShareSheet.
- `V200/src/app/app/journal-v2/page.tsx` — feed route (server component). Fetches the
  user's sessions, paginates (PAGE_SIZE 10), renders `<JournalV2Client/>`.
- `V200/src/components/journal/JournalV2Client.tsx` — **feed client component**. Already:
  - `<AppHeader entryCount lensCount/>` + `<JournalHeader/>` + filter tabs.
  - maps entries → `<JournalPreviewCard/>`.
  - **"Vent it out"** CTA (lines 170–188): a `<Link href="/app/onboarding">` styled as
    a **generic filled `--btn-*` primary** with an inline `add` icon + text. Wired
    correctly, but the visual diverges from Figma 606:7872 (see Design).
- `V200/src/components/nav/AppHeader.tsx` — shared top nav (committed `e66d2b4`).
  Bar = brand badge · "MINDSHIFT" wordmark · account badge → dropdown. Token-driven,
  Material Symbols via `Icon`. Accepts `entryCount`/`lensCount`/mindmap props.
- `V200/src/components/ui/Icon.tsx` — the **only** icon primitive. Renders a Google
  Material Symbols (Sharp) glyph by name; inherits `currentColor`; `opsz` tracks size.
- `V200/src/components/journal/JournalPreviewCard.tsx` — feed card (date label + vent
  body + lens footer). Uncommitted sibling edits present; not in this ticket's path.

## Patterns & conventions observed

- **Token-driven styling, no hex.** Components read CSS custom props: `--bg`, `--green`,
  `--cyan`, `--pink`, `--violet`, `--font-btn` (Alumni Sans SC), `--font-body`,
  `--card-filter` (notepad drop-shadow), `--btn-*` (filled primary), `--input-*`.
- **Three themes** via `useTheme()` → `theme` ∈ {cyberpunk, kawaii, notepad}. Per-theme
  branches are common (e.g. notepad applies `var(--card-filter)`; cyberpunk/kawaii set
  `filter: none`). The "+ Lens" button already encodes this branch.
- **"Button Primary" treatment** (recurring): `background: var(--bg)`, borders
  `t-4 l-4` + `r-1 b-1` solid `var(--green)`, `border-radius: 2px`. Used by the detail
  "+ Lens" button and the per-lens button row. Figma names it "Button Primary".
- **-4px overlap idiom**: a card carries `marginBottom: -4` + `zIndex: 1`; the button
  beneath sits `zIndex: 2` so it overlaps the card edge by 4px (Figma 602:6446/6682).
- **Tap targets ≥ 44px** enforced (`minHeight: 44`/`56`).
- Material Symbols only — no hand-rolled SVG (T-018-01 migrated the rest).

## Figma findings (get_design_context)

- **602:6511 "+ Lens" (Button Primary):** bg `#080810` (=`--bg`), border `t-4 l-4 r b`
  `#39ff14` (=`--green`), radius 2px, column / items-center / justify-center, pad
  `8/9/5/12`, `add` icon 24px + "Lens" label (Alumni Sans SC SemiBold 14, tracking 3px,
  uppercase, green). **→ matches EntryDetail's current implementation.**
- **606:7872 "Vent it out" (Frame152):** a **composite**, not a single button:
  - Row `606:7864` (`items-end`, `isolate`): green rule `flex-1 h-4px` (z-3, `mr-[-4px]`)
    · icon Button-Primary `606:7791` `w-120px` with **t-4 l-4 r borders, NO bottom**
    (open-bottom), `add` icon 24px green (z-2, `mr-[-4px]`) · green rule `flex-1 h-1px`
    (z-1). The button "breaks through" the rule line.
  - Bar `606:7869`: bg `--bg`, full width, `pb-8 px-8`, "Vent it out" label (same green
    Alumni Sans SC SemiBold 14/3px/uppercase).
  - **→ the current generic filled `--btn-*` button does NOT match this.** Fidelity gap.
- **469:4431 (detail screen):** confirms MINDS SHIFT AppHeader at top, vent card with
  "+ Lens" bottom-right, billboard divider, violet lens card + Chat/Decorate/Socials
  row. AppHeader placement matches current EntryDetail.

## Assumptions & constraints

- The lens-picker popup is **out of scope** (owned by T-018-04). "+ Lens" stays wired to
  a stub handler; "wired" here = affordance + click hook present.
- `[id]/page.tsx`, `JournalPreviewCard.tsx`, `QuoteCardCanvas.ts` carry **uncommitted
  edits from sibling tickets** — must not be modified by this ticket.
- Cannot run a live browser in this session; "QA in 3 themes" is satisfied by verifying
  the change is purely token/theme-branch driven (no hardcoded hex) + tsc clean.
- Next.js 16 conventions apply (App Router; `proxy.ts`, not middleware).
