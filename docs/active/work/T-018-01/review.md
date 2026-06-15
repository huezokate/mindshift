# T-018-01 — Review

Material Symbols icon system. Handoff summary for a human reviewer.

## What changed

The icon **infrastructure** (`<Icon>` primitive, `.material-symbols-sharp` base
CSS, Sharp stylesheet link) and the entire **journal-v2 surface** were already
done in prior commits (857a756, ab20a2a, 289e8c7). This pass migrated the **last
remaining hand-rolled icon SVGs** in the in-scope surfaces.

### Files modified (3) — one commit each

| File | Commit | Icons migrated |
|---|---|---|
| `V200/src/app/app/response/page.tsx` | `refactor(response): … (T-018-01)` | 7 |
| `V200/src/app/app/journal/page.tsx` | `refactor(journal): footer nav … (T-018-01)` | 3 |
| `V200/src/components/SessionCard.tsx` | `refactor(journal): SessionCard … (T-018-01)` | 2 (×3 branches) |

Each edit: added `import Icon from '@/components/ui/Icon'`, swapped every glyph
call site to `<Icon name … size … />`, deleted the now-dead local SVG wrapper
functions. No wrappers/buttons/links restyled — color still flows from
`currentColor` on the surrounding token-styled elements.

### Name mapping (final)

- response: `camera`(22) · `bookmark`(20) · `palette`(20) · `ios_share`(20) ·
  `refresh`(18) · `note_add`(18) · `forum`(18)
- journal footer: `camera`(24) · `auto_stories`(24) · `person`(24)
- SessionCard: `ios_share`(24) · `psychology`(24)

Sizes carried over verbatim from the original SVG `width`/`height`; `opsz` tracks
size inside `<Icon>`, so optical sizing matches.

## Acceptance criteria

- ✅ `<Icon>` renders Material Symbols Sharp; size/fill/weight props work;
  currentColor — pre-existing primitive, unchanged, verified by inspection.
- ✅ No remaining custom icon `<svg>` in journal/nav components —
  `rg '<svg'` over response/journal/lens/onboarding/SessionCard/components/journal
  returns **zero** matches.
- ✅ Icons match Figma names (followed AppHeader convention + ticket candidate
  list); ✅ tsc clean (`npx tsc --noEmit` → exit 0).
- ⚠️ Visual parity across all 3 themes — **not machine-verified** in this
  headless pass (no browser). Reasoned-safe (currentColor + preserved wrappers +
  matching sizes), but see "Needs human attention" below.

## Test coverage

No unit-test runner exists in the project (`package.json` scripts: dev/build/
start/lint only). Coverage achieved:

- **Type safety:** `tsc --noEmit` clean.
- **Lint:** `eslint` on the 3 files surfaces only **pre-existing** findings
  (`react-hooks/set-state-in-effect` in the response typewriter effect; `<img>`
  LCP warnings; unused `createdAt` prop in SessionCard). **No new findings** from
  this change.
- **Scope completeness:** grep proof (above).

Gap: no automated visual/render assertion. Acceptable for an icon swap of this
size, but the 3-theme visual check is a manual step.

## Needs human attention

1. **`forum` vs `comic_bubble` for "Converse"** (response footer). Ticket's
   candidate list named `comic_bubble`; I chose `forum` (two-way dialog reads
   truer for "Converse"). One-line swap if Kate prefers the candidate glyph.
2. **3-theme visual pass.** Open `/app/response` (and legacy `/app/journal`) in
   cyberpunk / kawaii / notepad and confirm the glyphs render (not literal
   ligature text), sit correctly in their circular/rounded buttons, and inherit
   the active/inactive color tokens. Highest value on the response action row
   (bookmark/palette/share) and the journal footer.

## Open concerns / notes

- **Legacy journal lifespan.** `/app/journal` + `SessionCard` are the pre-v2
  journal, superseded by `journal-v2` (already migrated). They are still routed
  (response footer links to `/app/journal`), so they were migrated to satisfy
  the AC. If legacy journal is later deleted, these two commits become moot —
  no harm, but worth knowing this surface may be retired.
- **Out of scope, intentionally left:** `SocialIcon.tsx` (themed brand glyphs —
  Material has no brand logos), `library/page.tsx`, `mindmap/reflect/page.tsx`
  (decorative progress ring), `mindmap/AreaIcon.tsx` (mindmap domain). None are
  in the ticket's journal/nav/onboarding/lens/response scope.
- **No infra/token/schema changes**; blast radius is three presentational files,
  each revertable independently.
