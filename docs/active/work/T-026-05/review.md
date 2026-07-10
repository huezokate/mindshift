# T-026-05 · Review — Branch Hygiene Cleanup

Handoff for a human reviewer. What changed, how it was verified, what still needs
Kate's decision.

## Summary

The repo's branch clutter is cleaned up and prevented from recurring. The headline
correction from Research: **`STALE-feat/mindmap` was mislabeled — it was the only
home of the entire Storybook suite** (25 files, ~13 commits, no remote backup).
The ticket's literal plan (delete STALE, salvage only M1/M5+docs) would have
destroyed unmerged work, because M1/M5 turned out to already be on `main`. So the
branch was **renamed and backed up** rather than deleted — same AC ("stop being a
trap") met, zero work lost.

## What changed

### Git refs (the real work)
- **Renamed** local `STALE-feat/mindmap` → `feat/storybook` (working-tree-safe;
  the 74 pre-existing uncommitted changes were preserved, not clobbered).
- **Created** `origin/feat/storybook` — remote backup of the Storybook suite
  (verified: 25 storybook files present on the remote).
- **Deleted** 4 remote branches, each SHA recorded in `progress.md` for re-push:
  - `origin/feat/landing-figure-vent` (0 unmerged)
  - `origin/feat/website` (0 unmerged)
  - `origin/landing-only` (0 unmerged)
  - `origin/feat/mindmap` (only M1/M5, both on `main`; also backed up on
    `feat/storybook`)
- **Pruned** dangling local remote-tracking refs.

### GitHub setting
- `deleteBranchOnMerge`: `false` → **`true`** (merged PR branches now auto-delete).

### Files
- **Created** `docs/BRANCHING.md` — naming convention (`feat/*` `fix/*` `chore/*`,
  retained `archive/*`/`gh-pages`/`v200`), lifecycle, auto-delete note, forward-link
  to the T-026-02 PR flow.
- **Created** `docs/active/work/T-026-05/{research,design,structure,plan,progress,
  review}.md`.
- Committed as `d0c024a` — **docs-only** (verified via `git show --stat`).

## Branch disposition table (every branch accounted for)

| Branch | Unmerged | Action | Rationale |
|---|---|---|---|
| `STALE-feat/mindmap` | 20 (13 unique: Storybook) | renamed→`feat/storybook`, pushed | unique work, de-trapped |
| `origin/feat/mindmap` | 2 | deleted | M1/M5 on `main` + backed up |
| `origin/feat/landing-figure-vent` | 0 | deleted | fully merged |
| `origin/feat/website` | 0 | deleted | fully merged |
| `origin/landing-only` | 0 | deleted | fully merged |
| `feat/mindmap-flow` (+origin) | 18 | kept | unmerged UI work, active worktree |
| `feat/analytics-events` | 1 | kept | unmerged S-019 analytics, active worktree |
| `origin/archive/home-tangle` | 46 | kept | intentional archive namespace |
| `origin/gh-pages` | 1 | kept | GitHub Pages deploy branch |
| `origin/v200` | 57 | kept (handed off) | historical snapshot — Kate's call |
| `main` | — | untouched | canonical |

## Verification

No runtime code → no unit/integration tests. Verification was state-assertion:
- HEAD == `feat/storybook`; renamed ref SHA == original `11fc392`.
- `origin/feat/storybook` carries 25 storybook files (backup real).
- Each deleted branch re-confirmed 0-unique **at delete time** before removal.
- `gh repo view` confirms `deleteBranchOnMerge=true`.
- Final `git ls-remote` shows only intended heads remain.
- Recovery SHAs for all 5 mutated refs recorded in `progress.md`.

## Acceptance criteria

| AC | Status |
|---|---|
| Unmerged work salvaged or dropped-with-note | ✅ Storybook salvaged; M1/M5/AI-multiturn noted as already-on-main |
| `STALE-*` / dead `feat/*` / `origin/*` removed | ✅ STALE renamed away; 4 dead remotes deleted |
| Merged PR branches auto-delete | ✅ `deleteBranchOnMerge=true` |
| Naming convention documented next to PR flow | ✅ `docs/BRANCHING.md` (links forward to T-026-02) |
| No uniquely-held commit lost | ✅ SHA log + remote backup + per-delete precheck |

## Open concerns / handoff

1. **`origin/v200` (57 commits) not retired.** Judgment call — recommend renaming
   to `archive/v200` so intent is explicit. Left for Kate. *(no data at risk)*
2. **`feat/storybook` is salvaged, not shipped.** The Storybook suite still needs
   to reach `main` via a PR (T-023/T-025 concern) once T-026-02's gate exists. It
   is safely on `origin/feat/storybook` until then.
3. **74 pre-existing uncommitted working-tree changes** (modified `figures.ts`,
   `resend.ts`, journal preview pages, untracked storybook mocks/fixtures) were
   deliberately **left untouched** — they predate this ticket and belong to the
   storybook track, not branch hygiene. They now live on `feat/storybook`.
4. **`docs/BRANCHING.md` forward-links to T-026-02**, which isn't implemented yet.
   When T-026-02 lands, wire its PR-flow doc back to this file.
5. **Recovery window:** deleted remotes are re-pushable from the SHAs in
   `progress.md` indefinitely, and via local reflog for ~90 days. Nothing is
   irrecoverable.

## Risk assessment

Low. Every destructive op was gated on a 0-unique proof and a recorded re-push
SHA; the one branch with unique content (Storybook) was backed up to origin before
its tracked remote was touched. No source, migrations, or CI config changed.
