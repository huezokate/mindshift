# T-026-04 Design — Migration Discipline

Grounded in `research.md`. Decides *what* to build and *why*, given the drift in
§3 and the CI/tooling constraints in §5–§6.

## Problem restated

Migrations are applied ad-hoc (SQL editor / MCP, "whenever"), with nothing
verifying the file set is well-formed or that it matches prod. Result: untracked
files, applied-but-fileless migrations, and out-of-order application (research §3).
We want guardrails **without** a migration-tooling rewrite.

The three sub-goals from the ticket map to three deliverables:
1. **CI guard** — fail on obviously-broken migration file sets.
2. **Parity check** — confirm files match live schema (as feasible).
3. **Documented gated process** — replace "apply manually whenever".

---

## Deliverable 1 — CI guard (the cheap, high-value core)

### Options

**A. Static filename validator (Node script, no deps, no DB).**
Parse `V200/supabase/migrations/*.sql`, enforce: valid `NNN_name.sql` shape,
unique version prefixes, contiguous ascending sequence (no gaps, no dupes,
sorted). Exit non-zero with a clear message on violation. Wire as one CI step.

**B. Live-DB diff gate (`supabase db diff` in CI).**
Link the project in CI, diff files vs prod, fail on divergence.

**C. Shell one-liner in the workflow YAML.**
`ls | sort | uniq -d`-style check inlined in `ci.yml`.

### Decision: **A**

- Directly satisfies AC #1 ("CI fails on bad ordering / duplicate version") using
  only static analysis — no secrets, no network, no `config.toml`. Fits the
  no-secrets CI (research §5) and the "keep it lightweight" instruction.
- **B rejected as the gate:** research §6 — files use `NNN_` prefixes, prod uses
  timestamp versions, and there is real legacy drift (§3). `db diff` would fail
  or spam noise on day one, needs `SUPABASE_ACCESS_TOKEN` + linking, and violates
  "no full rewrite." Parity is better handled as documentation/informational
  (Deliverable 2).
- **C rejected:** a real script is testable (vitest), gives readable errors, and
  is reusable locally (`npm run migrations:check`). YAML shell is unreviewable and
  untestable. The logic (contiguity, dup detection) is more than a one-liner
  should carry.

### Shape of the guard

- Location: `V200/scripts/check-migrations.mjs` (ESM, zero deps, node built-ins
  only — `fs`, `path`, `url`). Resolves the migrations dir relative to its own
  location so cwd doesn't matter.
- Rules, each producing a specific error:
  1. **bad-name** — file not matching `^\d{3}_[a-z0-9_]+\.sql$`.
  2. **duplicate-version** — two files share a `NNN` prefix.
  3. **non-contiguous** — sorted versions must be `001,002,…` with no gap
     (catches a skipped number, which usually means a lost/misnamed file).
  4. **(sanity)** — directory exists and is non-empty.
- Output: on success, prints `✓ N migrations, 001..NNN contiguous`. On failure,
  prints every violation and `process.exit(1)`.
- npm script: `"migrations:check": "node scripts/check-migrations.mjs"`.
- CI: a new **step** inside the existing `ci` job (preserves the `CI / ci`
  status-check contract for branch protection, research §5). Placed early
  (before build) since it's fast and dependency-free — fail fast on a bad set.

### Rejected scope (documented, not built)

"PR adds schema-touching code without a migration file" — the ticket marks this
*optional*. It requires heuristics over the diff (what counts as schema-touching?)
and is prone to false positives. Out of scope; noted as a future enhancement.

---

## Deliverable 2 — Parity check

### Decision: **documented MCP/CLI procedure, not an automated CI gate.**

Rationale from research §3/§5/§6: automating a live parity gate needs new secrets
and would surface pre-existing legacy drift as failures. Instead:

- The gated process (Deliverable 3) includes a concrete verify step: after
  applying a migration, run MCP `list_migrations` (or `supabase migration list`)
  and confirm the new version appears and no unexpected drift was introduced.
- We record the **baseline** now (AC #4): `007_lens_chat` is applied
  (version `20260701080550`) and matches its file. We also honestly log the
  legacy drift (§3) in `review.md` so "in parity" is not overclaimed — the
  baseline is "007 clean; known legacy gaps documented, not regressions."

This keeps parity *repeatable and verifiable* without a heavy, noisy CI job.

---

## Deliverable 3 — Documented gated process

### Decision: a dedicated process doc + updated CLAUDE.md pointers.

- New doc `docs/knowledge/migration-process.md` — the single source of truth for
  how a migration is authored, applied, and verified, tied to merging its PR.
  Sits alongside `rdspi-workflow.md` in the knowledge dir.
- The rule set:
  1. Author `NNN_name.sql` with the next contiguous prefix; additive + guarded
     (`if not exists`), RLS + owner policy per new table.
  2. `npm run migrations:check` passes locally (also enforced in CI).
  3. Apply via **MCP `apply_migration`** (or `supabase db push`) **as part of
     releasing the PR** — not "whenever". Name the migration to match the file
     (`NNN_name`) so history and files line up going forward.
  4. Verify with `list_migrations`: the new version is present; nothing else
     changed. Record the version in the PR.
  5. Never let files drift ahead of / behind `main`: a migration merges *with*
     the code that depends on it.
- Update root `CLAUDE.md:129` and `:194` (and the migration bullet list) to
  replace "apply manually in Supabase SQL editor whenever" with a pointer to the
  gated process. Keep MCP `apply_migration` as the sanctioned apply mechanism —
  the sin was "whenever / by hand with no verification", not the tool.

### Rejected

- Adopting full Supabase CLI migrations (timestamp renames + history repair):
  explicitly out of scope ("without a full migration-tooling rewrite").
- Fixing the legacy drift (backfilling `001`, adding files for `events` /
  `mindmap_milestone_fields`): tempting but out of scope for this ticket, which is
  about *process guardrails going forward*. Logged as follow-up in `review.md`.

---

## Testing strategy (previewing Plan)

- Unit-test `check-migrations.mjs` logic with vitest: export a pure
  `validateMigrations(filenames: string[])` returning `{ ok, errors }`; test the
  happy path and each violation (bad name, dup, gap, empty). The CLI wrapper just
  calls it against the real dir and sets the exit code.
- Manual: run `npm run migrations:check` against the real dir → expect pass
  (001..007 contiguous). Temporarily perturb to see it fail, then revert.

## Summary of choices

| Sub-goal | Chosen | Rejected |
|---|---|---|
| CI guard | Static Node validator + CI step + vitest | `db diff` gate, YAML one-liner |
| Parity | Documented MCP verify + recorded baseline | Automated live-DB CI gate |
| Process | `migration-process.md` + CLAUDE.md update | Full CLI rewrite, drift backfill |
