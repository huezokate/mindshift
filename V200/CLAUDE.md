@AGENTS.md

# MindShift V200

Next.js 16 App Router · TypeScript · Tailwind v4 · Clerk v7 · Supabase v2 · Stripe v22 · Resend v6 · Anthropic SDK · Framer Motion

## Design System

Cyberpunk theme. All tokens live in `src/styles/tokens.css` — use CSS custom properties (`var(--cyan)`, `var(--bg-card)`, etc.), never hardcode hex values.

Font stack: `--font-mono` (Courier New) for body, `--font-alumni` (Alumni Sans SC) for headings.

## Key Patterns

- Supabase: use `getSupabase()` / `getSupabaseAdmin()` from `src/lib/supabase.ts` (lazy factory)
- Stripe: use `getStripe()` from `src/lib/stripe.ts`
- Resend: use `getResend()` from `src/lib/resend.ts`
- Auth: `await auth()` from `@clerk/nextjs/server` in server components/routes
- Utility: `cn()` from `src/lib/utils.ts` for conditional class merging

## Routes

| Route | Purpose |
|---|---|
| `/` | Public landing page |
| `/sign-in` `/sign-up` | Clerk auth (cyberpunk styled) |
| `/app/onboarding` | Vision wizard (protected) |
| `/app/mindmap` | Mind map canvas (protected) |
| `/app/lens` | Figure selection (protected) |
| `/app/response` | AI response view (protected) |
| `POST /api/generate-response` | Claude API call |
| `POST /api/send-email` | Resend email |
| `POST /api/webhook/stripe` | Stripe webhook |

## Figma Reference

Design file: https://www.figma.com/design/Mubv0Ghdm2SPxF42JVsX8M/MindShift?node-id=414-4628
