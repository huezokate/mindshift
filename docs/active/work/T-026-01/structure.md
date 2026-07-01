# T-026-01 · Structure — File-level blueprint

## Change set overview
| Action | Path | Purpose |
|---|---|---|
| **Create** | `.github/workflows/ci.yml` | The CI pipeline (only functional change) |
| Create | `docs/active/work/T-026-01/*.md` | RDSPI artifacts (this ticket's paper trail) |
| — | `V200/package.json` | **No change** — `test` script already exists (T-025-02) |
| — | `V200/tsconfig.json` | **No change** — `noEmit` already set |
| — | `V200/next.config.ts` | **No change** — keep build behavior == prod |

Exactly **one** file affects runtime behavior: `.github/workflows/ci.yml`. Nothing in
`V200/` source is modified, so there is zero risk to the app itself.

## File: `.github/workflows/ci.yml` (repo root)

### Public interface (what other tickets consume)
- **Workflow display name:** `CI`
- **Job id:** `ci` → GitHub status-check context **`CI / ci`**. This is the stable
  string T-026-02 will list as a required check. Renaming the job later would break
  branch protection — treat `ci` as a contract.

### Internal organization (top → bottom)
```
name: CI
on:
  pull_request:            # default types; all PRs
  push:
    branches: [main]       # post-merge signal on the auto-deploy branch

permissions:
  contents: read           # least privilege

concurrency:
  group: ci-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true # kill superseded runs on same ref

jobs:
  ci:
    name: ci
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: V200   # every `run:` executes inside the app root
    env:                          # dummy PUBLIC placeholders — safe to commit
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: pk_test_ci-placeholder
      NEXT_PUBLIC_SUPABASE_URL: https://ci-placeholder.supabase.co
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ci-placeholder-anon-key
      NEXT_PUBLIC_APP_URL: http://localhost:3000
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: V200/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm run build
      - run: npm test
```

### Step contract (ordered, fail-fast)
1. **checkout** — `actions/checkout@v4`. Fresh tree, no `.next` → no stale
   `tsc` phantom errors.
2. **setup-node** — Node 22; npm cache keyed on `V200/package-lock.json`. The
   `cache-dependency-path` is mandatory because the lockfile is not at repo root
   (default cache lookup would miss it and warn/fail).
3. **`npm ci`** — reproducible install from lockfile (runs in `V200/`).
4. **`npm run lint`** — `eslint` flat config; fastest gate.
5. **`npx tsc --noEmit`** — standalone strict type gate.
6. **`npm run build`** — `next build`; validates the app compiles/prerenders under
   dummy public env.
7. **`npm test`** — `vitest run`; 31 tests today, all in `src/**/*.test.ts`.

Any non-zero exit stops the job (GitHub default), turning the single `CI / ci`
check red — satisfying the "fails the PR when any of lint/tsc/build/test fails"
criterion.

## Ordering of changes
Single atomic addition — no dependency ordering within the ticket. The workflow only
takes effect once the file lands on a branch and a PR/push occurs. No migrations, no
source edits, no coordination with other in-flight tickets (nothing else touches
`.github/`).

## Boundaries / non-goals (owned by sibling tickets)
- **Branch protection / required-check enforcement** → **T-026-02** (consumes the
  `CI / ci` name defined here).
- **Preview-deploy verification gate** → T-026-03.
- **Migration discipline**, **branch hygiene** → T-026-04 / T-026-05.
- This ticket does **not** add Storybook build, e2e, or coverage gates — only the
  four checks the ticket enumerates.

## Rollback
Delete `.github/workflows/ci.yml` (or the whole `.github/` dir). No source or config
depends on it; removal fully reverts CI with no residue.
