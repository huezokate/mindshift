# CLAUDE.md

## Project

MindShift — a perspective-shifting app that lets users vent a problem, pick a historical figure "lens", and receive an AI-generated response in that figure's voice. Three visual themes: Cyberpunk, Kawaii, Notepad.

**Domain:** minds-shift.com (production) · localhost:3000 (dev)

## Primary Working Directory

`V200/` — Next.js app. All active development happens here.
Everything in `discovery/` is archived experiments — do not reference or modify those files.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind v4 + CSS custom properties (3 theme token sets) |
| Auth + Billing | Clerk v7 (auth) + Clerk Billing Beta (subscriptions) |
| Database | Supabase (Postgres) |
| AI / Lenses | Google Gemini 2.0 Flash (`@google/generative-ai`) |
| Email | Resend |
| Hosting | Cloudflare Pages |
| DNS | Cloudflare |

## User Tiers

| Tier | Clerk state | Limits |
|---|---|---|
| Anonymous | Not signed in | 3 lenses/day (localStorage) |
| Free | Signed in, plan key `free_user` | 3 quotes/day, 5 lenses/quote (Supabase usage_log) |
| Pro | Signed in, plan key `unlock_all_lenses_monthly` ($8.99/mo) | Unlimited |

Tier logic lives in `V200/src/lib/user-tier.ts`. Usage tracking in `V200/src/lib/usage.ts` + `usage_log` table.

## Design System

Three fully-designed theme systems in Figma — components are complete, screens in progress:
- **Cyberpunk** — neon cyan/green/violet on dark, glitch aesthetics
- **Kawaii** — soft pinks, rounded, playful
- **Notepad** — clean, minimal, paper-like

Figma: https://www.figma.com/design/Mubv0Ghdm2SPxF42JVsX8M/MindShift?node-id=414-4628
Theme tokens live in `V200/src/styles/tokens*.css`. Applied via `data-theme` attribute on `<html>`.

## App Routes

```
/                         Welcome screen + theme switcher
/app/onboarding           Vent input (protected)
/app/lens                 Figure selection (protected)
/app/response             AI response + Save button (protected)
/app/journal              Journal — saved sessions with lens cards (protected)
/(auth)/sign-in           Clerk sign-in
/(auth)/sign-up           Clerk sign-up
/api/generate-response    POST — calls Gemini, enforces tier limits, tracks usage
/api/save-response        POST — upserts vent_session + lens_response to Supabase
/api/journal              GET  — fetches user's sessions + lens responses
/api/send-email           POST — Resend email dispatch
```

Auth middleware lives in `V200/src/proxy.ts` (Next.js 16 uses proxy.ts, not middleware.ts).
All `/app/*` routes are protected — unauthenticated users are redirected to `/sign-in`.

## Supabase Schema

```sql
-- One row per vent session (created on explicit Save)
create table vent_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null,
  vent_text  text not null,
  theme      text not null default 'cyberpunk',
  created_at timestamptz default now()
);

-- One row per lens applied to a session
create table lens_responses (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid not null references vent_sessions(id) on delete cascade,
  user_id       text not null,
  figure_id     text not null,
  response_text text not null,
  created_at    timestamptz default now(),
  unique (session_id, figure_id)
);

-- Daily usage tracking for signed-in users
create table usage_log (
  user_id     text not null,
  date        date not null default current_date,
  quote_count int  not null default 0,
  lens_count  int  not null default 0,
  primary key (user_id, date)
);

-- RLS helper (Clerk JWT sub → user_id)
create or replace function requesting_user_id() returns text
  language sql stable
  as $$ select nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text $$;

-- RLS enabled on all tables, policies restrict to owning user
```

Migration files (run manually in Supabase SQL editor):
- `V200/supabase/migrations/001_journal.sql` — vent_sessions + lens_responses + RLS
- usage_log table added separately (see above SQL)

## Environment Variables

Template: `V200/.env.local.example`. Active: `V200/.env.local`.

```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/app
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/app/onboarding

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google Gemini
GOOGLE_GEMINI_API_KEY=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=hello@mindshift.app

# App
NEXT_PUBLIC_APP_URL=https://minds-shift.com
```

## Key Files

```
V200/src/proxy.ts                              Auth middleware (Clerk, protects /app/*)
V200/src/lib/user-tier.ts                      getUserTier() — anonymous/free/pro
V200/src/lib/usage.ts                          getUsageToday() / trackUsage()
V200/src/lib/supabase.ts                       getSupabase() / getSupabaseAdmin()
V200/src/lib/figures.ts                        Figure definitions + Gemini system prompts
V200/src/lib/theme.tsx                         Theme context + data-theme switching
V200/src/app/api/generate-response/route.ts    Gemini call + tier enforcement + usage tracking
V200/src/app/api/save-response/route.ts        Upsert vent session + lens response
V200/src/app/api/journal/route.ts              Fetch user journal (sessions + responses)
V200/src/app/app/journal/page.tsx              Journal page (server component)
V200/src/components/SessionCard.tsx            Expand/collapse session card (client)
V200/src/components/LensResponseCard.tsx       Lens response sub-card (client)
V200/src/styles/tokens.css                     Cyberpunk theme tokens
V200/src/styles/tokens-kawaii.css              Kawaii theme tokens
V200/src/styles/tokens-notepad.css             Notepad theme tokens
```

## Directory Conventions

```
docs/active/tickets/    Ticket files (markdown with YAML frontmatter)
docs/active/stories/    Story files (same frontmatter pattern)
docs/active/work/       Work artifacts, one subdirectory per ticket ID
discovery/              Archived V1/experimental files — read-only reference
V200/supabase/          SQL migration files (run manually in Supabase SQL editor)
```

---

The RDSPI workflow definition is in docs/knowledge/rdspi-workflow.md and is injected into agent context by lisa automatically.
