# T-026-01 · Research — GitHub Actions CI Pipeline

## Ticket in one line
Add the first CI pipeline: a `.github/workflows/ci.yml` that runs lint, typecheck,
build, and test on every PR and on push to `main`, gated so it can later become a
required status check (T-026-02).

## Repository layout (relevant boundaries)
- **Repo root:** `/Users/KaterinaHuezo/Documents/projects/MindShift` — git repo,
  remote `origin = github.com/huezokate/mindshift.git`. Default branch `main`
  (auto-deploys to prod via Vercel).
- **App root:** `V200/` — the Next.js app. **All build/lint/test commands must run
  with `V200/` as the working directory.**
- `.github/` does **not exist yet** anywhere in the repo — this ticket creates it.
  GitHub Actions requires workflows at **repo-root** `.github/workflows/`, *not*
  under `V200/`. Only the *steps* run inside `V200/` (via `working-directory` or
  `cd`).
- `discovery/` — archived experiments, out of scope.

## Toolchain / versions
- Local Node `v22.15.1`, npm `10.9.2`. Ticket specifies **Node 22** for CI.
- `V200/package.json` (`name: mindshift-v200`, `private: true`) scripts:
  - `dev`, `build` → `next build`, `start`
  - `lint` → `eslint` (flat config, eslint v9)
  - `test` → `vitest run`  ✅ (S-025/T-025-02 already landed — a real test script exists)
  - `test:watch`, `storybook`, `build-storybook`
- Key deps: `next 16.2.4`, `react 19.2.4`, `@clerk/nextjs ^7`, `@supabase/supabase-js`,
  `stripe`, `resend`, `@google/generative-ai`, `@anthropic-ai/sdk`.
- Dev/test: `eslint ^9`, `eslint-config-next 16.2.4`, `typescript ^5.9.3`,
  `vitest ^4.1.9`, `vite ^8`, Storybook 10.
- **No `package-lock.json` was observed at the app root** — must confirm before
  relying on `npm ci` + npm cache (see Open Questions). A lockfile is required for
  both `npm ci` and `actions/setup-node` npm caching.

## Config files (present in `V200/`)
- `next.config.ts` — only configures remote image patterns (figma). No env-gated
  build behavior, no `output`/standalone, no `eslint`/`typescript` build-ignore
  flags. So **`next build` runs its own ESLint + TS checks by default** unless
  disabled — relevant to avoid double-linting cost.
- `eslint.config.mjs` — flat config: `core-web-vitals` + `typescript` presets;
  globally ignores `.next/`, `out/`, `build/`, `next-env.d.ts`.
- `tsconfig.json` — `strict: true`, `noEmit: true`, `moduleResolution: bundler`,
  path alias `@/* → ./src/*`, includes `.next/types/**/*.ts`. The `noEmit` +
  `next` plugin means `npx tsc --noEmit` is a clean standalone type gate. Note the
  ticket's caution about the stale `.next/types` validator error — `tsc` includes
  `.next/types/**`, so a stale `.next` could inject phantom errors; a clean
  checkout (no `.next`) avoids this.
- `vitest.config.ts` — node environment, `include: ['src/**/*.test.ts']`, no jsdom,
  no plugins. Explicitly documented as CI's entry point via `npm test`. Isolated
  from `.storybook/main.ts`.

## Env / secrets exposure at build time
Critical for "no reliance on secrets for core checks":
- `src/lib/supabase.ts` — `createClient(...)` reads env **inside functions**
  (`getSupabase`, `getSupabaseAdmin`), lazy. Not evaluated at build/import.
- `src/lib/ai.ts` — reads `AI_PROVIDER`, `GROQ_API_KEY`, `GOOGLE_GEMINI_API_KEY`
  inside functions. Lazy.
- `src/lib/stripe.ts` — lazy `getStripe()`, **but** module-level
  `export const PRICE_ID = process.env.STRIPE_PRICE_ID!` (non-null assert only —
  reads `undefined`, does not throw).
- `src/lib/resend.ts` — lazy client; module-level `FROM` has a default.
- **Clerk is the real build-time risk:** `src/app/layout.tsx` wraps the tree in
  `<ClerkProvider>` (line 125), and `src/proxy.ts` uses `clerkMiddleware`. Clerk
  reads `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` from env. During `next build` static
  prerendering, a missing publishable key can throw "Missing publishableKey".
  Middleware is compiled but not executed at build, so `CLERK_SECRET_KEY` is not
  needed to build. → CI likely needs **dummy `pk_test_` / public placeholders**,
  never real secrets.
- `.env.local` exists locally and is git-ignored; **CI has no `.env.local`**, so
  the workflow must supply any build-required public env inline.

## Current green-state evidence
- `npm test` → **3 files, 31 tests, all passing** (171ms). The test gate is green today.
- Tests: `src/lib/__tests__/{response-length,chat-types,chat-prompt}.test.ts` — pure
  string-shaping helpers, no network/env.
- Working tree is **not clean** (many M/?? entries from Storybook + chat work), but
  that is unrelated to adding a workflow file.

## Naming / branch-protection dependency (T-026-02)
- T-026-02 will gate merges on this check **by name**. The GitHub "status check"
  name is derived from the **job name** (and workflow name for display). Must pick a
  stable, singular job id/name (e.g. job `ci`) so T-026-02 can reference it.
- A matrix would multiply check names (one per matrix leg) — the ticket prefers a
  single required check or a *small* matrix. Node-only single job keeps one stable
  check name.

## Assumptions & constraints
- Workflow file lives at repo root `.github/workflows/ci.yml`; steps `cd V200`.
- Node 22 via `actions/setup-node@v4`, `cache: npm`, `cache-dependency-path:
  V200/package-lock.json`.
- Build must be secret-free → provide dummy public env, no `secrets.*` for core job.
- `main` is protected-in-intent but not yet enforced (that's T-026-02).

## Open questions (resolved in Design)
1. Is there a committed `package-lock.json` in `V200/`? Needed for `npm ci` + cache.
2. Does `next build` succeed with only dummy public Clerk env? (Design chooses the
   safe placeholder-env approach.)
3. Run `tsc` separately vs. rely on `next build`'s bundled check? (Ticket prefers
   standalone clean `tsc`.)
