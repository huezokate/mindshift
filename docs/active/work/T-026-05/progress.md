# T-026-05 · Progress — Branch Hygiene Cleanup

## Recovery SHAs (safety net — captured before any mutation)

Re-push a deleted remote with:
`git push origin <SHA>:refs/heads/<branch>`

| Ref | Tip SHA (full) | Disposition |
|---|---|---|
| `STALE-feat/mindmap` | `11fc392100fa3f8ded3a629733872071cee9e8ad` | renamed → `feat/storybook` |
| `origin/feat/mindmap` | `0387fcbcc88e140978ab21b28b96d0e70f74f2f9` | deleted (M1/M5 on main; backup on feat/storybook) |
| `origin/feat/landing-figure-vent` | `e305d41d118128dca2682a9e13941f91f5873532` | deleted (0 unmerged) |
| `origin/feat/website` | `1f99dd362293c0f54dfdd88262faf33448033bc2` | deleted (0 unmerged) |
| `origin/landing-only` | `5a910c7e49b45a26535a2fd5f2e9e6440d58728e` | deleted (0 unmerged) |

## Step log

- [x] Step 0 — SHAs recorded (above)
- [x] Step 1 — rename STALE → feat/storybook (HEAD now feat/storybook; worktree preserved, 74 paths still dirty)
- [x] Step 2 — push origin/feat/storybook (backup verified: 25 storybook files on remote)
- [x] Step 3 — delete 4 dead/duplicated remotes (landing-figure-vent, website, landing-only, feat/mindmap)
- [x] Step 4 — enable delete-branch-on-merge (deleteBranchOnMerge=true)
- [x] Step 5 — write docs/BRANCHING.md
- [x] Step 6 — prune local remote-tracking refs (dangling origin/* dropped)
- [x] Step 7 — commit docs (docs/BRANCHING.md + T-026-05 artifacts only)

## Final branch state

Remote heads: `main`, `feat/storybook`, `feat/mindmap-flow`, `archive/home-tangle`,
`gh-pages`, `v200`. Locals: `feat/storybook` (current), `main`,
`feat/analytics-events` + `feat/mindmap-flow` (active worktrees, untouched).

## Deviations

- **D1 — STALE renamed, not deleted.** Research found the Storybook suite (25
  files, ~13 commits) lives ONLY on STALE with no remote backup; the ticket's
  assumption that only M1/M5+docs needed salvaging was wrong (M1/M5 are already on
  `main`). Renaming to `feat/storybook` + pushing preserves 100% of the work and
  still satisfies the "STALE-* stops being a trap" AC. Delete would have destroyed
  unmerged work.
- **D2 — v200 not deleted.** 57 unmerged commits, historical migration snapshot.
  Retiring it is a judgment call → handed to Kate (recommend rename to
  `archive/v200`), not auto-deleted.
- **D3 — feat/storybook not merged to main.** Salvage ≠ ship. Merging the
  Storybook suite is a T-023/T-025 concern behind the (pending) T-026-02 PR gate.
