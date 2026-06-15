# T-018-02 — Plan

Ordered, independently-verifiable steps.

## Step 1 — Verify the already-built affordances (read-only)
- Confirm `EntryDetail.tsx` renders `<AppHeader/>` as its header and the "+ Lens"
  Button-Primary matches Figma 602:6511 (bg `--bg`, `t-4 l-4 r b` green, radius 2px,
  add icon 24 + "Lens" label). Confirm it is wired to a click handler (T-018-04 stub).
- Confirm `AppHeader.tsx` is token-driven and present (committed `e66d2b4`).
- **Verify:** visual read of the files; no code change. ✓ if both match.

## Step 2 — Add theme access to JournalV2Client
- Import `useTheme` from `@/lib/theme`; derive `isCyberpunk`/`isKawaii`.
- **Verify:** tsc clean; no behavior change yet.

## Step 3 — Rebuild the "Vent it out" CTA to Figma 606:7872
- Replace the generic `--btn-*` filled `<Link>` with the composite from `structure.md`:
  green rule + open-bottom `add` Button-Primary (w-120) + green rule, then a label bar.
- Preserve: `href="/app/onboarding"`, the `entries.length > 0` gate, single `<Link>`,
  `aria-label`, decorative `aria-hidden` on icon/rules.
- Token-driven only: `--bg`, `--green`, `--font-btn`, `--card-filter` (notepad branch).
- **Verify:** tsc clean; grep the block for hex literals (expect none).

## Step 4 — Full typecheck
- `cd V200 && npx tsc --noEmit` → exit 0.

## Step 5 — Commit
- Atomic commit scoped to `JournalV2Client.tsx`:
  `feat(journal): feed 'Vent it out' CTA → Figma 606:7872 composite (T-018-02)`.
- Do **not** stage sibling-ticket files (`[id]/page.tsx`, `JournalPreviewCard.tsx`,
  `QuoteCardCanvas.ts`).

## Testing strategy

- **Type safety:** `tsc --noEmit` is the gate (no unit-test harness for presentational
  components in this repo).
- **Token/theme correctness (static):** verify the changed block references only CSS
  custom properties + the `isCyberpunk||isKawaii` filter branch — proves all three
  themes follow without a live browser. This is how "QA in 3 themes" is satisfied in a
  headless session; a human can spot-check the three `data-theme` values in the running
  app (`localhost:3000/app/journal-v2`).
- **Behavioral:** the CTA remains a `<Link href="/app/onboarding">` — routing unchanged,
  so no regression to navigation.
- **Visual fidelity:** cross-checked against the `get_design_context` output for
  606:7872 (geometry, borders, overlap, label typography).

## Verification criteria (done = all true)

- [ ] Detail page renders AppHeader (verified) and "+ Lens" (verified, matches 602:6511).
- [ ] Feed "Vent it out" matches 606:7872 (icon-on-rule + label bar), token-driven.
- [ ] CTA still links to `/app/onboarding`.
- [ ] `tsc --noEmit` exit 0.
- [ ] No hardcoded hex in the changed block.
- [ ] No sibling-ticket files modified.

## Rollback

Single-file, single-block change — revert the commit to restore the prior filled button.
