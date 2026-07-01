# Branching & Naming Convention

How branches are named and how long they live in this repo. Keeping to this is
what keeps "is X actually released?" answerable — long-lived, mislabeled branches
(the retired `STALE-feat/mindmap`) are exactly what made it hard before.

## Naming

Branch off `main` using a type prefix:

| Prefix | For |
|---|---|
| `feat/*` | new features (`feat/chat-with-lens`) |
| `fix/*` | bug fixes (`fix/journal-footer-overlap`) |
| `chore/*` | tooling, deps, docs, refactors with no user-facing change |

**Retained / special namespaces — do not repurpose:**

| Name | Meaning |
|---|---|
| `archive/*` | intentional historical snapshots, kept on purpose (`archive/home-tangle`) |
| `gh-pages` | machine-managed GitHub Pages deploy branch — never hand-edit or delete |
| `v200` | pre/mid-migration historical snapshot (retirement is Kate's call; likely → `archive/v200`) |

**Don't:** `STALE-*`, personal-name branches, or any branch you intend to keep
diverged from `main` for weeks. If work needs to persist without merging, move it
under `archive/*` so the intent is legible.

## Lifecycle

```
branch off main  →  push  →  open PR  →  checks green  →  preview QA  →  squash-merge
```

- Branch short-lived; rebase/merge `main` in often so the branch stays current.
- One logical change per branch — if it touches unrelated files, it's probably two
  branches (this is also how the dependency DAG stays honest).
- Salvage, don't hoard: if a branch is fully merged, delete it; if it holds unique
  work you're not shipping yet, back it up (push it) and note why.

## Auto-delete on merge

The repo has **"Automatically delete head branches"** enabled
(`deleteBranchOnMerge = true`). Merging a PR removes its source branch
automatically — no manual cleanup, no accumulation of dead `feat/*` remotes.

## PR flow

The pull-request gate (branch protection, required checks, PR template) is
defined in **T-026-02**. When that lands, its PR-flow doc should link back here so
naming + protection live side by side. Until then: branch → PR → green → merge.
