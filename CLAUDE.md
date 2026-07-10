# CLAUDE.md

## Project

Minds Shift — a perspective-shifting app that lets users vent a problem, pick a historical figure "lens", and receive an AI-generated response in that figure's voice. Three visual themes: Cyberpunk, Kawaii, Notepad.

**Domains:** `minds-shift.com` (marketing landing) · `app.minds-shift.com` (the product) · `localhost:3000` (dev — no host split locally)

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
| Hosting / deploys | Vercel, auto-deploys from GitHub `main` (the full deploy stack is GitHub → Vercel; backend is Supabase + Clerk) |
| Domain | Purchased at Cloudflare (registrar ONLY — not part of the stack; no Pages/Workers/proxy). DNS records point to Vercel and must stay DNS-only/gray-cloud: enabling the CF proxy breaks Vercel SSL |
| Email (receive) | iCloud+ Custom Email Domain — `kate@`, `hello@`, `test@minds-shift.com` |
| Email (send) | Resend, verified domain, `hello@minds-shift.com` from-address |

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

Marketing landing at apex, product at subdomain. Host routing is enforced by `V200/src/proxy.ts`:

- `minds-shift.com/` → marketing landing (waitlist form posts directly to Supabase via anon-insert RLS)
- `minds-shift.com/app/*` → 308 redirect to `app.minds-shift.com/app/*`
- `minds-shift.com/sign-in` and `/sign-up` → 308 redirect to subdomain (so Clerk flows happen on the app host)
- `app.minds-shift.com/` → 308 redirect to `/app/onboarding`
- Localhost / Vercel preview hosts skip the redirects (exact-match on prod hostnames only)

| Path | Purpose | Auth |
|---|---|---|
| `/` | Marketing landing + waitlist signup | none |
| `/app/onboarding` | Vent input | anon-friendly (free tier) |
| `/app/lens` | Figure selection | anon-friendly |
| `/app/response` | AI response + Save button | anon-friendly |
| `/app/theme-select` | Theme picker | anon-friendly |
| `/app/journal` | Saved sessions with lens cards | **Clerk-protected** |
| `/sign-in`, `/sign-up` | Clerk auth | none |
| `POST /api/generate-response` | Gemini call + tier enforcement + usage tracking | server-checked |
| `POST /api/save-response` | Upsert vent_session + lens_response | server-checked |
| `GET /api/journal` | Fetch user's sessions + lens responses | server-checked |
| `POST /api/send-email` | Resend email dispatch | Clerk-protected |
| `POST /api/webhook/stripe` | Stripe billing webhook | sig-verified |

**Only `/app/journal` requires sign-in.** Anon users can vent → pick lens → see response → screenshot (the "free tier"); journaling requires sign-in because it persists to Supabase keyed on user_id. The CLAUDE.md previously claimed all `/app/*` were protected — that was always wrong.

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

-- Public waitlist signup (marketing landing). Anon-insert allowed; reads blocked.
create extension if not exists citext;
create table waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      citext not null unique,
  source     text,
  created_at timestamptz not null default now()
);
alter table waitlist enable row level security;
create policy "waitlist_anon_insert" on waitlist for insert with check (true);
```

**Supabase project ref:** `wwszertnwbsdwbkzrupk` (one project on the account).

Migrations follow the **gated process** in `docs/knowledge/migration-process.md` —
authored as the next contiguous `NNN_name.sql`, validated by `npm run
migrations:check` (also a CI gate), applied via the Supabase MCP `apply_migration`
as part of releasing the PR that needs them, and verified against
`list_migrations`. Do NOT apply migrations by hand in the SQL editor "whenever" —
that is what caused the historical drift documented in the process doc.

Migration files:
- `V200/supabase/migrations/001_journal.sql` — vent_sessions + lens_responses + RLS
- `V200/supabase/migrations/002_journal_v2.sql` — privacy, favorites, share log
- `V200/supabase/migrations/003_waitlist.sql` — citext email + source upgrade on existing waitlist table
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
RESEND_FROM_EMAIL=hello@minds-shift.com

# Clerk webhook (welcome email on user.created — not yet wired)
CLERK_WEBHOOK_SIGNING_SECRET=

# App (note the subdomain — used to build canonical app links from emails, landing CTA, etc.)
NEXT_PUBLIC_APP_URL=https://app.minds-shift.com
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
V200/supabase/          SQL migration files (applied via the gated process — see docs/knowledge/migration-process.md)
```

---

The RDSPI workflow definition is in docs/knowledge/rdspi-workflow.md and is injected into agent context by lisa automatically.
