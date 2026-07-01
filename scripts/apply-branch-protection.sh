#!/usr/bin/env bash
#
# apply-branch-protection.sh — set/refresh classic branch protection on `main`.
#
# Idempotent: PUTs the full protection JSON, so re-running converges to the
# intended state. This is the recovery path if protection is ever removed
# (see docs/PR-WORKFLOW.md → "Re-applying / changing protection").
#
# Requires: gh CLI, authed as a repo admin (`gh auth status`).
# Usage:    bash scripts/apply-branch-protection.sh
#
# Policy knobs (the three the ticket defers to Kate — T-026-02 Design D3).
# Edit these to change policy; the doc table in docs/PR-WORKFLOW.md is the
# source of truth for intent — keep the two in sync.
set -euo pipefail

REPO="huezokate/mindshift"
BRANCH="main"

# --- Kate's-call policy values (defaults per Design D3) ---------------------
# Require ≥1 approving review? Solo dev: 0 — GitHub blocks self-approval, so 1
# would deadlock `main`. Bump to 1 when a second collaborator joins.
REQUIRED_APPROVALS=0
# Enforce linear history (pairs with squash-merge in BRANCHING.md)?
LINEAR_HISTORY=true
# Apply the gate to admins too (owner also stops pushing straight to prod)?
ENFORCE_ADMINS=true
# ---------------------------------------------------------------------------

read -r -d '' BODY <<JSON || true
{
  "required_status_checks": {
    "strict": true,
    "checks": [{ "context": "ci" }]
  },
  "enforce_admins": ${ENFORCE_ADMINS},
  "required_pull_request_reviews": {
    "required_approving_review_count": ${REQUIRED_APPROVALS},
    "dismiss_stale_reviews": true
  },
  "required_conversation_resolution": true,
  "required_linear_history": ${LINEAR_HISTORY},
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON

echo "Applying branch protection to ${REPO}@${BRANCH} ..."
printf '%s' "$BODY" | gh api -X PUT \
  -H "Accept: application/vnd.github+json" \
  "repos/${REPO}/branches/${BRANCH}/protection" \
  --input - > /dev/null

echo "Applied. Current state:"
gh api "repos/${REPO}/branches/${BRANCH}/protection" --jq '{
  pr_required: (.required_pull_request_reviews != null),
  approvals:   .required_pull_request_reviews.required_approving_review_count,
  strict:      .required_status_checks.strict,
  checks:      [.required_status_checks.checks[].context],
  convo:       .required_conversation_resolution.enabled,
  linear:      .required_linear_history.enabled,
  admins:      .enforce_admins.enabled
}'
