# PR Workflow & Branch Protection

How changes reach `main`. `main` **auto-deploys to production** (Vercel), so it is
protected: nothing lands without passing CI through a pull request. This is the gate
that stops unverified work shipping.

Naming and branch lifecycle live in [BRANCHING.md](./BRANCHING.md) — this doc owns
the **gate**.

## What `main` enforces

Branch protection on `main` (applied via
[`scripts/apply-branch-protection.sh`](../scripts/apply-branch-protection.sh)):

| Rule | Setting | Why |
|---|---|---|
| Pull request required | direct pushes to `main` blocked | every change is reviewable + CI-checked |
| Required status check | **`ci`** (from [T-026-01](./active/tickets)) must pass | no merge while lint/typecheck/build/test are red |
| Required status check | **`Vercel`** (when `REQUIRE_VERCEL_PREVIEW=true`) | no merge unless the preview deploy is `Ready` — a broken preview build ≈ a broken prod build (T-026-03). *Not* `Vercel Preview Comments` (cosmetic) or `Cloudflare Pages` (stale/failing). |
| Branch up to date | `strict: true` | prevents the silent-drift-then-merge that shipped unverified code before |
| Conversation resolution | required | no unresolved review threads at merge |
| Approving reviews | **not required** (solo dev) | GitHub blocks self-approval; requiring one would deadlock a solo `main`. Revisit when a second collaborator joins. |
| Linear history | see repo settings | keeps `main` legible; pairs with squash-merge |
| Applies to admins | `enforce_admins` | the owner stops pushing straight to prod too |

> The exact values for the last three rows are configured in the protection script;
> this table is the source of truth for intent — keep the two in sync.

## Opening a PR

```
branch off main  →  push  →  open PR  →  ci green  →  preview QA  →  squash-merge
```

1. **Branch** off `main` using the naming in [BRANCHING.md](./BRANCHING.md)
   (`feat/ fix/ chore/`).
2. **Push** and **open a PR**. The
   [PR template](../.github/pull_request_template.md) auto-fills the description —
   fill in what changed, how you verified, migrations touched, preview QA.
3. **Wait for `ci`** (lint / typecheck / build / test). It must be green to merge.
4. **Keep the branch current** — if `main` moved, update your branch (protection
   requires it to be up to date).
5. **Preview QA** — open the Vercel preview and run the checklist in
   [PREVIEW-QA.md](./PREVIEW-QA.md) (theme sweep + smoke; chat matrix for AI
   changes).
6. **Squash-merge.** The head branch auto-deletes on merge
   (`delete_branch_on_merge`), so no cleanup.

## Solo-dev review policy

Approvals are **not** required — you can't approve your own PR, and requiring one
would make `main` un-mergeable for a solo dev. The gate is instead: **`ci` green +
conversation resolved + branch up to date**. Self-merging a green PR is the normal
path. If a second collaborator joins, flip on required approvals in the protection
script.

## Emergency hotfix

If prod is broken and CI is in the way, an admin can temporarily lift protection:

```bash
gh api -X DELETE repos/huezokate/mindshift/branches/main/protection
# ... push the fix ...
bash scripts/apply-branch-protection.sh   # ALWAYS re-apply immediately after
```

Treat this as an exception, not a habit — re-apply protection the moment the fix is
in.

## Re-applying / changing protection

Protection is defined as code in
[`scripts/apply-branch-protection.sh`](../scripts/apply-branch-protection.sh). To
change policy, edit the JSON in that script and re-run it — it's idempotent (a full
`PUT`, so re-running converges to the intended state).
