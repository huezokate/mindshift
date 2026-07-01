# T-026-01 · Design — GitHub Actions CI Pipeline

## Goal
One workflow, `.github/workflows/ci.yml`, that runs **lint → typecheck → build →
test** on `pull_request` and `push` to `main`, green on a clean branch, red on any
failure, secret-free, with a **stable check name** T-026-02 can require.

## Resolved research questions
1. **Lockfile:** `V200/package-lock.json` is committed (383 KB, tracked). → `npm ci`
   and `actions/setup-node` npm caching are both valid. Cache key path =
   `V200/package-lock.json`.
2. **Secrets:** All runtime clients read env lazily; only Clerk touches env at build
   (SSG prerender + `<ClerkProvider>`). → supply **dummy public placeholders** in the
   job `env`, no real `secrets.*`.
3. **Type gate:** run standalone `npx tsc --noEmit` (ticket preference) rather than
   trusting `next build`'s bundled check.

---

## Key decisions & rationale

### D1 — Workflow location: repo root, steps in `V200/`
GitHub only discovers workflows under **repo-root `.github/workflows/`**; a file
under `V200/.github/` would never run. Steps target the app via a job-level
`defaults.run.working-directory: V200`, so each `run:` executes inside `V200/`
without repeating `cd`. `actions/checkout` and `setup-node` cache path still use
the repo-relative `V200/...` path.

### D2 — Single job, ordered steps (not a matrix, not parallel jobs)
**Chosen:** one job `ci` with sequential steps: checkout → setup-node → `npm ci` →
lint → tsc → build → test.
- **Why:** Ticket wants "a single required status check … so T-026-02 can gate merges
  on it by name." A single job yields exactly one check context named after the job.
- **Rejected — matrix over Node versions:** multiplies check names
  (`ci (20)`, `ci (22)`), complicating branch protection, and the app targets one
  Node (22). No compatibility matrix is needed.
- **Rejected — separate parallel jobs per step** (lint job, build job, …): faster
  wall-clock but produces 4 check contexts and re-runs `npm ci`/build setup 4×
  (build already compiles everything). For a solo project the simplicity and single
  stable check name win. Can split later if runtime hurts.

### D3 — Step ordering: lint → tsc → build → test
Cheapest/most-localized feedback first. Lint (~seconds) and `tsc --noEmit` fail fast
on the most common breakages before the expensive `next build`. Test runs last (it's
fast here, but logically gates on a compiling app). Every step uses default
fail-fast (`npm ci` etc. are separate steps, so the job stops at the first red).

### D4 — Node 22 + npm cache via `actions/setup-node@v4`
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 22
    cache: npm
    cache-dependency-path: V200/package-lock.json
```
Matches local `v22.15.1`. `cache-dependency-path` is required because the lockfile
is in a subdirectory, not repo root. `npm ci` for reproducible installs from the
lockfile.

### D5 — Standalone `tsc --noEmit` for the type gate
`package.json` has no `typecheck` script; add step `npx tsc --noEmit`. `tsconfig`
already has `noEmit: true`. Risk: `tsconfig.include` lists `.next/types/**` — on a
fresh CI checkout `.next` does not exist, so no stale-validator phantom errors (the
ticket's worry only bites when a dirty `.next` lingers, which never happens in CI).
`skipLibCheck: true` keeps it fast. No config change needed.

### D6 — `next build` kept as its own step, secret-free
Provide dummy public env at the job level so SSG prerender + `<ClerkProvider>` don't
throw on a missing publishable key:
```yaml
env:
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: pk_test_ci-placeholder
  NEXT_PUBLIC_SUPABASE_URL: https://ci-placeholder.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ci-placeholder-anon-key
  NEXT_PUBLIC_APP_URL: http://localhost:3000
```
These are non-secret placeholders (safe to commit). No `CLERK_SECRET_KEY`,
Supabase service role, AI, Stripe, or Resend keys — none are read at build. If a
future build step demands a real secret, that's a signal to make the code lazier,
not to add secrets to CI.

### D7 — Avoid double-lint cost (accept, don't over-engineer)
`next build` runs its own ESLint pass by default, duplicating the explicit `lint`
step. Options: (a) leave both — extra ~seconds, clearer failure attribution;
(b) set `eslint.ignoreDuringBuilds`/`typescript.ignoreBuildErrors` in
`next.config.ts` to make build faster and let the dedicated steps own those gates.
**Chosen (a):** do not touch `next.config.ts` in this ticket — keep the build's
behavior identical to prod (Vercel builds the same way). The dedicated `lint`/`tsc`
steps give better failure messages; the duplication is cheap. Revisit only if
runtime becomes a problem.

### D8 — Triggers: `pull_request` + `push` to `main`
```yaml
on:
  pull_request:
  push:
    branches: [main]
```
`pull_request` (default types: opened/synchronize/reopened) gives PR checks;
`push: main` gives post-merge signal on the branch that auto-deploys. Add
`concurrency` to cancel superseded runs on the same ref and save minutes.

### D9 — Permissions & hygiene
`permissions: contents: read` (least privilege — no write needed). `concurrency`
group per workflow+ref with `cancel-in-progress: true`.

---

## Chosen shape (summary)
- File: `.github/workflows/ci.yml`
- `name: CI`, one job **`ci`** (→ check context "CI / ci", stable for T-026-02)
- `runs-on: ubuntu-latest`, `defaults.run.working-directory: V200`
- Steps: checkout → setup-node(22, npm cache) → `npm ci` → `npm run lint` →
  `npx tsc --noEmit` → `npm run build` → `npm test`
- Job-level dummy public `env`; no secrets.

## Rejected alternatives (recap)
- Multi-version Node matrix → extra check names, no benefit.
- Parallel per-check jobs → 4 contexts + redundant installs.
- Editing `next.config.ts` to skip build-time lint/tsc → out of scope, diverges from
  prod build behavior.
- Putting the workflow under `V200/.github/` → never discovered by GitHub.

## Verification of acceptance criteria (how Plan will prove it)
- PR against `main` shows lint/typecheck/build/test → single "CI" run with those
  steps visible.
- Deliberately broken commit on a throwaway PR → job red (verified per step).
- Clean branch → green; npm cache keeps runtime reasonable.
- No secrets required for core checks (dummy public env only).
- Stable check name `CI / ci` usable in branch protection.
