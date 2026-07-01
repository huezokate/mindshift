# Preview QA — manual checklist before merge

Every PR gets a **Vercel preview deploy**. Before squash-merging, open that preview
and confirm the change actually works in a running deployment — not just that it
compiled. This is the gate that turns "we think it works" into "we saw it work"
(the step that was missing when Chat with the Lens shipped unverified).

Runs **after `ci` is green, before merge**. The gate itself (branch protection,
required checks) lives in [PR-WORKFLOW.md](./PR-WORKFLOW.md); this is the runbook.

## 1. Find the preview

The **`vercel` bot comments on the PR** with a **Preview** link once the deploy is
`Ready`. URL pattern:

```
mindshift-git-<branch>-huezokate-9175s-projects.vercel.app
```

The preview is built from the `V200/` app root, per-PR, automatically — no local
setup, so a reviewer can exercise the change straight from the URL.

> **Ignore the `Cloudflare Pages` check.** It's a stale, always-failing legacy
> integration (Cloudflare here is DNS-only; CF Pages never built this app). It is
> **not** a required check and does not block merge. Pending removal — see the
> T-026-03 review. The check that matters for the deploy is **`Vercel`**.

## 2. The gate — run on every PR that touches UI or behavior

- [ ] **The feature actually runs on the preview** — not just loads. Trigger the
  thing the PR changed and see it work end-to-end (a build can pass while a runtime
  key is missing). If a feature is dead on preview, the fix is Vercel
  **Preview-scoped env vars**, not this PR.
- [ ] **Theme sweep** — switch across all three themes and confirm the changed UI
  is correct in each:
  - **Cyberpunk** (neon on dark) · **Kawaii** (soft pink) · **Notepad** (paper).
  - Structural tokens only — watch for the kawaii **"magenta collapse"** (tokens
    falling back to a flat magenta instead of the theme palette).
- [ ] **Smoke the primary flow this PR touches** — e.g. onboarding → lens →
  response, journal, or the landing/waitlist — whichever the change affects.

## 3. Chat / AI changes — run the chat matrix

For anything touching Chat with the Lens or a Gemini/AI path, **don't improvise** —
run the full matrix already defined in
[T-025-01](./active/tickets/T-025-01-chat-e2e-verification.md):

- [ ] All three themes: voice + context persist, styling theme-correct.
- [ ] **Signed-in**: conversation persists; reopening from history shows the full
  thread; `closed` state renders the graceful footer + disabled composer.
- [ ] **Anon**: thread is ephemeral (sessionStorage); reload behaves as designed.
- [ ] **20-turn hard cap**: produces a warm, in-character close — never a 4xx/error.
- [ ] **Soft close / sentinel**: the `⟪END⟫` sentinel is parsed + stripped and
  never shown to the user; the ~5-turn close reads as a real landing.

## 4. Data & migrations caveat

There is **one Supabase project** — previews share the **production** database.

- [ ] Any DB migration this PR needs is **applied and verified** first, via the
  gated process in
  [migration-process.md](./knowledge/migration-process.md) (T-026-04). Preview QA
  that depends on new schema is meaningless until the migration is live.
- [ ] Avoid **destructive / data-mutating** QA on the preview — you're writing to
  real prod data. Prefer read-only checks or clearly throwaway test rows.

## 5. When it's fine to skip

Docs-, tooling-, or config-only PRs with **no runtime surface** can mark Preview QA
**N/A** in the PR template. Keep that honest — if the change renders anything a user
sees, it gets the sweep.

---

<sub>The PR template ([.github/pull_request_template.md](../.github/pull_request_template.md))
carries a compact version of this checklist; this doc is the full runbook it links
to. Part of the S-026 release-safety pipeline: PR → `ci` green → **preview QA** →
protected merge → deploy.</sub>
