@AGENTS.md

# Minds Shift V200

Next.js 16 App Router · TypeScript · Tailwind v4 · Clerk v7 · Clerk Billing Beta · Supabase v2 · Resend v6 · Framer Motion · Google Gemini 2.0 Flash

## Design System

Three themes: cyberpunk (default), kawaii, notepad. All tokens live in `src/styles/tokens*.css` — use CSS custom properties (`var(--cyan)`, `var(--bg)`, etc.), never hardcode hex values.

Font stack: `--font-mono` (Courier New) for body, `--font-alumni` (Alumni Sans SC) for headings.

## Key Patterns

- Supabase: use `getSupabase()` / `getSupabaseAdmin()` from `src/lib/supabase.ts`
- Auth: `await auth()` from `@clerk/nextjs/server` in server components/routes
- User tier: `await getUserTier()` from `src/lib/user-tier.ts` — returns `{ tier, userId }`
- Usage tracking: `getUsageToday(userId)` / `trackUsage(userId, isNewQuote)` from `src/lib/usage.ts`
- Resend: use `getResend()` from `src/lib/resend.ts`
- Utility: `cn()` from `src/lib/utils.ts` for conditional class merging
- Middleware: `src/proxy.ts` (Next.js 16 uses proxy.ts — do NOT create middleware.ts)

## User Tiers & Plan Keys (Clerk Billing)

| Tier | Plan key | Limits |
|---|---|---|
| Anonymous | (not signed in) | 3 lenses/day via localStorage |
| Free | `free_user` | 3 quotes/day, 5 lenses/quote |
| Pro | `unlock_all_lenses_monthly` | Unlimited |

Check tier server-side: `const { tier, userId } = await getUserTier()`
Check pro client-side: `useUser()` + check `has({ plan: 'unlock_all_lenses_monthly' })`

## Routes

Marketing landing at apex (`minds-shift.com/`), product at subdomain (`app.minds-shift.com/app/*`). `src/proxy.ts` enforces host-aware redirects between the two.

| Route | Purpose | Auth |
|---|---|---|
| `/` | Marketing landing + waitlist signup (Supabase anon insert) | none |
| `/sign-in` `/sign-up` | Clerk auth | none |
| `/app/onboarding` | Vent input | anon-friendly (free tier) |
| `/app/lens` | Figure selection | anon-friendly |
| `/app/response` | AI response + Save button | anon-friendly |
| `/app/theme-select` | Theme picker | anon-friendly |
| `/app/journal` | Saved journal — server component | **Clerk-protected** |
| `POST /api/generate-response` | Gemini call + tier enforcement + usage tracking | server-checked |
| `POST /api/save-response` | Upsert vent_session + lens_response | server-checked |
| `GET /api/journal` | Fetch sessions + lens_responses for user | server-checked |
| `POST /api/send-email` | Resend email dispatch | Clerk-protected |
| `POST /api/webhook/stripe` | Stripe billing webhook | sig-verified |

Only `/app/journal` requires Clerk sign-in. Everything else in `/app/*` is anon-friendly (the free tier). The root `CLAUDE.md` has more on host routing + the full domain split.

## Figma Reference

Design file: https://www.figma.com/design/Mubv0Ghdm2SPxF42JVsX8M/MindShift?node-id=414-4628
