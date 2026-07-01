## What changed

<!-- One line + link to the ticket, e.g. T-026-02 -->

## How verified

- [ ] `lint` / `tsc` / `build` / `test` pass (CI green, or run locally in `V200/`)
- [ ] Manually exercised the change

## Migrations

- [ ] No DB migration — **or** list the migration files touched (see T-026-04)

## Preview QA

Open the Vercel preview (bot comment ↑) and verify — full runbook: [docs/PREVIEW-QA.md](../docs/PREVIEW-QA.md)

- [ ] Feature actually runs on the preview (not just builds)
- [ ] Theme sweep — Cyberpunk / Kawaii / Notepad look correct
- [ ] Smoked the primary flow this PR touches
- [ ] Chat/AI change? Ran the [T-025-01 chat matrix](../docs/PREVIEW-QA.md#3-chat--ai-changes--run-the-chat-matrix)
- [ ] N/A — docs/tooling only, no runtime surface

---

<sub>Branch off `main`, keep it current, squash-merge when `ci` is green. See
[docs/PR-WORKFLOW.md](../docs/PR-WORKFLOW.md) and
[docs/BRANCHING.md](../docs/BRANCHING.md).</sub>
