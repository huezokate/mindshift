# T-026-05 · Research — Branch Hygiene Cleanup

Descriptive map of the repository's branch state as of 2026-07-01. No solutions
proposed here — see `design.md`. All findings verified with `git cherry`,
`git rev-list`, `git ls-tree`, and `gh` against `origin`
(`https://github.com/huezokate/mindshift.git`).

## Method

The authoritative test for "does this branch hold work not on `main`?" is
`git cherry main <branch>` — it compares **patch-ids**, so a commit that was
rebased/re-applied onto `main` under a new SHA correctly shows as `-` (merged).
Its blind spot is **squash-merges**: N commits squashed into `main` still show as
`+` (unmerged) even though the net diff is on `main`. Because this repo has
historically squashed and re-applied work, `git cherry` counts were
**cross-checked against the actual file tree on `main`** (`git ls-tree`) before
classifying anything as "unique / must-salvage". This distinction is the whole
game for this ticket — the difference between "unmerged patch-id" and "content
genuinely absent from `main`" is what makes a delete safe or catastrophic.

## Worktree layout (important — three live checkouts)

```
/…/MindShift          → STALE-feat/mindmap   (main worktree, current checkout)
/…/MindShift/mindmap  → feat/mindmap-flow
/…/MindShift/website  → feat/analytics-events
```

Two branches (`feat/mindmap-flow`, `feat/analytics-events`) are **checked out in
active worktrees** — they cannot be deleted while checked out, and their presence
signals in-flight work, not abandonment.

## Local branches

| Branch | `cherry +` | Content status vs `main` | Notes |
|---|---|---|---|
| `STALE-feat/mindmap` *(HEAD)* | 20 | **Mixed — see below** | Tracks `origin/feat/mindmap`, "ahead 38" (unpushed) |
| `feat/analytics-events` | 1 | **Genuinely unmerged** | worktree `/website`; S-019/T-019 analytics |
| `feat/mindmap-flow` | 18 | **Genuinely unmerged** | worktree `/mindmap`; == `origin/feat/mindmap-flow` |
| `main` | — | canonical | tracks `origin/main` @ `9436a37` |

### STALE-feat/mindmap — the trap, decomposed

`main…STALE` divergence: **32 main-only / 41 STALE-only** commits. Of STALE's 41,
`git cherry` flags **20** as unmerged patch-ids. Cross-checking against `main`'s
tree splits those 20 into two very different buckets:

**A. Already on `main` (duplicates / rebased — safe if lost):**
- `e839caa` mindmap M1 (migration 005 + frontend) — `main` **has** the mindmap
  routes/components/migration (`V200/src/app/app/mindmap/*`, `.../api/mindmap/*`).
- `50e0dad` mindmap M5 (Sunday reminder email) — `main` **has**
  `V200/src/app/api/cron/sunday-reminder/route.ts`.
- `3c5bdf4` "feat(ai): optional multi-turn messages in generateText (T-020-02)" —
  `main` has the **same-titled** `1f0ee61`. These are the ticket's "duplicate chat
  commits": identical intent, different SHA, slightly different patch → cherry
  can't dedupe them.

**B. UNIQUE to STALE — exists on no other branch or remote (would be lost):**
- The **entire Storybook suite**: `main` has **0** storybook files;
  STALE has **25** (`V200/.storybook/*`, `**/*.stories.tsx`). ~13 commits:
  T-022-01/02/03 scaffold + preview + toolbar; T-023-01/02/03/04 stories;
  Themes/Tokens reference page.
- Chat **vitest** tests `f8a2714` (T-025-02) + RDSPI docs artifacts (T-023-02/03).

**Critical:** bucket B lives **only** in this local branch. `origin/feat/mindmap`
(what STALE tracks) carries just the 2 M1/M5 commits — the storybook stack is the
"ahead 38" unpushed delta. There is **no remote backup** of the Storybook suite.
Deleting STALE without first preserving it = permanent loss (reflog only).

The branch is mislabeled `STALE-*` but is in fact the **active development line**
for the storybook/testing track — exactly the "is chat actually released?"
confusion the ticket calls out.

## Remote branches (`origin/*`)

| Branch | `cherry +` | Classification |
|---|---|---|
| `origin/feat/landing-figure-vent` | **0** | fully merged → dead |
| `origin/feat/website` | **0** | fully merged → dead |
| `origin/landing-only` | **0** | fully merged → dead |
| `origin/feat/mindmap` | 2 | M1/M5 — content on `main`; duplicates of bucket A |
| `origin/feat/mindmap-flow` | 18 | genuinely unmerged (mirrors local worktree) |
| `origin/gh-pages` | 1 | **GitHub Pages deploy branch** — machine-managed, 3 mo old |
| `origin/archive/home-tangle` | 46 | **intentional archive** (name prefix `archive/`) |
| `origin/v200` | 57 | historical pre/mid-migration branch, 8 wk old (`314d024`) |

Three branches (`landing-figure-vent`, `website`, `landing-only`) are provably
fully merged (0 unmerged patch-ids **and** their work is on `main`) → safe delete
candidates. `archive/*`, `gh-pages`, and `v200` are deliberately retained
categories (archive convention, deploy target, historical snapshot).

## Prevention surface

- **Auto-delete head branches on merge:** currently **OFF**
  (`gh repo view --json deleteBranchOnMerge` → `false`). `gh` is authenticated and
  has repo access, so this is togglable via `gh api` / `gh repo edit`.
- **Naming convention:** none documented. Existing branches already lean toward
  `feat/*` and `archive/*`; there is no `fix/*` or `chore/*` precedent and no
  written rule. The `STALE-*` prefix is an ad-hoc, confusing exception.
- **PR-flow doc:** T-026-02 (branch protection + PR flow) is **not yet
  implemented** (no `docs/active/work/T-026-02/`), so the "document the convention
  next to the PR flow" AC has no existing home file — it must create one that
  T-026-02 can later extend. T-026-05 `depends_on: []`, so it cannot assume
  T-026-02's artifacts exist.

## Constraints & assumptions

- **Uncommitted working-tree changes exist** on the STALE checkout (modified
  `figures.ts`, `resend.ts`, journal preview pages, untracked storybook mocks &
  fixtures). Any branch operation must not clobber them — `git branch -m` (rename)
  is working-tree-safe; a checkout switch would not be.
- Remote deletions push to a **shared, real** GitHub repo (outward-facing,
  recoverable only by re-pushing a saved SHA). Every deletion must be preceded by
  recording the tip SHA.
- `gh` CLI is available and authed → GitHub-settings steps are scriptable, not
  manual-only.
- No CI currently gates `main` (T-026-01/02 pending) — irrelevant to this ticket's
  mechanics but explains how the drift accumulated.
