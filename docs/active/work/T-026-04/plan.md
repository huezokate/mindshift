# T-026-04 Plan — Migration Discipline

Ordered, independently-verifiable steps. Maps 1:1 to the structure blueprint.
Three atomic commits (A, B, C).

## Step 1 — Validator script  → Commit A

**Do:**
- Create `V200/scripts/check-migrations.mjs`:
  - `export const MIGRATION_NAME_RE = /^\d{3}_[a-z0-9_]+\.sql$/`.
  - `export function validateMigrations(filenames)` — pure, returns
    `{ ok, count, errors }`, implementing rules 1–5 from structure §1.
  - CLI runner behind the `import.meta.url === pathToFileURL(argv[1])` guard;
    resolves `../supabase/migrations` from the script's own dir; reads `.sql`
    files; prints result; `process.exit(1)` on failure.
- Add `"migrations:check": "node scripts/check-migrations.mjs"` to
  `V200/package.json` scripts.

**Verify:**
- `cd V200 && npm run migrations:check` → prints `✓ 7 migrations, 001..007
  contiguous`, exit 0.
- Negative check (manual, revert after): temporarily `cp 007_lens_chat.sql
  009_x.sql` → run → expect non-contiguous failure + exit 1 → delete the temp file.

**Commit A:** `feat(T-026-04): add static migration-set validator + npm script`

## Step 2 — Unit tests  → part of Commit A

**Do:**
- Create `V200/src/lib/__tests__/check-migrations.test.ts` per structure §2:
  happy path, real 001..007 set, bad-name, uppercase, duplicate, gap, empty.
  Import `validateMigrations` from `../../../scripts/check-migrations.mjs`.

**Verify:**
- `cd V200 && npm test` → all suites green, including the new file. Confirms the
  script is importable from a `.ts` test (ESM interop OK under vitest).

**Rationale for folding into Commit A:** the script and its test are one unit;
committing the guard without its test would leave a half-verified surface.

## Step 3 — CI wiring  → Commit B

**Do:**
- Edit `.github/workflows/ci.yml`: insert step after `Install dependencies`,
  before `Typecheck`:
  ```
  - name: Validate migrations
    run: npm run migrations:check
  ```

**Verify:**
- `grep -n "Validate migrations" .github/workflows/ci.yml` present.
- YAML sanity: the step sits under the existing `ci` job with correct indentation
  (2-space list item under `steps:`), inherits `working-directory: V200`.
- No new secrets/permissions added (diff review).

**Commit B:** `ci(T-026-04): fail CI on malformed migration set`

## Step 4 — Process doc  → Commit C

**Do:**
- Create `docs/knowledge/migration-process.md` per structure §5 (Principle,
  Authoring, Applying, Verifying, CI guard, Baseline & known drift).

**Verify:**
- Doc references the real script/command names (`migrations:check`,
  `apply_migration`, `list_migrations`) and the `NNN_name.sql` convention.
- Baseline line records 007 = version `20260701080550`, applied & matching.

## Step 5 — CLAUDE.md update  → part of Commit C

**Do:**
- Edit root `CLAUDE.md`:
  - Migration bullet intro (~L129): "apply manually in Supabase SQL editor OR
    via the Supabase MCP `apply_migration`" → gated-process pointer.
  - Directory Conventions (~L194): "run manually in Supabase SQL editor" →
    "applied via the gated migration process (see docs/knowledge/…)".

**Verify:**
- `grep -n "apply manually\|run manually in Supabase SQL editor" CLAUDE.md` →
  no stale "whenever/manually" phrasing remains (or only inside the new pointer
  context).
- Link target `docs/knowledge/migration-process.md` exists.

**Commit C:** `docs(T-026-04): gated migration process + CLAUDE.md update`

## Step 6 — Parity baseline confirmation  → recorded in review.md (no commit of its own)

**Do:**
- Already gathered in Research via MCP `list_migrations`: 007 (`20260701080550`)
  is the latest applied migration and matches `007_lens_chat.sql`.
- Record in `review.md`: baseline = "007 applied & matching"; enumerate the
  known legacy drift (untracked 001, fileless `events` /
  `mindmap_milestone_fields`, out-of-order history) as **pre-existing, out of
  scope, follow-up** — so parity is not overclaimed.

**Verify:** AC #4 met (baseline confirmed), with honest drift disclosure.

---

## Testing strategy summary

| Layer | What | How |
|---|---|---|
| Unit | `validateMigrations` logic | vitest suite (7 cases), hermetic (no fs) |
| Integration | real dir passes | `npm run migrations:check` locally + in CI |
| Regression | guard actually fails | manual perturb-and-revert in Step 1 |
| Parity | 007 applied & matches | MCP `list_migrations` (done in Research) |
| Docs | process is followable | grep for real command/file names |

## Acceptance-criteria trace

- **AC1** (CI fails on bad ordering / duplicate) → Steps 1–3.
- **AC2** (documented repeatable apply-tied-to-PR + parity verify) → Steps 4, 6.
- **AC3** (CLAUDE.md guidance updated) → Step 5.
- **AC4** (current state in-parity baseline) → Step 6.

## Risks / watch-items

- ESM `.mjs` import from a vitest `.ts` file: vitest handles ESM natively; if the
  import path errors, fall back to importing via the file URL. Confirm in Step 2.
- Contiguity rule assumes no intentional gaps. The current set (001..007) is
  contiguous, so this is safe today; documented in the process doc so future
  authors know not to skip numbers.
- CI step placement before `Typecheck` means a bad migration set blocks the whole
  job early — intended (fail fast, cheap signal first).
