# T-026-01 · Progress — Implementation

## Status: Implement complete

One functional file added: `.github/workflows/ci.yml` (repo root). No `V200/`
source or config touched.

## Step 1 — Local pre-flight (done)

Ran the exact CI command sequence against **clean committed checkouts** (via a
throwaway git worktree, `npm ci` from the committed lockfile) — not the dirty
working tree — because CI runs against committed code. Results:

| Gate | `main` (9436a37) | branch HEAD (11fc392) |
|---|---|---|
| `npm ci` | ✅ exit 0 | ✅ exit 0 |
| `npm run lint` | ❌ **9 errors**, 13 warnings | ❌ **13 errors**, 14 warnings |
| `npx tsc --noEmit` | ✅ exit 0 | ⚠️ see note |
| `npm run build` (dummy public env only) | ✅ exit 0 | — (main proves secret-free) |
| `npm test` | ❌ **no `test` script** | ✅ 22 passing |

**Build is secret-free (confirmed).** Built `main` under `env -i` with *only* the
four `NEXT_PUBLIC_*` placeholders from Design — exit 0, all routes prerendered.
No real Clerk/Supabase/AI/Stripe/Resend key is needed to build.

**tsc on branch HEAD note:** the failures seen were (a) `.next/types/validator.ts`
phantoms from a *stale* `.next` left by an earlier build in the same worktree —
these **cannot occur in CI** because tsc runs before build on a fresh checkout, so
`tsconfig`'s `.next/types/**` include matches nothing (Design D5); and (b) a real
`Cannot find module '@/components/__fixtures__/journal'` from `*.stories.tsx`
files whose fixture (`V200/src/components/__fixtures__/journal.ts`) is **untracked**
on the branch. That is a pre-existing branch inconsistency owned by the Storybook
tickets (S-023), not this CI ticket. `main` typechecks clean.

## Deviation from Design/Plan (documented, as the workflow requires)

Research/Design **assumed lint was green** ("test gate is green today") and never
ran lint. Pre-flight disproved that: lint has a pre-existing backlog on **every**
branch (9 on `main`, 13 on the feature branch) — set-state-in-effect,
unescaped-entities, unused eslint-disable. A hard lint gate would make the check
**red on a clean branch**, directly violating the acceptance criterion "Green on a
clean branch."

**Decision:** keep `npm run lint` as a **visible but non-blocking** step
(`continue-on-error: true`) with an inline `TODO(T-026)` to flip it to a hard gate
once the backlog is cleared. `tsc`, `build`, and `test` remain **hard gates**. This
is the standard strangler pattern for introducing CI over an existing lint debt: the
gate is present and runs on every PR, but doesn't block on legacy violations. Fixing
9–13 lint errors (several are non-trivial setState-in-effect refactors touching app
source) is out of scope for a CI-infra ticket and would not even touch `main`, which
is where the real backlog lives. Flagged as the #1 open concern in `review.md`.

## Step 2 — Author `.github/workflows/ci.yml` (done)

Written per `structure.md`, with the one deviation above:
- `name: CI`; triggers `pull_request` + `push: [main]`.
- `permissions: contents: read`; `concurrency` with `cancel-in-progress: true`.
- Job `ci` (→ stable check context **`CI / ci`**) on `ubuntu-latest`;
  `defaults.run.working-directory: V200`.
- Job-level dummy public `env` (4 `NEXT_PUBLIC_*` placeholders, no secrets).
- Steps: checkout@v4 → setup-node@v4 (Node 22, npm cache,
  `cache-dependency-path: V200/package-lock.json`) → `npm ci` → **Lint
  (continue-on-error)** → `npx tsc --noEmit` → `npm run build` → `npm test`.

## Step 3 — Validate syntax (done)

- YAML parses (`yaml.safe_load`). `actionlint` not installed locally → validated
  structure against the Actions schema manually: triggers present, job id `ci`,
  `defaults.run.working-directory`, all 7 steps resolve.
- **No `secrets.*` reference anywhere** in the file (grep clean).
- File is at **repo-root** `.github/workflows/ci.yml`, not under `V200/`.

## Commit

Single atomic commit of the workflow file (the only functional change). The RDSPI
docs artifacts under `docs/active/work/T-026-01/` are committed alongside. The large
unrelated dirty working tree (Storybook/mindmap/chat WIP) is intentionally **not**
staged — this ticket touches only CI.

## Not done here (outward actions — handed to `review.md`)

Opening a PR / pushing a deliberately-broken commit to prove the red/green behavior
live on GitHub is an outward action on the user's repo; per Plan it is left as the
manual verification checklist in `review.md`.
