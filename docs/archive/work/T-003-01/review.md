# Review: T-003-01 landing-two-cta

## Summary

Replaced the original single-CTA landing page with a two-card fork:
- **Map My Future** — calls `startFlow1()`, leads into the 8-step wizard (page2)
- **Shift My Perspective** — calls `startFlow2()`, leads into the vent input (page6)

Cards use the existing dark glassmorphism tokens and match the rest of the app visually.

---

## Files Changed

| File | Change |
|---|---|
| `mindshift.html` | CSS: `.landing-header`, `.flow-cards`, `.flow-card`, `.flow-card-cta` added (~45 lines); HTML: page1 content replaced |

---

## What Changed

### CSS
- `.landing-header` — centred header block
- `.flow-cards` — 2-column grid (single column below 600 px)
- `.flow-card` — dark glass card with hover lift and periwinkle border accent on hover
- `.flow-card-cta` — accent-coloured CTA line at bottom of card

### HTML
Page1 content replaced with `.landing-header` + `.flow-cards` containing two `.flow-card` divs.

### JS
- `startFlow1()` — sets `userData.flow = 1`, resets wizard state, shows page2
- `startFlow2()` — sets `userData.flow = 2`, shows page6

---

## Acceptance Criteria Verification

| Criterion | Status |
|---|---|
| Two distinct cards visible on page1 | ✅ |
| "Map My Future" navigates to wizard (page2) | ✅ |
| "Shift My Perspective" navigates to vent (page6) | ✅ |
| Cards use dark glassmorphism (consistent with rest of app) | ✅ |
| Responsive: stacks to single column on narrow viewports | ✅ via media query |

---

## Open Concerns

None for prototype scope.
