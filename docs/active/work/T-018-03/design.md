# T-018-03 — Design

Decisions, options, and rationale — grounded in `research.md`. Three asks from
the FigJam note: remove footer, remove brand bar, fix the lens-adjacent buttons.

## Ask 1 — Remove the footer action bar

**Decision: delete the fixed footer (section 5) entirely, and replace its nav
role by mounting `<AppHeader/>` at the top of the page.**

The note says "remove the footer — **we going with header drop down menu
instead**". The footer is the response screen's *only* navigation today (Try
another → lens, New → onboarding, Converse → journal), and `/app/layout.tsx`
does **not** mount AppHeader globally — it only lives on journal-v2 surfaces.
So a literal "delete the footer" leaves the screen with zero navigation, which
contradicts the note and would fail Kate's QA.

Options considered:

- **(A) Delete footer only.** Smallest diff, matches the AC's literal text. But
  strands the screen — no way out except Save (routes away) or browser back.
  Rejected: contradicts "header dropdown instead".
- **(B) Delete footer + add `<AppHeader/>` at top.** ‹chosen›. AppHeader is a
  built, token-driven, drop-in (`src/components/nav/AppHeader.tsx`, all props
  optional) already used by EntryDetail / JournalV2Client with the exact
  placement pattern: `<AppHeader/>` full-width, padded content below. Its
  dropdown covers Journal / New / Mind Map / Profile / Log out — a superset of
  the old footer nav. It also carries a MindShift wordmark + camera badge, which
  cleanly **absorbs the brand bar we're removing in Ask 2** (one brand mark, at
  the top, instead of a free-floating one mid-page).
- **(C) Move footer nav into the header dropdown by editing AppHeader.** Out of
  scope — AppHeader already has the needed rows; nothing to add.

Rationale: (B) is the only option that makes the note's two clauses cohere —
the footer goes *and* the header dropdown becomes the nav. It reuses existing,
Figma-matched UI (no new design), stays token-only, and removes a `position:
fixed` element (and its 100px scroll-padding reserve) that the design no longer
wants.

Counts (`entryCount` etc.) are omitted — the response screen has no server fetch
for them and the props fall back to `0` / `—`. Acceptable; matches how the props
are stubbed pending the backend (per AppHeader's own comment).

Dead code: `handleNew` is only called by the footer's "New" button → delete it.

## Ask 2 — Remove the central camera + "MindShift" container

**Decision: delete the brand bar (section 2, lines 162–178).** Verbatim from the
note: "no need for central container with camera icon and mindshift". The
`camera` Icon import becomes unused there; the brand identity now lives in
AppHeader (Ask 1), so nothing visual is lost.

## Ask 3 — Fix the lens-adjacent buttons

**Decision: restyle the three-button action row (section 4) from the heavy
`iconBtn()` pills to the lens-card button-row idiom; keep the three actions and
all behaviour.**

The canonical "lens-card button row" is `LensCard.tsx` → `headerActions`
(already built to Figma on the journal-v2 lens card). Its idiom:
`background: transparent`, `border: none`, `padding: 6`, `display: flex`,
`<Icon size={18–20}>`, colour from tokens (`var(--text-muted)` resting, an
accent token when active). The response screen instead uses `iconBtn()` — 54×54
circular pills with `var(--btn-bg)`, four token borders, and `var(--btn-shadow)`.
That pill chrome is precisely the mismatch Kate flags.

Options:

- **(A) Restyle in place to the transparent idiom, keep Save / Decorate / Share
  as a right-aligned row adjacent to the lens card.** ‹chosen›. Minimal,
  intent-true to "adjacent buttons", preserves the three distinct actions the
  screen needs.
- **(B) Move the actions into the lens-card *header*** (exactly like LensCard).
  Rejected: the response card is bespoke inline markup; relocating actions into
  its header is a larger refactor, and "adjacent" in the note implies they stay
  beside/below the card, not inside it.
- **(C) Reduce to favorite + share** (literal 1:1 with LensCard's two buttons).
  Rejected: "favorite" is meaningless pre-save (nothing persisted yet); Save is
  this screen's primary CTA and carries the T-018-05 save-pop. Dropping it would
  break the save flow.

New shared style (replaces `iconBtn`):

```
actionBtn = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'transparent', border: 'none', padding: 6,
  cursor: 'pointer', color: 'var(--text-muted)',
  transition: 'color 0.15s',
}
```

- **Save** (`bookmark`): `color: var(--cyan)` when `saveState === 'saved'`
  (the screen's existing active accent — also the typewriter-cursor colour),
  else `var(--text-muted)`. Keeps `animate={saveControls}` (save-pop) +
  `whileTap`.
- **Decorate** (`palette`): disabled → `opacity: 0.3`, `cursor: not-allowed`.
- **Share** (`ios_share`): `var(--text-muted)`.
- Row: `flex gap-1 justify-end`, still gated on `done`, Icons at `size={20}`.

Tokens only — `--text-muted` and `--cyan` are defined in all three token sets
(used by LensCard across themes), so theme parity holds without hex.

## Cross-cutting

- **Scroll padding:** `padding: '24px 24px 100px'` → `'24px 24px 32px'`. The
  100px reserve existed only to clear the fixed footer; with the footer gone it
  leaves a dead gap.
- **Imports:** after the edits, `camera`, `refresh`, `note_add`, `forum` are no
  longer referenced. `<Icon>` itself stays (used by the action row). No import
  of Icon is removed — only the now-unused *names* disappear (they were string
  args, not imports), so no import churn beyond adding `AppHeader`.
- **No token, route, API, or schema changes.** Pure component edit in one file.

## Verification strategy

`npx tsc --noEmit` clean; manual QA in cyberpunk / kawaii / notepad: header
renders + dropdown opens, no footer, no mid-page brand bar, action row is the
flat transparent style, Save still pops + routes to the saved entry.
