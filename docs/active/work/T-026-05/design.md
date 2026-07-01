# T-026-05 · Design — Branch Hygiene Cleanup

Decisions, grounded in `research.md`. The central reframe from Research: the
branch named `STALE-feat/mindmap` is **not** stale — it is the only home of the
Storybook suite (25 files, ~13 commits, no remote backup). The ticket's stated
plan ("salvage mindmap M1/M5 + docs, delete STALE") is based on an assumption
Research disproved: M1/M5 are already on `main`; the real treasure is Storybook.
The design corrects for that.

## Guiding principles

1. **Non-destructive-first.** Prefer rename/backup over delete. The top
   acceptance criterion is *no unmerged work lost*; every irreversible step is
   gated behind a proof that its content survives elsewhere.
2. **Back up before you burn.** Nothing with unique content is deleted until that
   content exists on a second ref (a pushed remote branch). Record every deleted
   tip SHA for reflog/re-push recovery.
3. **Execute the provably-safe; document the judgment calls.** Deletions of
   0-unmerged branches are mechanical. Anything requiring Kate's taste (self-merge
   policy, retiring `v200`) is documented, not executed.

## Decision 1 — STALE-feat/mindmap: **rename, don't delete**

The ticket offers "rename **or** delete." Delete is wrong here (loses Storybook).
Rename satisfies the "stop being a trap" AC while preserving 100% of the work and
is working-tree-safe (`git branch -m` doesn't touch the index/worktree, so the
in-flight uncommitted changes are untouched).

- Rename `STALE-feat/mindmap` → **`feat/storybook`** (accurate to bucket-B
  content; drops the misleading `STALE-` prefix; conforms to `feat/*` convention).
- **Push** the renamed branch to `origin/feat/storybook` so the Storybook suite
  gains a remote backup (additive, low-risk) — this is the "salvage onto a fresh
  branch" AC, and it *unblocks* deleting `origin/feat/mindmap` later.

Rejected — *delete STALE outright*: violates the no-loss AC (Storybook is
remote-less). Rejected — *cherry-pick the 13 storybook commits onto a fresh
`main`-based branch*: 13-commit replay across a 32/41 divergence invites conflicts
and is strictly more fragile than renaming the branch that already holds them.
Rejected — *open a PR to merge Storybook into `main` now*: out of scope (that's a
T-023/T-025 concern) and `main`'s PR gate (T-026-02) isn't in place; salvage ≠
ship.

## Decision 2 — Fully-merged remotes: **delete (verified)**

`origin/feat/landing-figure-vent`, `origin/feat/website`, `origin/landing-only`
each have **0** unmerged patch-ids and their content is on `main`. Delete via
`git push origin --delete`, recording each tip SHA first. Recoverable by
re-pushing the SHA; the SHAs are logged in `progress.md`.

Rejected — *keep them "just in case"*: they are the literal clutter the ticket
targets; 0-unmerged + content-on-main is as safe as a delete gets.

## Decision 3 — `origin/feat/mindmap`: **delete after Storybook is backed up**

Holds only M1 (`e839caa`) + M5 (`50e0dad`), both with content on `main`. It is
also what STALE tracked, so it's entangled with the trap. Once `feat/storybook` is
pushed (Decision 1), nothing unique remains on it → delete, SHA recorded.

Sequencing matters: this delete **must come after** the `feat/storybook` push,
never before. Encoded as an ordered step in `plan.md`.

## Decision 4 — Retained branches: **keep, document why**

- `origin/archive/home-tangle` (46) — `archive/*` is a deliberate retention
  namespace; keeping it is *consistent with* the convention we're documenting.
- `origin/gh-pages` (1) — machine-managed GitHub Pages deploy branch; never
  hand-deleted.
- `origin/v200` (57) — historical migration snapshot. Retiring it is a judgment
  call (is the pre-migration history worth keeping?) → **document as an open
  decision for Kate**, do not auto-delete. Recommendation: rename to
  `archive/v200` in a follow-up so it reads as intentional.
- `feat/mindmap-flow` (18) + `origin/feat/mindmap-flow` — genuinely unmerged UI
  work in an active worktree → keep untouched.
- `feat/analytics-events` (1) — genuinely unmerged S-019 analytics in an active
  worktree → keep untouched. (Already conforms to `feat/*`.)

## Decision 5 — Prevention: auto-delete + documented convention

- **Auto-delete head branches on merge:** flip to `true` via
  `gh repo edit huezokate/mindshift --delete-branch-on-merge`. Reversible,
  authenticated, directly satisfies the AC.
- **Naming convention doc:** create **`docs/BRANCHING.md`** — a standalone,
  forward-compatible home for the convention + branch lifecycle. Chosen over
  editing a T-026-02 file (doesn't exist yet; `depends_on: []` forbids assuming
  it) and over `CONTRIBUTING.md` at repo root (this project keeps process docs
  under `docs/`). T-026-02 can later link its PR-flow section here. Convention:
  `feat/*`, `fix/*`, `chore/*` (+ retained `archive/*`); short-lived, branch off
  `main`, delete on merge; no long-lived `STALE-*`/personal branches.

## Scope boundary — what this pass executes vs. hands off

**Executed autonomously** (safe/verified/authorized by the ticket):
rename+push STALE→feat/storybook; delete 4 provably-dead remotes
(landing-figure-vent, website, landing-only, feat/mindmap after backup); toggle
auto-delete-on-merge; write `docs/BRANCHING.md`.

**Handed off to Kate** (judgment / out-of-scope): retiring `origin/v200`;
self-merge review policy (T-026-02); actually merging the salvaged `feat/storybook`
into `main`. Documented in `review.md`.

Every deletion is preceded by a recorded SHA (reflog/re-push safety net), directly
honoring the ticket's "git cherry / reflog as the safety net" instruction.
