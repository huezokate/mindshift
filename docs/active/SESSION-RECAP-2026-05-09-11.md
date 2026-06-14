# MindShift — Session Recap (May 9–11 2026)

## What the app is

MindShift lets users vent a problem, pick a historical figure "lens" (e.g. Socrates, Tesla), and get an AI-generated response in that figure's voice. Three visual themes: Cyberpunk (default), Kawaii, Notepad.

**Live at:** https://minds-shift.com  
**Repo:** https://github.com/huezokate/mindshift  
**Branch:** `main` (auto-deploys to Vercel)  
**Local dev:** `cd Documents/projects/MindShift/V200 && npm run dev` → localhost:3000  
**Stack:** Next.js 16 · Clerk v7 · Supabase · Google Gemini 2.0 Flash · Cloudflare DNS · Vercel

---

## What we built this session (V300)

### 1. Save + Journal flow (S-016)
- `POST /api/save-response` — upserts a `vent_sessions` row + `lens_responses` row in Supabase. Idempotent: passing `sessionId` adds a new lens to an existing session instead of duplicating the vent.
- `GET /api/journal` — fetches all sessions + nested lens responses for the current user.
- `/app/journal` — server component, auth-gated. Shows sessions as expand/collapse cards (`SessionCard.tsx`). Each expanded session shows `LensResponseCard.tsx` for each lens applied.
- Response page: Save button writes `ms_session_id` to sessionStorage on success. "View journal" button added. "New session" clears the session ID.

### 2. User tiers (3 types)

| Tier | Clerk state | Limits |
|---|---|---|
| Anonymous | Not signed in | 1 vent/day, 3 lenses per vent (localStorage) |
| Free | Signed in, plan `free_user` | 3 vents/day, 5 lenses per vent (Supabase usage_log) |
| Pro | Plan `unlock_all_lenses_monthly` ($8.99/mo) | Unlimited |

- `src/lib/user-tier.ts` — `getUserTier()` server helper, returns `{ tier, userId }`
- `src/lib/usage.ts` — `getUsageToday()` / `trackUsage()` against `usage_log` Supabase table
- `POST /api/generate-response` — checks tier limits before calling Gemini, tracks usage after
- Anonymous limits enforced client-side in `lens/page.tsx` via localStorage keys: `ms_anon_date`, `ms_anon_vent_key`, `ms_anon_vent_lenses`

### 3. Auth banner
- `src/components/AuthBanner.tsx` — themed card shown above the Clerk sign-in/sign-up component
- Reads `?reason=` URL param and shows context-specific messaging:
  - `lenses_limit` → "You've applied 3 lenses. Create a free account for 5 per vent."
  - `vents_limit` → "You've used your free vent for today. Free account = 3/day."
  - `save` → "Save this perspective to your journal."
  - `journal` → "Your journal is waiting."
- Both `/sign-in` and `/sign-up` pages use it.

### 4. Middleware fix
- Next.js 16 uses `src/proxy.ts` NOT `src/middleware.ts` — having both crashes the server.
- Only `/app/journal` is auth-gated. All other `/app/*` routes (onboarding, lens, response) are public so anonymous users can use the core flow.

### 5. Deployment
- Deployed to **Vercel** (auto-deploys on push to `main`)
- Custom domain **minds-shift.com** via Cloudflare DNS (CNAME records, proxy OFF)
- Gemini API needed to be manually enabled in Google Cloud Console for the project

---

## Supabase schema (all tables live in production)

```
vent_sessions   — one row per vent (created on explicit Save)
lens_responses  — one row per lens applied, FK to vent_sessions, unique(session_id, figure_id)
usage_log       — daily quota tracking per user (quote_count, lens_count)
waitlist        — email collection only, not yet wired to any UI
profiles        — exists but unused; no Clerk webhook yet
```

RLS is enabled on all tables. Helper function `requesting_user_id()` extracts Clerk `sub` from JWT.

---

## Key files to know

```
src/proxy.ts                              Auth middleware (Next.js 16 — NOT middleware.ts)
src/lib/user-tier.ts                      getUserTier() — tier + limits
src/lib/usage.ts                          daily quota read/write
src/lib/supabase.ts                       getSupabase() / getSupabaseAdmin()
src/lib/figures.ts                        Figure definitions + Gemini system prompts
src/app/api/generate-response/route.ts    Gemini call + tier enforcement
src/app/api/save-response/route.ts        Upsert vent + lens
src/app/api/journal/route.ts              Fetch journal
src/app/app/journal/page.tsx              Journal (server component)
src/components/SessionCard.tsx            Expand/collapse session card
src/components/LensResponseCard.tsx       Lens sub-card with avatar
src/components/AuthBanner.tsx             Benefits banner on sign-in/sign-up
src/styles/tokens.css                     Cyberpunk theme tokens
src/styles/tokens-kawaii.css              Kawaii tokens
src/styles/tokens-notepad.css             Notepad tokens
```

---

## Known issues / next up

- UI and user flow bugs noted on prod but not yet triaged (Kate working on these)
- `profiles` table in Supabase is empty — no Clerk webhook set up yet to sync user data
- `waitlist` table exists but no UI form wired to it yet
- Git committer name shows machine hostname — cosmetic, doesn't affect anything
- Gemini API is live in prod; if it goes down check Google Cloud Console → Gemini API enabled status

---

## How to run locally

```bash
cd Documents/projects/MindShift/V200
npm run dev
# → http://localhost:3000
```

Env vars live in `V200/.env.local`. Never commit this file.
