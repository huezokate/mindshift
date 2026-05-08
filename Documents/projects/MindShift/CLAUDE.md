# CLAUDE.md

## Project

MindShift — a perspective-shifting app that lets users vent a problem, pick a historical figure "lens", and receive an AI-generated response in that figure's voice. Three visual themes: Cyberpunk, Kawaii, Notepad.

## Primary Working Directory

`V200/` — Next.js app. All active development happens here.
Everything in `discovery/` is archived experiments — do not reference or modify those files.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router, TypeScript) |
| Styling | Tailwind + CSS custom properties (3 theme token sets) |
| Auth + Billing | Clerk (auth) + Clerk Billing Beta (subscriptions — no Stripe) |
| Database | Supabase (Postgres) |
| AI / Lenses | Google Vertex AI — Gemini 2.0 Flash |
| Email | Resend |
| Hosting | Google Cloud Run (containerized, auto-scales to zero) |
| Container Registry | Google Artifact Registry |

## Design System

Three fully-designed theme systems in Figma — components are complete, screens in progress:
- **Cyberpunk** — neon cyan/green/violet on dark, glitch aesthetics
- **Kawaii** — soft pinks, rounded, playful
- **Notepad** — clean, minimal, paper-like

Figma: https://www.figma.com/design/Mubv0Ghdm2SPxF42JVsX8M/MindShift?node-id=414-4628
Theme tokens live in `V200/src/styles/tokens*.css`. Applied via `data-theme` attribute on `<html>`.

## App Routes (V200)

```
/                       Welcome screen + theme switcher
/app/onboarding         Vent input (user writes their problem)
/app/lens               Figure selection carousel
/app/response           AI response in chosen figure's voice
/app/mindmap            Mind map canvas (coming later)
/(auth)/sign-in         Clerk sign-in
/(auth)/sign-up         Clerk sign-up
/api/generate-response  POST — calls Gemini, returns figure response
/api/send-email         POST — Resend email dispatch
```

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

# Google Vertex AI
GOOGLE_GEMINI_API_KEY=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=hello@mindshift.app

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## GCP Setup (for reference)

- Project: connect via `gcloud auth login` + `gcloud config set project <PROJECT_ID>`
- Gemini calls go via `@google/generative-ai` SDK using `GOOGLE_GEMINI_API_KEY`
- Deployment: `docker build → Artifact Registry push → Cloud Run deploy`
- Cloud Run service has env vars set directly in the service config (not committed)

## Supabase Schema (target)

```sql
-- Users are managed by Clerk; user_id = Clerk userId
create table perspectives (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  vent_text text not null,
  figure_id text not null,
  response_text text not null,
  theme text not null,
  created_at timestamptz default now()
);

create table journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  perspective_id uuid references perspectives(id),
  note text,
  created_at timestamptz default now()
);
```

## Key Files

```
V200/src/app/api/generate-response/route.ts   AI lens call (Gemini)
V200/src/lib/figures.ts                        Figure definitions + system prompts
V200/src/styles/tokens.css                     Cyberpunk tokens (default)
V200/src/styles/tokens-kawaii.css              Kawaii tokens
V200/src/styles/tokens-notepad.css             Notepad tokens
V200/src/lib/theme.tsx                         Theme context + data-theme switching
```

## Directory Conventions

```
docs/active/tickets/    Ticket files (markdown with YAML frontmatter)
docs/active/stories/    Story files (same frontmatter pattern)
docs/active/work/       Work artifacts, one subdirectory per ticket ID
discovery/              Archived V1/experimental files — read-only reference
```

---

The RDSPI workflow definition is in docs/knowledge/rdspi-workflow.md and is injected into agent context by lisa automatically.
