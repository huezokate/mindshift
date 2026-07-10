# T-026-04 Research — Migration Discipline

Descriptive map of the current migration reality. No solutions here.

## 1. What exists on disk

Local migration files live in `V200/supabase/migrations/`, named with a
sequential three-digit prefix (`NNN_snake_name.sql`):

| File | Creates / does |
|---|---|
| `001_journal.sql` | `vent_sessions`, `lens_responses`, `requesting_user_id()`, RLS |
| `002_journal_v2.sql` | privacy/favorites columns, `lens_shares` |
| `003_waitlist.sql` | `citext` email + `source` on `waitlist` |
| `004_entry_titles.sql` | title column on `vent_sessions` |
| `005_mindmap.sql` | `mindmaps`, `mindmap_goals`, `mindmap_milestones`, `mindmap_weekly_goals` |
| `006_comp_users.sql` | `comp_users` (comped Pro allowlist) |
| `007_lens_chat.sql` | `lens_chat_messages` (multi-turn chat, T-020-02) |

Conventions observed:
- Prefix is contiguous `001`…`007`, one concept per file.
- Every file is additive and idempotent-leaning (`create table if not exists`,
  `create index if not exists`). RLS is enabled per table with an owner policy
  keyed on `requesting_user_id()`.
- File header comments say "Run in Supabase SQL editor … or via Supabase MCP."

## 2. What is actually applied to prod (via MCP `list_migrations`)

The live `supabase_migrations.schema_migrations` history on project
`wwszertnwbsdwbkzrupk`, in applied order (version = Supabase CLI timestamp
`YYYYMMDDHHMMSS`, assigned by `apply_migration`, **not** the `NNN_` file prefix):

| # | version | name |
|---|---|---|
| 1 | 20260527044841 | waitlist_citext_and_source  (= file 003) |
| 2 | 20260614200436 | add_title_to_vent_sessions  (= file 004, different name) |
| 3 | 20260615003224 | 004_entry_titles |
| 4 | 20260615063400 | 002_journal_v2 |
| 5 | 20260617034819 | mindmap_005  (= file 005) |
| 6 | 20260619024931 | comp_users  (= file 006) |
| 7 | 20260627064529 | mindmap_milestone_fields  **(no file)** |
| 8 | 20260701074341 | events_behavioral_stream  **(no file)** |
| 9 | 20260701080550 | 007_lens_chat |

## 3. Drift observed (the reason this ticket exists)

The history and the files do **not** cleanly correspond. Concretely:

1. **File with no recorded migration:** `001_journal.sql` is absent from the
   history entirely — the earliest journal tables were applied before the
   migration-tracking table existed (or via raw SQL editor, which does not write
   to `schema_migrations`). The tables (`vent_sessions`, `lens_responses`) do
   exist in prod, so it is applied — just untracked.
2. **Applied migrations with no file:** `mindmap_milestone_fields` and
   `events_behavioral_stream` are live (the `events` table has 15 rows) but have
   **no** counterpart in `V200/supabase/migrations/`. No local file creates the
   `events` table — confirmed by grep.
3. **Name mismatch:** entry-title work is recorded twice-ish —
   `add_title_to_vent_sessions` and `004_entry_titles` — hinting at a re-apply.
4. **Out-of-order application:** `002_journal_v2` (applied 4th) landed *after*
   `004_entry_titles` (applied 3rd). The applied order does not match the file
   prefix order — a direct symptom of ad-hoc "apply whenever" discipline.

Net: 007 (this ticket's baseline) **is** applied and matches its file. But the
overall file-set ⇄ prod-history mapping is lossy. A naive full `db diff`
parity check would light up on all of the above, most of which is legacy noise
rather than actionable drift.

## 4. Live schema snapshot (public tables)

`list_tables` shows 14 public tables, RLS enabled on all:
`waitlist, profiles(0), sessions(0), vent_sessions(18), lens_responses(22),
usage_log(2), lens_shares(3), mindmaps(1), mindmap_goals(1),
mindmap_milestones(4), mindmap_weekly_goals(1), comp_users(3), events(15),
lens_chat_messages(8)`.

`profiles` and `sessions` are empty and have no migration file — likely dead
early-experiment tables, out of scope here but worth noting.

## 5. CI as it stands (from T-026-01)

`.github/workflows/ci.yml` — single `ci` job, `working-directory: V200`,
node 22, steps: install → lint (non-blocking) → `tsc --noEmit` → `next build`
→ `vitest run`. Triggers on every PR and push to `main`.

Constraints this imposes:
- CI runs **inside `V200/`**; any migration-check step must resolve paths from
  there (`supabase/migrations` is `V200/supabase/migrations`).
- CI has **no** Supabase secrets — only dummy `NEXT_PUBLIC_*` placeholders. No
  `SUPABASE_ACCESS_TOKEN`, service-role key, or DB URL. Least-privilege
  `contents: read`. A CI step that talks to the live DB is therefore not free —
  it needs new secrets and network access.
- The job name `ci` is a stable status-check contract for branch protection
  (T-026-02). Adding a step inside the existing job keeps that contract; adding
  a new job would introduce a new required check.

## 6. Tooling reality

- **No `supabase/config.toml`** — the repo is not linked as a Supabase CLI
  project. `supabase/` contains only `migrations/`.
- Local files use `NNN_` prefixes, **not** the CLI's `YYYYMMDDHHMMSS_` format.
  `supabase migration list` / `db diff` key off timestamp versions, so they
  would not cleanly reconcile against these filenames without a rename +
  history-repair pass.
- `package.json` scripts: `dev/build/start/lint/test/test:watch/storybook`.
  No `scripts/` directory exists yet (root or `V200/`). Vitest is the test
  runner. Node 22.15.1 local, node 22 in CI.
- `@google/generative-ai`, Clerk, Supabase JS present; no migration/DB-CI deps.

## 7. Docs that assert the current (bad) norm

- Root `CLAUDE.md:129` — "apply manually in Supabase SQL editor OR via the
  Supabase MCP `apply_migration`" and `:194` — "run manually in Supabase SQL
  editor". These sentences are the documented policy the ticket wants replaced.
- File header comments ("Run in Supabase SQL editor after 00X") echo the same.

## 8. Assumptions & constraints for later phases

- Ticket explicitly forbids a "full migration-tooling rewrite" — so renaming
  every file to CLI timestamp format or repairing `schema_migrations` history is
  **out of scope**. Preserve the `NNN_` convention.
- A full live-DB parity gate in CI is heavy (secrets, linking) and, given the
  legacy drift in §3, noisy. The ticket frames it as "if feasible / informational
  / documented pre-merge check" — i.e. optional.
- The cheap, high-value guard the ticket leads with is **filename sequence /
  duplicate / ordering validation** over the files — pure static analysis, no DB,
  no secrets. That is the realistic CI gate.
- "Parity baseline" (AC #4) is satisfiable *by documentation*: record that 007 is
  applied and matches, and honestly log the pre-existing legacy drift so it is
  not silently claimed as clean.
