# T-026-04 Review — Migration Discipline

Handoff document. What changed, how it was verified, and what a human reviewer
should know. Read alongside the PR diff.

## What changed

Guardrails around Supabase migrations — a static CI gate plus a documented,
PR-tied apply process — without a migration-tooling rewrite (per the ticket).

### Created

| Path | What |
|---|---|
| `V200/scripts/check-migrations.mjs` | Zero-dep node validator. Pure `validateMigrations(filenames)` + CLI runner that scans `V200/supabase/migrations/`. |
| `V200/src/lib/__tests__/check-migrations.test.ts` | 8 vitest cases pinning the validator's contract. |
| `docs/knowledge/migration-process.md` | The gated process (author → validate → apply-with-PR → verify) + parity baseline + legacy-drift log. |

### Modified

| Path | What |
|---|---|
| `V200/package.json` | Added `"migrations:check": "node scripts/check-migrations.mjs"`. |
| `.github/workflows/ci.yml` | Added a **Validate migrations** step in the `ci` job (after Install, before Lint). |
| `CLAUDE.md` (root) | Replaced "apply manually in Supabase SQL editor whenever" (L129 + L194) with a pointer to the gated process. |

No `.sql` files touched; no deletions; no new dependencies or CI secrets.

### Commits

- **A** `feat(T-026-04): add static migration-set validator + npm script`
- **B** `ci(T-026-04): fail CI on malformed migration set`
- **C** `docs(T-026-04): gated migration process + CLAUDE.md update`

## What the validator enforces

Over `V200/supabase/migrations/*.sql`, statically (no DB):
1. Filename matches `^\d{3}_[a-z0-9_]+\.sql$` (lowercase snake, 3-digit prefix).
2. No duplicate version prefix.
3. Contiguous sequence from `001` (no gaps).

Empty dir or unreadable dir → failure. Exit 1 with per-problem messages on any
violation; exit 0 + `✓ N migrations, 001..0NN contiguous` on success.

## Test coverage

- **Unit (vitest, hermetic):** happy path, real `001..007` set (order-independent),
  bad filename, uppercase, duplicate version, sequence gap, empty set, and the
  exported regex anchoring. 8/8 pass.
- **Integration:** `npm run migrations:check` against the real dir → pass
  (`001..007`). Manual perturb (temp `009_temp.sql`) → non-contiguous failure,
  exit 1; reverted and re-verified.
- **Regression:** full suite `npm test` → **39/39 pass** across 4 files;
  `tsc --noEmit` clean. The `.mjs`↔`.ts` ESM import works under vitest with no
  extra config.

Gap: the CLI runner's fs/exit branch is not unit-tested (it's a thin wrapper);
it is exercised by the integration run + the CI step instead. Acceptable — the
pure logic is where the risk is, and it is covered.

## Acceptance criteria

| AC | Status | Evidence |
|---|---|---|
| CI fails on bad ordering / duplicate version | ✅ | validator + CI step; negative test exit 1 |
| Documented repeatable apply-tied-to-PR + parity verify | ✅ | `migration-process.md` §1–4 |
| CLAUDE.md guidance updated | ✅ | L129/L194 rewritten; grep shows no stale phrasing |
| Current state in-parity baseline | ✅ (with caveat) | 007 applied `20260701080550`, matches file |

## Open concerns / flag for human attention

1. **Pre-existing legacy drift (NOT introduced here, out of scope).** MCP
   `list_migrations` revealed the file set and prod history do not cleanly
   correspond:
   - `001_journal.sql` is applied but has no `schema_migrations` row (predates
     tracking).
   - `mindmap_milestone_fields` (`20260627064529`) and `events_behavioral_stream`
     (`20260701074341`, creates the `events` table, 15 rows) are applied with
     **no migration file** in the repo.
   - History is partly out of order vs file prefixes; entry-title work is
     recorded twice.
   The baseline is therefore "**007 clean; known legacy gaps documented**", not
   "everything matches". This is logged honestly in `migration-process.md` so it
   is not silently overclaimed. **Recommend a follow-up ticket** to backfill the
   two missing files and decide whether to reconcile history.

2. **Also empty/orphan tables** `profiles` and `sessions` (0 rows, no migration
   file) — likely dead early experiments. Worth a cleanup decision, out of scope.

3. **Contiguity rule assumes no intentional gaps.** True today (`001..007`).
   Documented in the process doc so authors don't skip numbers. If a number ever
   must be retired, the rule (and this doc) needs revisiting.

4. **Parity is not auto-gated in CI** — by design (no secrets, avoids noise from
   the legacy drift above). It relies on the documented `list_migrations` verify
   step at apply time. If drift prevention needs to be enforced rather than
   trusted, a future ticket could add a linked `supabase db diff` job once the
   legacy history is reconciled.

## Out of scope (deliberately not done)

- Migrating to Supabase CLI timestamp-versioned migrations / linking a
  `config.toml` (would be the "full rewrite" the ticket excludes).
- The optional "PR adds schema code without a migration" heuristic (false-positive
  prone; noted as future in `design.md`).
- Fixing the legacy drift itself.
