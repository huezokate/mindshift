# Review: T-003-02 flow1-aspect-wizard

## Summary

Replaced the 4-question all-at-once form (page2) with an 8-step wizard — one question per screen — covering each life aspect in the context of "in 5 years". Steps: career → creativity → health & wellness → relationships → travel → finances → living situation → synthesis sentence. A progress bar of 8 dots tracks completion.

---

## Files Changed

| File | Change |
|---|---|
| `mindshift.html` | CSS: wizard progress + nav styles (~35 lines); HTML: page2 rewritten; JS: `WIZARD_STEPS`, `wizardStep`, `wizardAnswers`, `showWizardStep()`, `advanceWizard()`, `wizardBack()`, `launchCanvas()` added |

---

## What Changed

### JS
- `WIZARD_STEPS` — array of 8 step objects (`key`, `label`, `icon`, `question`, `placeholder`)
- `wizardStep` / `wizardAnswers` — mutable state, reset by `startFlow1()`
- `showWizardStep(n)` — populates question, icon, label, placeholder, progress dots, back button visibility, next/finish button label
- `advanceWizard()` — saves answer, increments step; on step 8 populates `userData.aspects` + `userData.future` and calls `launchCanvas()`
- `wizardBack()` — saves current draft, decrements step
- `launchCanvas()` — shows loading overlay for 2.2 s then navigates to page3; canvas render happens via the existing `navigateToPage(3)` patch

### CSS
- `.wizard-progress` / `.wizard-dot` / `.done` / `.active` — 8 segment progress bar
- `.wizard-step-label` — uppercase accent label
- `.wizard-nav` — flex row for previous/next buttons

---

## Acceptance Criteria Verification

| Criterion | Status |
|---|---|
| 8 distinct steps, one question at a time | ✅ |
| Progress bar reflects current position | ✅ |
| Back button hidden on step 1, visible on steps 2–8 | ✅ |
| Final step button reads "Build My Map →" | ✅ |
| Empty answer blocked with alert | ✅ |
| `userData.aspects` populated with all answers on completion | ✅ |
| Canvas launches after loading overlay | ✅ |

---

## Open Concerns

1. **`userData.aspects` not yet consumed by canvas nodes** — `deriveNodeContent()` still reads the old `userData.area/now/future/stuck` keys. Per-node content stays as default placeholder text until a future ticket wires aspect answers into node content.
2. **Wizard not re-enterable from canvas back button** — canvas back goes to page1, requiring the user to restart the wizard. This is intentional for the prototype.
