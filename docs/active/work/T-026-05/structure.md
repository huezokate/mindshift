# T-026-05 · Structure — Branch Hygiene Cleanup

The "code" for this ticket is mostly **git ref mutations** plus one new doc file.
This artifact defines the exact refs touched, the one file created, and the
ordering constraints between operations.

## Files

### Created
- **`docs/BRANCHING.md`** — the branch naming convention + lifecycle. Sections:
  1. *Naming* — `feat/*`, `fix/*`, `chore/*`; retained namespaces `archive/*`,
     machine branch `gh-pages`. No `STALE-*`, no personal/long-lived branches.
  2. *Lifecycle* — branch off `main` → PR → checks → squash-merge → auto-delete.
  3. *Auto-delete* — note that "delete head branch on merge" is enabled repo-wide.
  4. *Forward-link* — placeholder pointer to the T-026-02 PR-flow section.
  ~40–60 lines. Placed under `docs/` (project convention for process docs).

### Modified
- None. (`git branch -m` and remote deletions change refs, not tracked files. The
  pre-existing uncommitted working-tree changes on the checkout are **left as-is**
  and are explicitly out of scope.)

### Deleted (files)
- None.

## Git refs — the real change surface

### Local refs
| Ref | Operation | Safety precondition |
|---|---|---|
| `STALE-feat/mindmap` | **rename →** `feat/storybook` | working-tree-safe; no switch |
| `feat/analytics-events` | untouched | active worktree |
| `feat/mindmap-flow` | untouched | active worktree |
| `main` | untouched | — |

### Remote refs (`origin/*`)
| Ref | Operation | Safety precondition | Recovery |
|---|---|---|---|
| `feat/storybook` | **create** (push) | additive | n/a |
| `feat/landing-figure-vent` | **delete** | 0 unmerged, content on `main` | re-push SHA |
| `feat/website` | **delete** | 0 unmerged, content on `main` | re-push SHA |
| `landing-only` | **delete** | 0 unmerged, content on `main` | re-push SHA |
| `feat/mindmap` | **delete** | only after `feat/storybook` pushed; M1/M5 on `main` | re-push SHA |
| `feat/mindmap-flow` | untouched | 18 unmerged | — |
| `gh-pages` | untouched | deploy branch | — |
| `archive/home-tangle` | untouched | archive namespace | — |
| `v200` | untouched (documented) | 57 unmerged; Kate's call | — |

### GitHub repo setting
| Setting | From | To | Mechanism |
|---|---|---|---|
| `deleteBranchOnMerge` | `false` | `true` | `gh repo edit … --delete-branch-on-merge` |

## Ordering constraints (hard dependencies)

```
1. record ALL tip SHAs  ─────────────────────────────┐  (safety net first)
2. rename STALE → feat/storybook                       │
3. push origin feat/storybook  ──┐                     │
                                 │ (backup exists)      │
4. delete origin/feat/mindmap  ◄─┘                     │
5. delete 3 dead remotes (order-independent among them)│
6. gh: enable delete-on-merge                          │
7. write docs/BRANCHING.md                             │
8. commit docs/BRANCHING.md + progress.md              │
```

- **Step 1 before any mutation** — the recorded SHA log *is* the reflog-independent
  recovery path required by the ticket.
- **Step 3 strictly before Step 4** — the only ordering that prevents unique
  Storybook content from being unbacked at delete time. (In practice Storybook is
  on the local `feat/storybook` after rename, but the push makes it durable and is
  the invariant Step 4 depends on.)
- Steps 5–7 are independent of each other.

## Interfaces / commands (blueprint, not final script — see plan.md)

- Rename: `git branch -m STALE-feat/mindmap feat/storybook`
- Backup push: `git push -u origin feat/storybook`
- Remote delete: `git push origin --delete <branch>` (×4)
- Setting: `gh repo edit huezokate/mindshift --delete-branch-on-merge`
- SHA capture: `git rev-parse <ref>` per branch → appended to `progress.md`

## Out of scope (structurally excluded)

- No changes to `V200/**` source, migrations, or CI config.
- No merge of `feat/storybook` into `main` (salvage only).
- No deletion of `v200`, `archive/*`, `gh-pages`, or worktree branches.
- No touching the uncommitted working-tree changes present at start.
