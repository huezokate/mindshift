# T-026-04 Structure — Migration Discipline

The blueprint: exact files created / modified, their interfaces, and ordering.
No code here — shapes only.

## File change map

| Action | Path | Purpose |
|---|---|---|
| **create** | `V200/scripts/check-migrations.mjs` | Validator: pure logic + CLI runner |
| **create** | `V200/src/lib/__tests__/check-migrations.test.ts` | Vitest unit tests for the validator |
| **modify** | `V200/package.json` | Add `migrations:check` script |
| **modify** | `.github/workflows/ci.yml` | Add "Validate migrations" step |
| **create** | `docs/knowledge/migration-process.md` | Gated process — source of truth |
| **modify** | `CLAUDE.md` (root) | Replace "apply manually whenever" guidance |

No deletions. No changes to any `.sql` file (legacy drift is out of scope).

---

## 1. `V200/scripts/check-migrations.mjs`

Zero-dependency ESM module, node built-ins only. Two responsibilities, split so
the logic is unit-testable without touching the filesystem or exiting the process.

**Public interface (named exports):**

```
export function validateMigrations(filenames)
  // filenames: string[] (basenames, any order)
  // returns { ok: boolean, count: number, errors: string[] }
  // Pure. No fs, no process.exit. This is what tests import.

export const MIGRATION_NAME_RE  // ^\d{3}_[a-z0-9_]+\.sql$  (exported for tests)
```

**Validation rules inside `validateMigrations` (order of checks):**
1. Empty input → error "no migration files found".
2. Each name must match `MIGRATION_NAME_RE` → per-file "bad-name" error.
3. Extract the 3-digit prefix → int version. Duplicate version across two files
   → "duplicate-version NNN" error.
4. Sorted unique versions must be contiguous from `001` with step 1 → on gap,
   "non-contiguous: expected NNN after MMM" error.
5. `ok = errors.length === 0`; `count = filenames.length`.

**CLI runner (executes only when run as the entry module):**
- Guard: `if (import.meta.url === pathToFileURL(process.argv[1]).href) { … }`.
- Resolve dir: `path.resolve(dirname(fileURLToPath(import.meta.url)),
  '../supabase/migrations')` — independent of cwd (CI runs in `V200/`, devs may
  run from repo root).
- `fs.readdirSync(dir)`, filter to `.sql`, pass to `validateMigrations`.
- Success → `console.log('✓ ' + count + ' migrations, 001..0NN contiguous')`,
  exit 0. Failure → print each error line, `process.exit(1)`.

**Why `.mjs`, not `.ts`:** runs directly under `node` in CI with no build/transpile
step (the CI `Build` step is `next build`, unrelated). Keeping it plain ESM avoids
adding a ts-node/tsx dependency. The *test* is `.ts` (vitest transpiles).

---

## 2. `V200/src/lib/__tests__/check-migrations.test.ts`

Vitest suite. Imports `validateMigrations` from the script via relative path
(`../../../scripts/check-migrations.mjs`). Lives under `src/lib/__tests__/` to
match the existing test convention (research: `chat-prompt.test.ts`,
`response-length.test.ts` are there).

**Cases:**
- happy path: `['001_a.sql','002_b.sql','003_c.sql']` → `ok: true`, count 3.
- real set: `['001_journal.sql', … ,'007_lens_chat.sql']` → `ok: true`.
- bad name: `['001_a.sql','2_b.sql']` → `ok: false`, error mentions `2_b.sql`.
- uppercase / bad chars: `['001_A.sql']` → bad-name.
- duplicate: `['001_a.sql','001_b.sql']` → `ok: false`, "duplicate-version 001".
- gap: `['001_a.sql','003_c.sql']` → `ok: false`, "non-contiguous".
- empty: `[]` → `ok: false`, "no migration files".

Deliberately does **not** read the real dir (keeps the unit test hermetic and
fast); the real-dir check is exercised by the CI step + the real-set case above.

---

## 3. `V200/package.json` (modify)

Add one script (after `test:watch`), no dependency changes:

```
"migrations:check": "node scripts/check-migrations.mjs"
```

Runnable locally and in CI. cwd is `V200/` in both.

---

## 4. `.github/workflows/ci.yml` (modify)

Add a step inside the existing `ci` job (NOT a new job — preserves the `CI / ci`
status-check contract for branch protection, research §5). Placement: after
`Install dependencies`, before `Typecheck` — it is fast, dependency-light
(needs node only), and failing fast on a malformed migration set is desirable.

```
- name: Validate migrations
  run: npm run migrations:check
```

No new secrets, no permissions change. Stays within `working-directory: V200`.

---

## 5. `docs/knowledge/migration-process.md` (create)

The gated process, ~1 page. Sections:
- **Principle** — a migration merges *with* the PR that needs it; files never
  drift ahead of / behind `main`.
- **Authoring** — next contiguous `NNN_name.sql`; additive + `if not exists`;
  RLS + owner policy per new table; `npm run migrations:check` must pass.
- **Applying** — via MCP `apply_migration` (or `supabase db push`) as part of
  releasing the PR; name the applied migration `NNN_name` to match the file.
- **Verifying** — `list_migrations`; confirm the new version is present and
  nothing unexpected changed; record the version in the PR.
- **CI guard** — what `migrations:check` enforces and what it does *not* (it is
  static; it does not talk to the DB).
- **Baseline & known drift** — 007 applied & matching; pointer to `review.md`
  for the pre-existing legacy gaps (untracked 001, fileless `events` /
  `mindmap_milestone_fields`) that are out of scope here.

Lives in `docs/knowledge/` beside `rdspi-workflow.md` (the other durable
process doc).

---

## 6. `CLAUDE.md` root (modify)

Two edits, minimal:
- Line ~129: the migration bullet intro currently reads "apply manually in
  Supabase SQL editor OR via the Supabase MCP `apply_migration`". Rewrite to:
  applied via the gated process in `docs/knowledge/migration-process.md`
  (MCP `apply_migration`, verified against `list_migrations`, tied to the PR).
- Line ~194 (Directory Conventions): "run manually in Supabase SQL editor" →
  "applied via the gated migration process (see docs/knowledge)".

Keep the migration file list itself. Do not touch the V200 `CLAUDE.md` (it has no
migration-application claim to fix).

---

## Ordering of changes (for Implement/commit sequence)

1. `check-migrations.mjs` + test + `package.json` script — the guard, self-contained.
   Commit A. Verify: `npm run migrations:check` passes, `npm test` passes.
2. `ci.yml` step — wires the guard into CI. Commit B.
3. `migration-process.md` + `CLAUDE.md` edits — the documented process. Commit C.

Each commit is independently valid and reviewable. Order matters only in that the
script must exist before CI references it (A before B).

## Interface contracts (stable surfaces)

- `validateMigrations(string[]) → { ok, count, errors }` — consumed by the test
  and the CLI runner. Pure; the contract the tests pin.
- npm script name `migrations:check` — referenced by `ci.yml`. Renaming requires
  updating both.
- CI job name `ci` unchanged — branch-protection contract preserved.
