# T-026-05 · Plan — Branch Hygiene Cleanup

Ordered, independently-verifiable steps. Each mutating step names its verification
and its rollback. "Record SHA" steps write to `progress.md` as the executable
safety net the ticket requires.

## Step 0 — Snapshot & safety net (no mutation)

- Capture tip SHAs of every branch to be renamed or deleted:
  `STALE-feat/mindmap`, `origin/feat/mindmap`, `origin/feat/landing-figure-vent`,
  `origin/feat/website`, `origin/landing-only`.
- Write them into `progress.md` under "Recovery SHAs" **before** anything changes.
- **Verify:** all five SHAs present and non-empty in `progress.md`.
- **Rollback:** n/a.

## Step 1 — Rename the trap branch (local, working-tree-safe)

- `git branch -m STALE-feat/mindmap feat/storybook`
- **Verify:** `git rev-parse --abbrev-ref HEAD` → `feat/storybook`;
  `git rev-parse feat/storybook` == recorded STALE SHA (`11fc392`); working tree
  still dirty with the same pre-existing changes (nothing clobbered).
- **Rollback:** `git branch -m feat/storybook STALE-feat/mindmap`.
- Commit: none (ref-only).

## Step 2 — Back up the Storybook suite to origin (additive)

- `git push -u origin feat/storybook`
- **Verify:** `git ls-remote --heads origin feat/storybook` returns the SHA;
  `origin/feat/storybook` now shows 25 storybook files
  (`git ls-tree -r origin/feat/storybook | grep -c storybook`).
- **Rollback:** `git push origin --delete feat/storybook` (only if aborting whole
  ticket).
- **Gate:** Steps 3.d depends on this succeeding.

## Step 3 — Delete dead / duplicated remote branches (verified)

Each substep: re-confirm 0-unique **at delete time**, then delete.

- 3.a `git push origin --delete feat/landing-figure-vent`
- 3.b `git push origin --delete feat/website`
- 3.c `git push origin --delete landing-only`
- 3.d `git push origin --delete feat/mindmap`  *(only after Step 2 green)*
- **Per-branch precheck:** `git cherry main origin/<b> | grep -c '^+'` == 0 for
  3.a–3.c; for 3.d confirm its 2 commits' content is on `main` (mindmap files
  present) **and** Step 2 backup exists.
- **Verify:** `git ls-remote --heads origin` no longer lists the four branches.
- **Rollback:** `git push origin <b> <recorded-SHA>:refs/heads/<b>`.

## Step 4 — Enable auto-delete head branches (prevention)

- `gh repo edit huezokate/mindshift --delete-branch-on-merge`
- **Verify:** `gh repo view --json deleteBranchOnMerge` → `true`.
- **Rollback:** `gh repo edit huezokate/mindshift --delete-branch-on-merge=false`.

## Step 5 — Document the convention

- Write `docs/BRANCHING.md` (naming, lifecycle, auto-delete note, forward-link to
  T-026-02 PR flow).
- **Verify:** file exists, renders, names `feat/*` `fix/*` `chore/*` `archive/*`
  and explicitly retires `STALE-*`.
- **Rollback:** `git rm docs/BRANCHING.md`.

## Step 6 — Prune stale local remote-tracking refs

- `git remote prune origin` (drops now-dangling `origin/feat/website` etc. locally).
- **Verify:** `git branch -r` no longer lists the deleted remotes.
- **Rollback:** n/a (re-fetch reconstructs).

## Step 7 — Commit the documentation artifact

- Stage **only** `docs/BRANCHING.md` and `docs/active/work/T-026-05/*` (NOT the
  pre-existing unrelated working-tree changes).
- `git commit -m "chore(branches): document naming convention + T-026-05 hygiene"`
  on `feat/storybook`.
- **Verify:** `git show --stat HEAD` lists only the intended files.
- **Rollback:** `git reset --soft HEAD~1`.

## Testing strategy

No unit/integration tests — this ticket produces no runtime code. Verification is
**state-assertion** at each step (ref existence, SHA equality, `gh` setting,
file tree contents). The acceptance criteria map to checks:

| AC | Verification |
|---|---|
| Unmerged work salvaged or dropped-with-note | Step 2 (Storybook pushed) + `review.md` disposition table |
| `STALE-*` / dead branches removed | Steps 1, 3 verifies |
| Merged PR branches auto-delete | Step 4 verify (`deleteBranchOnMerge=true`) |
| Naming convention documented | Step 5 verify (`docs/BRANCHING.md`) |
| No uniquely-held commit lost | Step 0 SHA log + Step 2 backup + per-delete precheck |

## Risk register

- **R1 – losing Storybook:** mitigated by Step 2 preceding Step 3.d + Step 0 SHA.
- **R2 – clobbering in-flight uncommitted changes:** mitigated by rename-not-switch
  and selective staging in Step 7.
- **R3 – outward-facing remote deletes:** authorized by ticket + each gated on a
  0-unique proof and a recorded re-push SHA.
- **R4 – deleting something Kate wanted:** `v200`/`archive/*`/`gh-pages`
  deliberately excluded and handed off, not deleted.
