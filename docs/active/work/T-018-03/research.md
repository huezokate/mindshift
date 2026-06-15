# T-018-03 — Research

Response-screen footer cleanup. Map of what exists, where, and how it connects.
Descriptive only — no solutions here.

## Ticket intent (FigJam `95:2228`, flow correction #8)

Pulled the sticky directly (FigJam `we0ZAnIHjmoKrlN82tJoB0`, node `95:2228`,
Kate Huezo). Verbatim, three asks:

1. **Remove the footer** — "we going with header drop down menu instead".
2. **No central container** with the camera icon + "MindShift" wordmark.
3. **FIX THE LENS ADJACENT BUTTONS.**

So this is a subtractive cleanup plus a restyle of one button row. No new
routes, no data changes.

## The single file in scope

`V200/src/app/app/response/page.tsx` (`ResponsePage`, client component, 338
lines). It is fully self-contained — all five visual sections live inline. The
sections, in DOM order:

1. **User-quote card** (lines 127–160) — "Dump it all here:" header + vent text
   + char count. Keep.
2. **Brand bar** (lines 162–178) — `<motion.div>` with two "Mindshift"
   wordmurks (violet + cyan) flanking a centered `<Icon name="camera" />`.
   **This is the "central container with camera icon and mindshift" → remove.**
3. **Lens response card** (lines 180–232) — avatar + name header, then quote +
   typewriter AI response. Keep. (No action buttons in its header today.)
4. **Quick action icons** (lines 234–264) — gated on `done`; a right-aligned row
   of three circular **pill** buttons built by the local `iconBtn()` helper
   (lines 103–116): Save (`bookmark`), Decorate (`palette`, disabled), Share
   (`ios_share`). **These are the "lens adjacent buttons" → restyle.**
5. **Footer action bar** (lines 274–333) — `position: fixed` bottom bar, three
   buttons: "Try another" (→ `/app/lens`), "New" (`handleNew`), "Converse"
   (→ `/app/journal`). **This is the footer → remove.**

The error row (lines 266–270) sits between 4 and 5. Keep.

## Behaviour that must survive the edit

- `handleSave` (54–87): anon → redirect to sign-in; else POST `/api/save-response`,
  stash `ms_session_id`, run the bookmark **save-pop** animation
  (`saveControls`), then `router.push('/app/journal-v2/${sessionId}')`. The pop
  is wired to the Save button via `animate={saveControls}`. Must be preserved —
  this is T-018-05's behaviour landing on the same button.
- `handleShare` (89–96): native share / clipboard fallback. Keep, on the Share
  button.
- `handleNew` (98–101): clears `ms_session_id`, routes to onboarding. **Only
  called from the footer's "New" button** — becomes dead code once the footer
  goes.
- The typewriter effect (39–50) drives `done`, which gates the action row.

## Layout dependency on the footer

The scroll container (line 124) uses `padding: '24px 24px 100px'`. The **100px
bottom padding** exists solely to clear the `fixed` footer so content isn't
hidden behind it. Removing the footer means that reserve is no longer needed and
should shrink, or the screen will have a large dead gap at the bottom.

The page root is `min-h-dvh flex flex-col` (119); the scroll container is
`flex-1` (123). With the footer gone the column simply ends after the content.

## The canonical "lens-card button row"

The phrase refers to the action row already shipped on the journal-v2 lens card:
`V200/src/components/journal/LensCard.tsx`, the `headerActions` block (lines
125–160). Its idiom, identical across all three themes:

- Two buttons in a `flex gap-4 items-center` row, sitting in the card **header**.
- `background: transparent`, `border: none`, `padding: 6`, `cursor: pointer`,
  `display: flex` — **no pill, no circle, no shadow**.
- `<Icon>` glyphs at size 18–20. Colour from tokens: `var(--text-muted)`
  default; favorite uses `var(--amber)` + `fill={1}` when active.
- Buttons: `star` (favorite toggle) and `ios_share` (share).

This is the visual target. The response screen's current `iconBtn()` pills
(54×54, `var(--btn-bg)`, `var(--btn-shadow)`, borders) are the mismatch Kate is
flagging — heavy pill chrome where the design system now uses bare icon buttons.

## Figma design notes

- The only "Response — {theme}" frames in the design file (`406:23/42/60`) are
  **early ideation** mockups (text SAVE / NEW LENS / SHARE buttons in a 3-up
  row). They predate the journal-v2 system and are **not** the source of truth.
- `get_design_context` on the live lens-card body (`397:3671`) confirms the card
  styling (Courier 14/20, 0.52px tracking, pink centered quote `#FF2D78`, cyan
  body `#00F5FF`) — already mirrored by tokens in both `LensCard.tsx` and the
  response card. The button-row source of truth is the shipped `LensCard.tsx`.

## Icon system + tokens (constraints)

- All icons come from `<Icon>` (`src/components/ui/Icon.tsx`) → Material Symbols
  Sharp. Names in use here: `camera`, `bookmark`, `palette`, `ios_share`,
  `refresh`, `note_add`, `forum`. After cleanup only `bookmark`, `palette`,
  `ios_share` remain. `camera`, `refresh`, `note_add`, `forum` become unused.
- Tokens only (`var(--…)`), no hex — per V200 CLAUDE.md and S-018 ground rules.
- Verification: `npx tsc --noEmit` must be clean (no `typecheck` npm script;
  `tsc` binary is present, TS ^5.9.3). QA expected across cyberpunk/kawaii/
  notepad.

## Assumptions / open questions

- "Fix the lens adjacent buttons" is read as **restyle the existing three-button
  action row to the lens-card idiom** (transparent, compact, Material Symbols),
  not "move them into the card header" and not "change which actions exist". The
  three actions (Save / Decorate / Share) are retained — Save is this screen's
  primary CTA and carries the T-018-05 save-pop. Flagged for Design.
- `handleNew` / "New" disappears with the footer. "Try another" (→ lens) and
  "Converse" (→ journal) navigation also disappear; the header dropdown is the
  intended replacement (per the note). No new nav is added by this ticket.
