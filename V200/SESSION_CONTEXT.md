# MindShift V200 — Session Context

_Last updated: 2026-06-13_

## ★ CURRENT ROADMAP (Kate's priority order, 2026-06-13)

1. **Ship Journal frontend, then Mindmap frontend** — connected; journal leads. **← active focus: UI polish (today/weekend).**
2. Hook up **backend** for journal + mindmap.
3. **Billing via Clerk** — free-premium **passcode/comp**: people who stumble on the app must connect payment; **recruited users get everything free**.
4. **Ship + run campaign.**
5. **Fine-tune Gemini** — API is wired for calls but Kate thinks it's not working right; audit + fix the response quality.
6. **Weekly goals + Monday letter** — LAST (detailed plan in "NEXT PHASE" section below).

In parallel (non-blocking): a **"Claude Design intern"** — set up `.claude/agents/design-intern.md` (Figma MCP) + `.claude/commands/design.md` so Kate can run `/design …`.

**★ QUEUED — run AFTER journal dev is final (code → Figma):** Inventory every component we use in code (cards + all card variants, chips, menu, buttons, icons, avatars, dots, etc.) and publish them as proper Figma **components with variants** at node `603:6971` of the MindShift file (`Mubv0Ghdm2SPxF42JVsX8M`). **Cyberpunk first**, other themes after. Goal: an editable component page Kate can change and hand back to code. Needs `/figma-use` + `/figma-generate-library` skills. Also: double-check Kate's assumption that components stay identical on desktop (only layout changes) — most likely true, but flag hover/focus states + any desktop-only variants. Source of truth for the inventory: `src/app/library/page.tsx` + the `journal/` components. Deferred because the feed rebuild + lens-picker will still change the component set.

Settled: ✅ website fully shipped (landing polish, GA4 live host-gated to website-only, notepad paper bg) · ✅ Vercel primary domain flipped · ✅ "Manny" spelling fine, don't revisit.

Worktrees: journal/mindmap frontend = `/Users/KaterinaHuezo/Documents/projects/MindShift` on `feat/landing-figure-vent` (dev :3001). Website was `feat/website` in the `MindShift-mindmap` worktree.

---

_Original 2026-06-07 context follows (schema, decisions, research — still valid reference):_

> Full narrative of the 2026-06-05→07 remote-control session is in
> `../docs/active/SESSION-RECAP-2026-06-05-07.md`. This block is the quick state.

## Where we left off

Active feature: **Mindmap (life-goal planning).** Front-end iteration is well along on `feat/mindmap-flow` (Vercel preview, draft PR #1). The 2026-06-05→07 session (via remote control) applied three rounds of Kate's Figma notes to the create flow, added a Browse overview, gated the landing, **narrowed life areas 7 → 5 with Material icons**, and built a **zoomable React Flow mind-map canvas**. All still front-end only / notepad theme / stubbed sample data. Kate is starting a separate parallel minds-shift project, so this is a clean pause point.

### Shipped this session (commits on `feat/mindmap-flow`: 89cec2b, 5122f64, 355ffbe)
- **Scope step** (`/app/mindmap/new` step 1): horizon **slider** with anchors `month · quarter · year · 5 years · your own timeline` (last = calendar date picker). **Multi-select** life areas, stacked full-width with prompt subtext + live pairing preview. **Selected = green** (border + light-green tint `#eef3ec` + green icon), uniform border, no check badge.
- **Tell us about it** (step 2): **all accordion panels open by default**; one panel per selected area. Fields trimmed + reordered → **Desired outcome in {horizon} → Main obstacle → I want to become…** (dropped the redundant "wish").
- **Curate** (step 3): milestone card matches Figma — `FIRST ACTION (X MIN)` label (time parsed from the action string), action in small caps, no chip box. **Selected milestone = green**, checkbox fills green.
- **Browse** (`/app/mindmap/browse`, NEW): one container per life area, goals stacked with progress bars + %. Kate likes this but wants **"a bit of logic"** added — superseded by the radial map concept below.
- **Landing** (`/app/mindmap`): **state-gated** via `localStorage('mindshift_has_map')` — "Create your mindmap" before, Browse + Reflect after. Set on Save in `/new`.
- **5 life areas** (was 7): Career · Health & Fitness · Relationships · Personal Development · Finance, in shared **`src/lib/mindmap-areas.ts`**. Create flow reads from it. Unicode marks replaced with **Google Material icons** (`src/components/mindmap/AreaIcon.tsx`, exported from Kate's Figma, `currentColor` so they theme).
- **Mind-map canvas** (`/app/mindmap/map`, NEW): React Flow radial hub-and-spoke ("In 5 years…" center → 5 cards). Zoom/pan/minimap, drag-to-move, floating center-to-card edges (color = `--map-edge` → falls back to each theme's `--pink`). **Radial ⇄ Organic** toggle: Organic seeds positions with a headless `d3-force` pass (`sim.tick(300)`); Radial = polar layout. Deps added: `@xyflow/react`, `d3-force`, `@types/d3-force`.
- **`MindmapAreaCard`** (`src/components/mindmap/MindmapAreaCard.tsx`): token-driven card spun off the input/card surface (zero hardcoded hex) so kawaii/cyberpunk/notepad coordinate. Shared by the map; intended to also back Browse.
- Kate likes the **Review timeline** ("Your year of health & fitness") preview as-is.

### Decisions locked
- **Reflect + reminders are TABLED** — a later feature. Do not build now.
- Habit-formation fact check: the "3 weeks" figure is a myth; real median ~66 days (Lally et al. 2010). So **a month is the floor** on the horizon slider (a "day" option was removed); quarter is the honest "habit-forming" minimum. Both are on the slider; users self-select.
- **Map direction**: Kate leans **React Flow** (option A). Built with a live Radial/Organic toggle so she can compare. `d3-force` is the seeding layer for "organic."

### Open questions for Kate (next session)
- Should `/app/mindmap/map` **replace** the static `/browse`, or stay as two views?
- Map "**zoom-in to expand a card**" into milestones/weekly goals — build it?
- Connector color: currently per-theme `--pink`; set a dedicated `--map-edge` per theme?

## NEXT PHASE — weekly goals + Monday email (the real build)

Kate's direction for what comes after the create flow:
- After a map is created, **generate monthly/weekly goals**. Horizon drives cadence — e.g. **"a month" → 4 weekly goals**. Each week has goals + milestones.
- **Every Monday → email** the user "goals and milestones for the week" (via **Resend**). The create/review screen **header should mention** this Monday email.
- Need a **zoomable map UI** (pan / zoom in–out) for Browse — **Kate is designing it in Figma and will send the link**; the corrected Browse "logic" will be legible from that file.

### What this requires (open planning — agreed list)
1. **Persistence** — wire Supabase (migration 004: goals / milestones / weekly_goals / check-ins; check-ins/streaks can wait with Reflect). All data is currently stubbed sample / localStorage.
2. **Gemini generation** — break a plan into weekly goals + milestones at the chosen cadence (month→4 wks; quarter→~13; year→roll forward, don't pre-gen 52). Two passes already stubbed in `/new` (gen1 candidates, gen2 timeline).
3. **Auth/email-capture decision** — weekly email needs a known address + consent. Mindmap is currently anon-friendly (localStorage). Must either **gate map creation behind Clerk sign-in** or capture email at creation. (Journal is already Clerk-gated; Resend domain `hello@minds-shift.com` is verified; welcome-email-on-signup still NOT wired.)
4. **Scheduled send** — **Vercel Cron** → API route that runs Mondays, finds active plans, fetches/generates that week's goals, sends via Resend. Handle **user timezone** (local Monday) + **unsubscribe / email prefs**.
5. **Email template** — "Your goals & milestones for this week" (React Email or HTML).
6. **Zoomable map UI** — likely `react-zoom-pan-pinch` or custom; replaces/extends Browse. Wait for Kate's Figma.
7. Header copy on review/created screen: "Every Monday we'll email you this week's goals & milestones."

(Original session-context content from earlier iterations follows below.)

## Active branch / review

- **Branch**: `feat/mindmap-flow` (off `main`)
- **PR**: https://github.com/huezokate/mindshift/pull/1 (draft)
- **Vercel preview** (review on mobile):
  - Landing: https://mindshift-git-feat-mindmap-flow-huezokate-9175s-projects.vercel.app/app/mindmap
  - Create flow: https://mindshift-git-feat-mindmap-flow-huezokate-9175s-projects.vercel.app/app/mindmap/new
  - Reflection: https://mindshift-git-feat-mindmap-flow-huezokate-9175s-projects.vercel.app/app/mindmap/reflect

Prod (`app.minds-shift.com`) is untouched — still on the theme-select redesign (`23687ce`).

## What shipped today (to `main`)

### Theme-select page rebuild (`23687ce`)
Restructured `/app/theme-select` as three stacked elements — no nested cards.
- **Hero card** (Figma node 397:3658 — LensePreviewCard style) holds the MindShift wordmark, tagline, and disclaimer checkbox with progressive-disclosure "Learn more"
- **Theme picker card** keeps its carousel (`Pick your interface` arrows)
- **Primary "Enter MindShift" CTA** with hardcoded solid background fill (cyberpunk's `--btn-bg` is `transparent` by design, which was leaking the figure grid through the button)

Earlier in the day: restored the UI selection + disclaimer flow (the previous shipped commit `71be072` reverted the proxy redirect from `/app/onboarding` → `/app/theme-select`).

## What's on the review branch (NOT yet on main)

### Mindmap feature — first deliverable (stubbed, no backend)

**Pages added:**
```
src/app/app/mindmap/page.tsx          Landing with two CTAs (rewritten from placeholder)
src/app/app/mindmap/new/page.tsx      6-step state machine for new goal creation
src/app/app/mindmap/reflect/page.tsx  Weekly reflection check-in
```

Both new pages force notepad theme on mount (Kate's choice for first iteration). All sample data is hardcoded inline as `SAMPLE_*` constants — Gemini + Supabase wire in iteration 2.

**`/app/mindmap/new` flow:**
1. **Category** picker — 7 life areas (career, health, creativity, personal, relationships, travel, finances)
2. **WOOP input** — 4 fields: wish / best outcome / main obstacle / identity ("I want to become someone who…")
3. **Loading** state (1.8s — simulates Gemini pass 1)
4. **Curate** — 12 candidate milestone cards with checkboxes (≥4 required to advance)
5. **Loading** state (1.6s — simulates Gemini pass 2)
6. **Review** — vertical timeline w/ month markers + dotted spine + if-then implementation intentions per milestone

**`/app/mindmap/reflect`:**
- Two-ring SVG (outer = milestone pace, inner = "this week reflected" binary)
- Current streak / longest streak / rest weeks available
- Three-question form: Evidence / Friction / Meaning
- "Last Sunday's reflection" preview card
- Quiet 8-week celebration on save (no confetti)

## Research-backed decisions baked into the UX

(Full synthesis is in the conversation transcript; key citations:)

| Framework | Where it shows up |
|---|---|
| **WOOP / mental contrasting** (Oettingen, g = 0.336) | Goal capture step — wish + obstacle pairing |
| **Implementation intentions** (Gollwitzer, d = 0.65 across 94 studies) | Each milestone's "If [trigger] then [action]" line |
| **Identity-based habits** (Clear / Bem) | Milestone headlines: "Become someone who…" |
| **Tiny habits** (Fogg) | Each milestone's `first_action` field (< 2 min) |
| **Stoic / Finch streak model** | "Show up and reflect" weekly streak, not action streak |
| **Streak freeze → Rest Weeks** (Duolingo, reframed) | 2 rest weeks stored, contemplative framing |
| **No XP, no badges, no leagues** | Explicitly out — wrong tone for reflective brand |

## Architecture proposal (signed off, awaiting iteration 2 build)

### Supabase schema — to add as migration 004

```sql
create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  category text not null,
  wish text not null,
  best_outcome text,
  main_obstacle text,
  identity_statement text,
  start_date date not null default current_date,
  target_months int not null default 12,
  tracker_type text not null default 'project',
  status text not null default 'active',
  created_at timestamptz default now()
);

create table milestones (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references goals(id) on delete cascade,
  user_id text not null,
  position int not null,
  target_month int not null,
  identity_headline text not null,
  outcome text not null,
  first_action text not null,
  if_then_action text,
  if_obstacle_then text,
  status text not null default 'pending',
  completed_at timestamptz,
  created_at timestamptz default now()
);

create table goal_check_ins (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references goals(id) on delete cascade,
  user_id text not null,
  check_in_date date not null,
  check_in_type text not null,  -- weekly | milestone | rest_week
  evidence text,
  friction text,
  meaning text,
  milestone_id uuid references milestones(id),
  created_at timestamptz default now(),
  unique (goal_id, check_in_date, check_in_type)
);

create table goal_streaks (
  user_id text not null,
  goal_id uuid not null references goals(id) on delete cascade,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_check_in_date date,
  rest_weeks_available int not null default 2,
  primary key (user_id, goal_id)
);
```

Use the standard Clerk RLS pattern (`user_id = requesting_user_id()`) on all four tables.

### API routes to add

| Route | Purpose |
|---|---|
| `POST /api/mindmap/generate-candidates` | Gemini pass 1 — WOOP input → 12-15 candidates |
| `POST /api/mindmap/finalize` | Gemini pass 2 — selected candidates → ordered timeline |
| `POST /api/mindmap/goals` | Persist goal + milestones |
| `GET /api/mindmap/goals` / `GET /api/mindmap/goals/[id]` | Fetch user's goals |
| `POST /api/mindmap/check-ins` | Submit weekly/milestone reflection |
| `PATCH /api/mindmap/milestones/[id]` | Mark done/skipped |

Clone patterns from `src/app/api/generate-response/route.ts` and `src/app/api/save-response/route.ts`.

### Email cadence (Resend) — to set up

- **Sunday 6 PM local** — "Your Sunday reflection is ready" (invitation tone)
- **Wednesday 8 AM local** — micro-nudge surfacing user's own past words
- **Cap: 2/week. Suppress 7 days after a completed reflection.**
- **No push.** Adaptive timing within Sunday 5-9pm after week 4.

Email archetype subject lines (in conversation transcript): _"A quiet moment with your year"_, _"What did this week teach you?"_, _"{first_name}, one question for the week ahead"_.

## New decision since iteration 1 — TOMORROW'S WORK

> Kate's note end of today: **"we would need a special part of the journal to host the mindmap reflections and progress"**

This means the existing `/app/journal` (which currently shows vent_sessions + lens_responses) needs a sibling surface or tab for mindmap reflections + milestone progress. Open questions for tomorrow:

- Tab inside existing journal page, or separate `/app/journal/mindmap` route?
- How do `goal_check_ins` get rendered alongside vent_sessions chronologically?
- Should completed milestones generate a journal entry automatically?
- Should the journal also be where you _read back_ the full timeline of your year?

## Pickup checklist for tomorrow

1. Review Kate's Figma notes (frames will be pushed to MindShift Figma file before end of today's session)
2. Decide on the journal-mindmap section shape (tab vs. route, chronological vs. grouped)
3. Apply Figma feedback to the 3 mindmap pages on `feat/mindmap-flow`
4. Begin iteration 2:
   - Migration 004 (the 4 tables above)
   - Two Gemini API routes (clone from `generate-response`)
   - Save/load flow with Clerk gate
   - Then journal mindmap section
   - Resend weekly cadence last

## Key file map (current state)

```
src/app/app/theme-select/page.tsx       Hero card + carousel + ack (shipped today)
src/app/app/mindmap/page.tsx            Mindmap landing (review branch)
src/app/app/mindmap/new/page.tsx        6-step creation flow (review branch)
src/app/app/mindmap/reflect/page.tsx    Weekly reflection (review branch)
src/app/api/generate-response/route.ts  Pattern to clone for Gemini routes
src/app/api/save-response/route.ts      Pattern to clone for save-goal
src/components/SessionCard.tsx          3-theme branching pattern reference
src/components/AuthBanner.tsx           --card-* token shape reference
src/styles/tokens-notepad.css           Notepad design tokens
src/lib/theme.tsx                       useTheme() hook
src/lib/supabase.ts                     getSupabase / getSupabaseAdmin
src/lib/user-tier.ts                    getUserTier (anon/free/pro)
src/proxy.ts                            Host-aware redirects (subdomain → /app/theme-select)
```

## Stack reminder

| Layer | Tech |
|---|---|
| Framework | Next.js 16 App Router (Turbopack) |
| Lang | TypeScript |
| Style | Tailwind v4 + CSS custom properties (`var(--*)`) |
| Auth | Clerk v7 |
| DB | Supabase (Postgres) |
| AI | Google Gemini 2.0 Flash (`@google/generative-ai`) |
| Email | Resend |
| Hosting | **Vercel** (auto-deploys `main` to prod, every branch gets a preview) |
| DNS | Cloudflare (DNS-only / gray cloud) |

`npm run dev` → localhost:3000.

## Theme rendering pattern

```tsx
'use client'
import { useTheme } from '@/lib/theme'

export default function MyComponent() {
  const { theme } = useTheme()
  if (theme === 'cyberpunk') { return (...) }
  if (theme === 'kawaii')   { return (...) }
  return (...)  // notepad default
}
```

Never hardcode hex values — always `var(--cyan)`, `var(--green)`, etc.
Notepad drop-shadows: apply `filter: var(--card-filter)` to an outer wrapper, never on an element with `overflow: hidden`.

For the mindmap pages, both screens force `setTheme('notepad')` on mount — when we add kawaii + cyberpunk theming, remove that and use the 3-theme branching above.
