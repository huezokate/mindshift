# T-026-01 · Plan — Implementation steps

## Strategy
One functional file to add. The risk isn't writing YAML — it's proving the pipeline
is **green on clean** and **red on breakage** without leaning on secrets. Steps are
ordered so each is independently verifiable; local pre-flight mirrors what CI will do
so we don't burn PR cycles discovering failures.

## Step 1 — Local pre-flight of every CI command (in `V200/`)
Reproduce the exact CI sequence locally to confirm the app is green today:
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`  (temporarily with **only** the dummy public env from Design, to
  prove no real secret is needed — e.g. run in a clean env with just the four
  `NEXT_PUBLIC_*` placeholders)
- `npm test`  (already confirmed: 31 passing)

**Verify:** all four exit 0. If `next build` fails on missing Clerk/public env,
capture the exact var name and add it to the workflow `env` block. If lint/tsc
surface pre-existing errors in the dirty working tree, note them — CI runs against
committed code, so scope to what's on the branch being pushed.
**Commit:** none (investigation only).

## Step 2 — Author `.github/workflows/ci.yml`
Write the file exactly as blueprinted in `structure.md`:
- `name: CI`; triggers `pull_request` + `push: [main]`.
- `permissions: contents: read`; `concurrency` with `cancel-in-progress`.
- Job `ci` on `ubuntu-latest`; `defaults.run.working-directory: V200`.
- Job-level dummy public `env` (4 `NEXT_PUBLIC_*` placeholders).
- Steps: checkout@v4 → setup-node@v4 (Node 22, npm cache, `cache-dependency-path:
  V200/package-lock.json`) → `npm ci` → `npm run lint` → `npx tsc --noEmit` →
  `npm run build` → `npm test`.

**Verify (static):**
- File is at **repo-root** `.github/workflows/ci.yml` (not under `V200/`).
- YAML parses (lint with a YAML parser / `python -c yaml.safe_load` or `actionlint`
  if available).
- Job id is `ci` (stable check name for T-026-02).
- No `secrets.*` reference anywhere.
**Commit:** `ci: add GitHub Actions pipeline (lint/tsc/build/test) [T-026-01]`.

## Step 3 — Validate the workflow syntax
- If `actionlint` is available locally, run it against the file. Otherwise do a
  YAML-load sanity check and a manual review against the GitHub Actions schema
  (keys: `on`, `jobs.<id>.steps[].uses/run`, `defaults.run.working-directory`).
**Verify:** no syntax/schema errors.
**Commit:** fold any fixes into Step 2's commit if not yet pushed, else a follow-up.

## Testing strategy
- **Unit tests:** none to add — the change is infra, not app code. The pipeline's own
  `npm test` step exercises the existing 31 tests.
- **Integration / behavioral proof (acceptance criteria):** the pipeline itself is
  verified by *running it on GitHub*. Because pushing branches/opening PRs is an
  outward action, the plan **stops at committing the file** and documents the manual
  verification the human (or a follow-up) performs:
  1. Push a branch, open a PR against `main` → confirm a **CI** run appears showing
     lint/typecheck/build/test steps. *(AC #1)*
  2. On a throwaway PR, push a deliberately broken commit (e.g. a TS error or a
     failing assertion) → confirm the **CI** check goes red at the offending step.
     *(AC #2)*
  3. Confirm clean branch → green, and runtime is reasonable with npm cache warm.
     *(AC #3)*
  4. Confirm no secrets configured are required for the green build. *(AC #4)*
  5. Confirm the check context is named `CI / ci` for use in branch protection.
     *(AC #5)*
- These live-GitHub steps are **not executed automatically** by this ticket
  (they require pushing/opening PRs on the user's repo). They are recorded in
  `review.md` as the handoff verification checklist.

## Verification criteria (definition of done for the artifact)
- `.github/workflows/ci.yml` exists at repo root, valid YAML, job id `ci`.
- Every command in the workflow passes locally under dummy-public env (Step 1).
- No `secrets.*` in the file; only non-secret `NEXT_PUBLIC_*` placeholders.
- `review.md` records the live-PR verification checklist for the human.

## Rollback / risk
- Rollback = delete the file. Zero coupling to app source.
- Main residual risk: `next build` needing an env var not anticipated. Mitigated by
  Step 1's clean-env local build; any gap is fixed by adding a **public** placeholder
  (never a real secret).

## Commit sequence (atomic)
1. `ci: add GitHub Actions pipeline (lint/tsc/build/test) [T-026-01]` — the workflow
   file (+ any dummy-env adjustment discovered in Step 1).
