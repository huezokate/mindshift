# Review: T-003-04 per-node-lens-application

## Summary

Each expanded canvas node now shows a "🔮 Apply a Lens" button. Clicking it stores the node's category ID as `userData.lensContext` and navigates to the lens picker (page4). The dynamic `backFromPage4()` routing from T-003-03 also handles this flow — if lensContext is a category ID (not `'vent'`), back goes to page3.

---

## Files Changed

| File | Change |
|---|---|
| `mindshift.html` | CSS: `.cn-lens-btn` added; JS: `applyNodeLens()` added; `renderCategoryNodes` appends `.cn-lens-btn` per node |

---

## What Changed

### CSS
- `.cn-lens-btn` — hidden by default, shown only inside `.cn-expanded`; styled as a ghost pill with periwinkle accent, matching the node's text colour

### JS
- `applyNodeLens(catId)` — sets `userData.lensContext = catId`, navigates to page4
- In `renderCategoryNodes` — `lensBtn` element created per node, appended after the add-image button, with click/mousedown stop-propagation guards

---

## Acceptance Criteria Verification

| Criterion | Status |
|---|---|
| Button hidden in collapsed node state | ✅ `.cn-lens-btn { display:none }` |
| Button visible in expanded node state | ✅ `.cn-expanded .cn-lens-btn { display:block }` |
| Click stores category ID in `userData.lensContext` | ✅ |
| Navigates to page4 | ✅ |
| Page4 back returns to canvas (page3) | ✅ via `backFromPage4()` |
| Button does not trigger node collapse | ✅ `stopPropagation` on click + mousedown |

---

## Open Concerns

1. **Category context not consumed by lens output** — `getPersonaContent()` does not yet filter by `userData.lensContext` to focus the persona response on a specific life area. Wiring this is deferred to AI integration.
2. **Button placement order** — the lens button appears after the add-image button inside the expanded card. If the card height is tight on small screens, it may be clipped. Can be repositioned if needed.
