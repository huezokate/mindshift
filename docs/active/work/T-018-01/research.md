# T-018-01 — Research

Material Symbols icon system. Map of what exists, where, and how it connects.
Descriptive only — no solutions proposed here.

## Ticket intent

Kate sources **all** icons from Google Material Symbols (Sharp) — never custom
SVGs. The work: (1) ensure the Sharp stylesheet + base CSS + a reusable `<Icon>`
primitive exist, (2) replace every hand-rolled icon `<svg>` across
journal / nav / onboarding / lens / response with the correct Material symbol,
matching the Figma names, with visual parity across all 3 themes and a clean tsc.

## Current state — infrastructure already landed

Three prior commits (857a756, ab20a2a, 289e8c7) already built the foundation and
migrated the journal-v2 surface. So a large slice of this ticket is **done**:

- **Stylesheet link** — `src/app/layout.tsx:15-21` loads
  `Material Symbols Sharp` with the full axis ranges
  (`opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200`). The project's single
  icon source.
- **Base CSS** — `src/app/globals.css:27-42` defines `.material-symbols-sharp`
  (font-family, ligatures via `font-feature-settings: 'liga'`, `inline-block`,
  reset letter-spacing/line-height). Present and correct.
- **`<Icon>` primitive** — `src/components/ui/Icon.tsx`. Props:
  `name, size=24, fill=0, weight=400, grade=0, className, style, title`.
  Renders a `<span class="material-symbols-sharp">` with
  `fontVariationSettings: 'FILL' … 'wght' … 'GRAD' … 'opsz' …` and `opsz`
  tracking `size`. Inherits `currentColor`. `aria-hidden` unless `title` given
  (then `role="img"` + `aria-label`). Matches all AC for the component itself.

### Files already migrated to `<Icon>` (journal-v2 surface)

- `src/components/nav/AppHeader.tsx` — uses `camera`, `psychology`, `article`,
  `add`, `tab_group`. This is the **established naming convention** to follow.
- `src/components/journal/LensCard.tsx`
- `src/components/journal/JournalPreviewCard.tsx`
- `src/components/journal/EntryDetail.tsx`
- `src/components/journal/UpcomingChip.tsx`
- `src/components/journal/JournalV2Client.tsx`

These no longer contain raw icon `<svg>` and need no further work.

## Remaining hand-rolled icon SVGs

A full src/ sweep (ripgrep) found raw `<svg>` in 6 files. Classified against the
ticket's scope list (journal / nav / onboarding / lens / response):

### In scope — must migrate

1. **`src/app/app/response/page.tsx`** — 7 local icon components, all UI icons:
   - `IconBookmark` (line 16) — Save to journal action button.
   - `IconShare` (line 23) — Share action button (node-graph share glyph).
   - `IconPalette` (line 31) — "Decorate" button (disabled, coming soon).
   - `IconRefresh` (line 42) — footer "Try another" button.
   - `IconNote` (line 49) — footer "New" button.
   - `IconChat` (line 56) — footer "Converse" button.
   - `IconCamera` (line 63) — brand bar screenshot mark (between the two
     "Mindshift" wordmarks).
   Each is rendered inside `<span style={{ color: … }}>` or `iconBtn()` styled
   buttons, so they already inherit `currentColor`. Sizes vary (18/20/22).

2. **`src/app/app/journal/page.tsx`** (legacy journal, server component) — 3 icons
   in the fixed `FooterNav`:
   - `CameraIcon` (line 11) — "Try another Lens".
   - `BookIcon` (line 19) — "Journal".
   - `PersonIcon` (line 27) — "Continue".
   `FooterNav` is a local component; icons sit beside uppercase labels and inherit
   `color` from the link style (cyan / pink active).

3. **`src/components/SessionCard.tsx`** (legacy journal session card, client) —
   2 icons:
   - `ShareIcon` (line 20) — share/upload glyph in the collapsed-card footer
     (all 3 theme branches reuse it).
   - `MindIcon` (line 29) — brain/lightbulb mark in the expanded "lens nav row"
     (all 3 theme branches).

### Out of scope — leave as-is

- `src/app/library/page.tsx:263` `ShareIcon` — library domain, not in the
  ticket's component list.
- `src/app/app/mindmap/reflect/page.tsx:227` — a custom progress-ring + dot
  **visualization**, not an icon. Decorative; must not be replaced.
- `src/components/mindmap/AreaIcon.tsx` — mindmap domain; renders per-area
  Material-style paths dynamically. Specialized, different domain, out of scope.
- `src/components/journal/SocialIcon.tsx` — **intentional** themed brand glyphs
  (Instagram / TikTok / Facebook / SMS) served from `public/icons/social/`.
  Material Symbols has no brand logos; the component header documents this. Not
  a custom UI icon — leave it.

### Confirmed clean (no icons / already migrated)

- `src/app/app/lens/page.tsx` — no `<svg>`, no `<Icon>`. No icon work needed.
- `src/app/app/onboarding/page.tsx` — no `<svg>`, no `<Icon>`. None needed.
- `src/components/JournalClient.tsx`, `src/components/LensResponseCard.tsx` — no
  raw `<svg>`.

## Patterns & constraints

- **Token-driven styling.** Per `V200/CLAUDE.md`: never hardcode hex; use CSS
  custom properties (`var(--cyan)` etc.). Icons inherit `currentColor`, so color
  is already driven by the surrounding element's `color` token — the migration
  must preserve those wrappers, only swapping the glyph.
- **Established Icon names** (from AppHeader): `camera`, `psychology`, `article`,
  `add`, `tab_group`. The ticket also names candidates: `camera`, `psychology`,
  `article`, `tab_group`, `add`, `ios_share`, `comic_bubble`, `palette`,
  `release_alert`, `auto_stories`, `lock`, `public`.
- **Size parity.** Existing SVGs encode explicit px sizes (18/20/22/24/26). The
  `<Icon size>` prop must carry those exact numbers so layout/optical-sizing is
  unchanged.
- **Next.js 16** (see `V200/AGENTS.md`): server vs client component rules apply.
  `journal/page.tsx` is a server component; `<Icon>` is a presentational client-
  safe component (no hooks/state) and is already imported by client files — it
  renders fine in a server component too (pure span, no client-only APIs).
- **No test framework.** `package.json` scripts: `dev`, `build`, `start`,
  `lint` (eslint). No unit-test runner. Verification = `npx tsc --noEmit`,
  `eslint`, and visual parity across the 3 themes.

## Legacy-journal caveat (assumption to flag)

`/app/journal` (+ `SessionCard`, `JournalClient`, `LensResponseCard`) appears to
be the **pre-v2** journal, superseded by `journal-v2`. It is still routed (the
response footer links to `/app/journal`, and AppHeader links to `journal-v2`),
so it is live code today. The AC ("no remaining custom icon `<svg>` in
journal/nav components") covers it regardless of which UI ultimately wins, so it
is treated as in scope. Whether legacy journal is later retired is a product
decision outside this ticket.

## Open questions for Design

- Exact Material name per glyph (e.g. share → `ios_share` vs `share`; "New" note
  → `add` vs `note_add`; book → `auto_stories` vs `menu_book`).
- Whether to keep the per-file local icon wrappers or delete them outright after
  swapping to `<Icon>`.
