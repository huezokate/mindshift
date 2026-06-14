# Session recap — 2026-06-05 → 06-07 (Mindmap: create-flow polish, 5 areas, React Flow map)

Temporary doc. Roll the durable bits into `V200/SESSION_CONTEXT.md` (already done) and delete once the next-phase build (weekly goals + Monday email) starts.

## Goal of this session

Remote-control session (Kate iterating from mobile + Figma) on the **Mindmap** feature, branch `feat/mindmap-flow`. Apply Kate's Figma notes to the create flow, narrow the life areas, and prototype the interactive mind-map canvas. Everything front-end only, notepad theme, stubbed sample data. Prod untouched.

## Commits shipped (on `feat/mindmap-flow`, off `main`, draft PR #1)

| Commit | Summary |
|---|---|
| `89cec2b` | Scope step (horizon slider + multi-select areas), accordion WOOP, Browse overview, gated landing |
| `5122f64` | Horizon = month/quarter/year/5yr/custom-date; green selection; trimmed/reordered WOOP; corrected milestone card |
| `355ffbe` | Zoomable React Flow map (radial ⇄ organic), 5 areas + Material icons, shared `MindmapAreaCard` |

Vercel preview (mobile review): base URL
`https://mindshift-git-feat-mindmap-flow-huezokate-9175s-projects.vercel.app`
Routes: `/app/mindmap` (gated landing), `/app/mindmap/new` (create flow), `/app/mindmap/browse` (static overview), `/app/mindmap/map` (React Flow canvas), `/app/mindmap/reflect` (untouched).

## What was built / changed

### Create flow — `/app/mindmap/new` (`src/app/app/mindmap/new/page.tsx`)
- **Step 1 "Scope"** (was a single-select category grid): horizon **slider** `month · quarter · year · 5 years · your own timeline`; last stop reveals a **calendar date picker** (`monthsUntil`/`formatDate`/`effectiveHorizon` helpers). Areas are **multi-select**, stacked full-width with **prompt subtext** + live **pairing preview**. Selected state = **green** (`#eef3ec` tint + `--green` border/icon), uniform border, no check badge.
- **Step 2 "Tell us about it"**: **all accordion panels open by default** (one per selected area). Fields trimmed + reordered to **Desired outcome in {horizon} → Main obstacle → I want to become…** (dropped redundant "wish"). WOOP state is now **per-area** (`woopByArea`).
- **Step 3 "Curate"**: milestone card matches Figma — `FIRST ACTION (X MIN)` label (`splitFirstAction` parses the time out of the action), action in small caps, no chip box. **Selected = green**, checkbox fills green.
- **Step 4 "Review"**: timeline adapts to the chosen horizon + areas. Kate likes this preview as-is.
- On Save: sets `localStorage('mindshift_has_map')`, routes to `/browse`.

### Life areas: 7 → 5 (`src/lib/mindmap-areas.ts` — NEW, shared)
Career · Health & Fitness · Relationships · Personal Development · Finance. Create flow now imports `AREAS` from here. Unicode marks replaced with **Google Material icons** (`src/components/mindmap/AreaIcon.tsx` — exported from Kate's Figma map frame via `exportAsync`, single-path 24×24, `fill="currentColor"` so they theme).

### Browse — `/app/mindmap/browse` (`src/app/app/mindmap/browse/page.tsx`, NEW earlier in session)
Container per area, goals stacked with progress bars + %. Superseded conceptually by the radial map; still live for comparison. **Not yet migrated to the 5 areas / shared card** (still has its own 3-area sample + unicode marks).

### Landing — `/app/mindmap` (gated)
`localStorage('mindshift_has_map')` → "Create your mindmap" before a map exists, Browse + Reflect after.

### Mind-map canvas — `/app/mindmap/map` (`src/app/app/mindmap/map/page.tsx`, NEW)
React Flow radial hub-and-spoke ("In 5 years…" center → 5 area cards). Built from Kate's Figma concept (node `541:5035`).
- Zoom / pan / **minimap** / zoom buttons / **drag-to-move** nodes.
- **Floating edges** (`FloatingEdge` via `useInternalNode` + `getStraightPath` + `BaseEdge`): center-to-card, trimmed so the arrowhead lands at the card edge. Color = `--map-edge` with fallback to each theme's `--pink` (auto-coordinates per theme).
- **Radial ⇄ Organic** toggle (top-left pills): Organic seeds node positions via a **headless `d3-force` pass** (`organicCenters()` → `sim.tick(300)`); Radial = polar layout (`radialCenters()`). Same nodes, swap positions live. This is the A-vs-D comparison Kate asked for.
- Custom nodes: `HubNode` (green display text), `AreaNode` (renders `MindmapAreaCard`).
- Forces notepad theme on mount like the other surfaces.

### Shared card — `src/components/mindmap/MindmapAreaCard.tsx` (NEW)
Token-driven card **spun off the app's input/card surface** (Kate's requirement so kawaii/cyberpunk/notepad coordinate). Zero hardcoded hex — all `var(--card-*)`, `--pink`, `--green`, `--cyan`. Renders icon + title + body + "{n} major milestones / {m} actions planned". Selected state green via `--mm-card-bg-selected` (falls back `#eef3ec`).

### Dependencies added
`@xyflow/react`, `d3-force`, `@types/d3-force` (in `package.json` / lockfile — committed).

## Key decisions

- **Reflect + reminders are TABLED.** Later feature. Do not build.
- **Habit science:** "3 weeks/21 days" is a myth (Maltz 1960). Real median ~66 days (Lally et al. 2010). So **month is the slider floor** (removed "a day"); quarter is the honest habit-forming minimum.
- **Map approach:** Kate leans React Flow (option A). Organic seeding (`d3-force`) is the toggle, not the default.
- **Selected state = green** across area + milestone cards (matches Kate's corrected Figma cards `541:4022`, `541:4231`).

## NEXT PHASE — weekly goals + Monday email (the real build)

After a map is created → generate weekly goals/milestones (horizon sets cadence; **month → 4 weekly goals**). **Every Monday** email "goals & milestones for the week" via **Resend**. Create/review **header should mention** the Monday email.

Required (agreed list):
1. **Supabase persistence** — migration 004 (goals / milestones / weekly_goals). All data is stubbed/localStorage today.
2. **Gemini generation** — break a plan into weekly goals at cadence (month→4, quarter→~13, year→roll forward, don't pre-gen 52).
3. **Auth/email-capture decision** ⚠️ FIRST — email needs an address + consent, but mindmap is anon-friendly today. Either gate map creation behind Clerk sign-in or capture email at creation. (Journal already Clerk-gated; Resend domain `hello@minds-shift.com` verified; welcome-email-on-signup still not wired.)
4. **Scheduled send** — Vercel Cron → API route on Mondays; handle user timezone (local Monday) + unsubscribe/prefs.
5. **Email template** — "Your goals & milestones for this week."
6. **Map polish** — migrate Browse to the radial map / 5-area shared card; optional zoom-in-to-expand a card into milestones.

## Open questions for Kate
- `/app/mindmap/map` **replaces** `/browse`, or two views?
- Build "**zoom-in expands a card**" into milestones/weekly goals?
- Dedicated `--map-edge` per theme, or keep per-theme `--pink`?

## Housekeeping notes
- Figma capture frames of the screens live on the **"MINDMAP + Journal"** page (`534:4003`): create flow / browse / landing (`535–537:190`), map render (`544:373`). Captures are raw frames (no design-system components) and the map capture omits React Flow's edge SVG layer (arrows render live only).
- Did **not** touch Kate's uncommitted WIP: `tokens-*.css`, `journal-preview`, `library`, `EntryCard.tsx`. Only committed mindmap files + the new deps.
- `src/app/app/mindmap/browse/page.tsx` still uses the old 3-area sample + unicode marks — migrate when Browse↔map is decided.
