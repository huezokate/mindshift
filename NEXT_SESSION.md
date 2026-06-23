# MindShift — Next session to-do (written 2026-06-23)

## TL;DR
Journal (S-018) is **done and live on prod**. Next focus: **Mindmap — wire the
backend (Groq) + polish the frontend** so the key flow ships before the
**Saturday investor pitch**. Start with a **mindmap frontend review**.

---

## Shipped to prod this session (2026-06-23)
All on `main` (Vercel auto-deploys). Prod tip: `728925e`.
- **Theme persistence** — marketing landing restores the saved theme on exit (no
  longer strips `data-theme`). ⚠️ Do NOT add a global "sync data-theme to state"
  effect in `lib/theme.tsx` — it overrides the landing's notepad pin and broke
  minds-shift.com once already. The landing is intentionally pinned to notepad.
- **Account dropdown** (`AppHeader.tsx`) — matches Figma `626:9114`: opaque rows
  (cyberpunk black `var(--bg)`, notepad paper), no container frame, "MENU"
  primary trigger. Self-fetches journal counts via `/api/journal-v2/counts`.
- **Anon funnel** — every account-bound dropdown row (Profile, Journal, Mind Map,
  Log-out→Sign-in) routes anon users to sign-in via `goOrSignIn()`. Journal "New"
  still → `/app/onboarding` (the anon vent funnel). We want users onboarded.
- **Pre-save share card** — response screen opens the rich `ShareSheet` (same as
  journal); `ShareSheet.responseId` is now optional.
- **T-018-05 auto-save** — signed-in users auto-save vent + every lens (no button);
  anon Save → sign-in. (`app/app/response/page.tsx`)
- **T-018-04 +lens picker** — `LensPickerSheet` (extracted from `/app/lens`,
  endless carousel, opens on Socrates). "+Lens" on feed card + entry detail →
  generate (tier-enforced) + append + carousel scrolls to the new lens.
  Helper: `lib/add-lens.ts`.

Tabled: T-018-07 Gemini titles (Groq titles are fine). **Model/Gemini tuning is
tabled** — lenses run on Groq and quality is good.

---

## ⚠️ How to ship to prod (the safe process — IMPORTANT)
Prod runs off `main`. The active dev branch `feat/mindmap` has **unshipped
mindmap work**, so DO NOT merge the whole branch. Ship only finished commits:
```
git checkout -b ship/<name> origin/main
git cherry-pick <commit>...          # the finished commits only
npm --prefix V200 run build          # safety gate — must pass
git push origin ship/<name>:main     # clean fast-forward → Vercel deploys
git checkout feat/mindmap && git branch -D ship/<name>
```
Most app files are identical on `main` and `feat/mindmap`, so cherry-picks apply
clean. Never `rm -rf .next` while `npm run dev` is running (corrupts Turbopack
cache → 500s; stop dev first).

## Branch / worktree map
- ONE repo: `github.com/huezokate/mindshift`. `MindShift/` (root) = `feat/mindmap`
  (active app dev). Worktrees: `website/`=`main`, `mindmap/`=`feat/mindmap-flow`.
- `feat/mindmap` is canonical for app work (has migration 005 + the ported
  mindmap frontend + everything above). All `backup/2026-06-22/*` tags preserve
  every old branch tip — nothing is lost.
- Deferred: the monorepo restructure (`apps/web/`) + unifying `main` — AFTER the
  pitch.

---

## ▶ NEXT: Mindmap — review, backend, polish
**Current state:** frontend pages exist but run on **sample/stub data**; schema
migration `005_mindmap.sql` exists; **no mindmap API routes, no real
persistence/generation yet.**
- Pages: `app/app/mindmap/page.tsx` (gate — localStorage stub), `new/page.tsx`
  (WOOP create flow, `SAMPLE_WOOP`), `map/page.tsx` (`SAMPLE_MILESTONES`),
  `reflect/page.tsx` (**tabled — skip**).
- Components: `components/mindmap/{MindmapAreaCard,AreaIcon}.tsx`.
- Lib: `lib/mindmap-areas.ts` (5 life areas). Migration: `supabase/migrations/005_mindmap.sql`.

**Plan (start with a frontend review):**
1. **Frontend review** — open `/app/mindmap`, `/new`, `/map` in all 3 themes;
   note what's solid vs rough vs not-Figma-matched. Decide the minimal shippable
   flow (likely: create via WOOP → generate goals/milestones → view map).
2. **Schema** — read `005_mindmap.sql`; confirm it covers goals / milestones /
   weekly_goals / check-ins with RLS keyed on `user_id` (`requesting_user_id()`).
   Apply via Supabase MCP `apply_migration` if not already on prod DB.
3. **Backend** — add `/api/mindmap/*`: generate (Groq, WOOP input →
   weekly goals + milestones), save, fetch. Mirror the journal API patterns
   (`getSupabaseAdmin()`, `auth()` from `@clerk/nextjs/server`, tier checks).
4. **Wire frontend** — replace `SAMPLE_*` with real fetches; persist on create.
   Account-bound, so behind sign-in (anon dropdown already funnels there).
5. **Polish to Figma** — `get_design_context` per node, tokens only (Figma is the
   bible). Mindmap nodes referenced in `docs/active/SESSION-RECAP-2026-06-05-07.md`
   (e.g. `541:5035` hub, `541:4022/4231` cards, `534:4003` capture page).

**Weekly goals + Monday email** = LAST mindmap phase (Resend, verified
`hello@minds-shift.com`). M5 Sunday-reminder is scaffolded on `feat/mindmap`.
Not needed for the pitch.

## Key facts
- Supabase ref: `wwszertnwbsdwbkzrupk`. Migrations in `V200/supabase/migrations/`.
- AI: lenses on **Groq** (`AI_PROVIDER`); `/api/generate-response` enforces tiers.
- Tiers: anon 3 lenses/day · free 3 quotes/day, 5 lenses/quote · pro unlimited
  (`lib/user-tier.ts`, comp via `comp_users` table, migration 006).
- Figma source of truth — always `get_design_context`, match exactly, tokens only.
- Theme bug (theme-select→onboarding flip): **not chasing** — not reproducing now.
