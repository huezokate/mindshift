# T-018-02 — Review

Handoff: detail header + vent CTAs (Figma 469:4431 / 602:6511 / 606:7872).

## What changed

**Modified — `V200/src/components/journal/JournalV2Client.tsx`** (committed in `1000938`):
- Added `useTheme()` + `isCyberpunk`/`isKawaii` locals.
- Replaced the generic filled `--btn-*` "Vent it out" `<Link>` with the **Figma 606:7872
  composite**: an `add` Button-Primary (open-bottom, `w-120`) raised on a green rule
  (left rule `h-4` z3, right rule `h-1` z1, button z2, `-4px` overlap, `isolation:
  isolate`) over a `--bg` label bar with the "Vent it out" label. One `<Link
  href="/app/onboarding">`; `aria-label` on the link, `aria-hidden` on icon + rules;
  notepad keeps its `--card-filter` drop-shadow.

**Verified, not changed** (already correct from commit `857a756` / `e66d2b4`):
- `EntryDetail.tsx` — `<AppHeader/>` is the detail header; "+ Lens" Button-Primary
  matches Figma 602:6511, wired to the T-018-04 lens-picker stub.
- `AppHeader.tsx` — shared, token-driven nav bar.

No files created or deleted. No DB / route / type / token-file changes.

## Acceptance criteria

| Criterion | Status |
|---|---|
| Detail page shows AppHeader | ✅ (verified — `EntryDetail` line 41) |
| "+ Lens" present and wired | ✅ (matches 602:6511; wired to T-018-04 stub) |
| "Vent it out" present and wired | ✅ (now matches 606:7872; → `/app/onboarding`) |
| Pull get_design_context for each node | ✅ (602:6511, 606:7872, screenshot 469:4431) |
| Token-driven | ✅ (`--bg`/`--green`/`--font-btn`/`--card-filter`; no hex) |
| tsc clean | ✅ (exit 0) |
| QA in 3 themes | ⚠️ static-verified only (see concerns) |

## Test coverage

- **Type safety:** `tsc --noEmit` exit 0 — the gate for this presentational repo (no
  unit-test harness for view components).
- **Static token/theme check:** the changed block references only CSS custom properties
  plus the `isCyberpunk||isKawaii` notepad-filter branch — proves all three themes follow
  without a browser.
- **Behavioral:** CTA remains a `<Link href="/app/onboarding">`; routing unchanged.
- **Gap:** no automated visual/regression test. Live 3-theme QA was not run in this
  headless session.

## Open concerns / follow-ups

1. **Live 3-theme QA (low risk).** A human should eyeball
   `localhost:3000/app/journal-v2` in cyberpunk / kawaii / notepad to confirm the
   open-bottom button + rule overlap reads cleanly (especially the seam where the button
   meets the label bar, and notepad's drop-shadow on the open-bottom box). Purely
   token-driven, so risk is low, but the negative-margin rule overlap is the one fiddly
   spot.
2. **Button-Primary duplication (refactor opportunity).** The green `t-4 l-4 r b`
   treatment now appears in ≥3 places (detail "+ Lens", per-lens button row, this CTA).
   A shared `<ButtonPrimary/>` primitive would DRY this up. Deliberately deferred — out
   of scope here and would touch committed sibling code.
3. **Commit attribution (no action).** Under the shared-branch file-lock model, this
   change was serialized into sibling commit `1000938` rather than a commit bearing its
   own message. Code is present and verified on the branch; flagging only so a reviewer
   reading `git log` by message isn't surprised.

## Risk assessment

Low. Single-file, presentational, token-driven change with no route/data/type impact.
Rollback = revert the JournalV2Client hunk. The detail-page deliverables required no code
change (already shipped), so the surface area of new risk is the one CTA block.
