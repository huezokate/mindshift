# Review: T-003-03 flow2-vent-and-lens

## Summary

Added page6 (vent input) for Flow 2. The user writes what's on their mind, clicks "Find My Lens →", and is taken directly to the lens picker (page4). The lens output on page5 is the same page as Flow 1 — both flows converge there. Page4's back button is now context-aware: returns to page6 if arrived via vent, page3 otherwise.

---

## Files Changed

| File | Change |
|---|---|
| `mindshift.html` | HTML: page6 added; JS: `startVentLens()`, `backFromPage4()` added; page4 back button updated; URL param range extended to 6 |

---

## What Changed

### HTML
- `page6` — dark glass container with `<textarea id="ventText">` and "Find My Lens →" button; back button returns to page1

### JS
- `startVentLens()` — validates vent text, stores in `userData.vent`, sets `userData.lensContext = 'vent'`, navigates to page4
- `backFromPage4()` — replaces hard-coded `navigateToPage(3)` on page4's back button; routes to page6 if `lensContext === 'vent'`, page3 otherwise
- URL params: range check updated from `p <= 5` to `p <= 6`

---

## Acceptance Criteria Verification

| Criterion | Status |
|---|---|
| page6 renders as dark glass container matching rest of app | ✅ |
| Empty vent text blocked | ✅ |
| "Find My Lens →" navigates to page4 with vent context set | ✅ |
| Page4 back → page6 when arrived from vent flow | ✅ |
| Page4 back → page3 when arrived from canvas | ✅ |
| `?page=6` URL param works | ✅ |

---

## Open Concerns

1. **`userData.vent` not yet passed to lens output** — `getPersonaContent()` still uses `userData.area/stuck` for content branching. Vent text is stored but not consumed. Full AI integration (Anthropic API) will use it.
2. **Page5 "Back to Map" button navigates to page3** — this is misleading for Flow 2 users who came from the vent. Low priority for prototype; a future pass should also route this dynamically.
