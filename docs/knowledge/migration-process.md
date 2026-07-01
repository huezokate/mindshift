# Migration Process (Gated)

The rule set for changing the MindShift Supabase schema. It replaces the old
"apply manually in the SQL editor whenever" norm, which produced real drift
(see [Baseline & known drift](#baseline--known-drift)).

Supabase project ref: `wwszertnwbsdwbkzrupk`. Migration files live in
`V200/supabase/migrations/`, named `NNN_snake_name.sql` with a contiguous
three-digit prefix.

## Principle

**A migration merges with the PR that needs it.** Schema files never drift ahead
of or behind `main`: the SQL that a code change depends on lands in the same PR
and is applied when that PR is released — not earlier, not "sometime later".

## 1. Author

- Create the **next contiguous** file: `NNN_name.sql` where `NNN` is one more than
  the current highest prefix (e.g. after `007_lens_chat.sql`, the next is `008_`).
  No gaps, no duplicates, no re-used numbers.
- Keep it **additive and idempotent-leaning**: `create table if not exists`,
  `create index if not exists`, `insert … on conflict do nothing`. Avoid
  destructive `drop`/`alter` unless truly required.
- For every new table: `enable row level security` and add an owner policy keyed
  on `requesting_user_id()`, mirroring the existing journal tables.
- Add a header comment describing what the migration does and its dependencies.

## 2. Validate (local + CI)

Run the static guard before committing:

```
cd V200 && npm run migrations:check
```

It enforces the `NNN_name.sql` convention, unique version prefixes, and a
contiguous sequence from `001`. The same check runs in CI (`.github/workflows/
ci.yml` → **Validate migrations** step), so a malformed set fails the PR.

The guard is **static** — it reads filenames only. It does **not** talk to the
database and does not verify SQL correctness or live parity. Those are steps 3–4.

## 3. Apply (tied to the PR release)

Apply via the **Supabase MCP `apply_migration`** (or `supabase db push` if using
the CLI) as part of releasing the PR:

- Name the applied migration to **match the file** (`NNN_name`) so the
  `schema_migrations` history and the files line up going forward. (Historically
  they diverged — see below.)
- Do this once, at release, from a single sanctioned path. Do **not** paste SQL
  into the dashboard SQL editor ad-hoc — that path does not record to
  `schema_migrations` and is how untracked migrations happened.

## 4. Verify parity

After applying, confirm with the MCP `list_migrations` (or
`supabase migration list`):

- The new version appears as the latest applied migration.
- Nothing unexpected changed. Optionally spot-check with `list_tables`.
- Record the applied version in the PR description (e.g. "applied as
  `20260701080550_007_lens_chat`").

This is the repeatable parity check. A full automated `supabase db diff` gate in
CI is intentionally **not** used: it needs secrets/linking and, given the legacy
drift below, would produce noise rather than signal. Parity is verified by this
documented step at apply time.

## CI guard summary

| Enforced by `migrations:check` (CI) | NOT enforced (manual discipline) |
|---|---|
| `NNN_name.sql` filename convention | SQL correctness / does it run |
| Unique version prefixes | Live-DB parity (step 4 covers this) |
| Contiguous sequence, no gaps | "schema code without a migration" |

## Baseline & known drift

**Baseline (T-026-04):** `007_lens_chat.sql` is applied to prod as version
`20260701080550` and matches its file. The file set `001..007` is contiguous and
passes `migrations:check`. This is the clean baseline going forward.

**Pre-existing legacy drift** (recorded so it is not silently claimed as clean;
out of scope for T-026-04, which adds *forward* guardrails):

- `001_journal.sql` is applied to prod (its tables exist) but has **no**
  `schema_migrations` row — it predates migration tracking.
- Two applied migrations have **no file**: `mindmap_milestone_fields`
  (`20260627064529`) and `events_behavioral_stream` (`20260701074341`, creates
  the `events` table).
- The applied history is partly out of order vs the file prefixes (e.g.
  `002_journal_v2` was applied after `004_entry_titles`), and entry-title work
  appears twice (`add_title_to_vent_sessions` + `004_entry_titles`).

These are consequences of the old ad-hoc process. Reconciling them (backfilling
files, repairing history, or migrating to CLI timestamp versions) is a separate
follow-up, not part of this ticket. From now on, the process above keeps files
and history in step.
