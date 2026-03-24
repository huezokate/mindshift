# Design: T-001-07 wire-into-app-flow

## Problem Decomposition

Five distinct sub-problems, each with clear scope:

1. Add "Choose Your Lens →" nav button to the canvas
2. Add "← Back to Form" button to canvas with reset-warning dialog
3. Improve onboarding-answer → canvas-node population
4. Remove dead code (generateGaps/Levers/Moves + old CSS)
5. Verify page4/5 ↔ page3 round-trip state preservation

---

## Sub-problem 1: "Choose Your Lens →" button on canvas

### Option A — Floating overlay button in HTML
Add a `<button id="canvas-lens-btn">` inside `#canvas-root` in the HTML. Style it with
`position: absolute` in the canvas CSS section. Wire `onclick="navigateToPage(4)"`.

Pros: simple, declarative, always present without JS creation.
Cons: slightly inflates HTML, but trivially so.

### Option B — Inject button via navigateToPage patch
Create the button in JS inside the `n === 3` branch, guarded by `getElementById` check.

Pros: keeps all canvas DOM creation in JS.
Cons: adds complexity and a second creation path; harder to style clearly.

**Decision: Option A.** The button is always part of the canvas page layout, like the zoom
controls. HTML declaration is the right place. Position bottom-left (mirroring the zoom
controls at bottom-right) for visual balance.

---

## Sub-problem 2: "← Back to Form" button with warning

### Option A — Floating overlay button on canvas (same layer as lens button)
Add `<button id="canvas-back-btn">` to `#canvas-root`. On click, show `confirm()` dialog.
If confirmed, call `navigateToPage(2)`.

Pros: discoverable, consistent with other canvas buttons.

### Option B — No back button; rely on browser back
Not viable — this is a single-page app with no router.

### Option C — Button inside page3 container but outside canvas-root
Not applicable — the page3 container IS just canvas-root in canvas-mode.

**Decision: Option A.** `confirm()` is the right native primitive here. The warning message
should be: "Going back will reset your mind map. Continue?" If the user confirms, navigate to
page2 and reset `_canvasCentred` so the canvas re-centers on next visit.

**State reset on confirmed back:**
- `userData = {}` — clears the old answers so hub shows placeholder
- `nodeEdits.clear()` — clears textarea edits (map is being "reset")
- `_expandedId` → `null` via `collapseNode()` (if anything is expanded)
- `_canvasCentred = false` — forces re-centering on next canvas visit

---

## Sub-problem 3: Onboarding → node population

### Current behavior
- Hub: `userData.future` as body text ✅
- Career node: static header; goals prepend future snippet only if area=career
- All other nodes: fully static

### Acceptance criteria requirement
"Career node content from q1 and q4 selection" — so career header/goals should use
`userData.now` (q1) and `userData.area` (q4) context.
"Remaining nodes with sensible defaults derived from answers."

### Option A — Derive content entirely at render time in renderCategoryNodes
Add a `deriveNodeContent(cat, userData)` function that returns `{header, goals}` overrides
for each node based on userData. Call it inside renderCategoryNodes to override static values.

Pros: CATEGORY_NODES remains the source of truth for layout (wx, wy, width, height, shape,
color). Dynamic content is cleanly separated.
Cons: adds ~40 lines of derivation logic.

### Option B — Mutate CATEGORY_NODES before rendering
Call `populateNodes(userData)` before `renderCategoryNodes` to overwrite header/goals fields.

Pros: simpler.
Cons: CATEGORY_NODES mutation is non-idempotent; on second render the first-pass values are
gone. Requires re-seeding from a separate defaults object. More fragile.

**Decision: Option A.** `deriveNodeContent` is pure and doesn't modify CATEGORY_NODES.

### Derivation logic (career node — q1 + q4)
```
if area === 'career':
  header: use first sentence or 50 chars of userData.now (q1)
  goals: area-specific + generic career goals
if area === 'money':
  finances node: inject future snippet into header
  career node: keep static default
etc.
```

Specifically for career (the one called out in the AC):
- `areaKey === 'career'` node: if `userData.area === 'career'`, set header to a 50-char
  truncation of `userData.now`, or keep "I work at a company I love" if now is empty.
- Goals: prepend "Level up: " + area label string if area matches.

For all other nodes: keep static header/goals as sensible defaults (they already are
reasonable defaults for a 5-year map). The area match for future-text prepend on goals
already covers the "derived from answers" requirement for the focused node.

### Decision: minimal, targeted enrichment
Only the career/area-matched node gets dynamic header/goals. All other nodes keep static
content. This is sufficient to satisfy the AC without over-engineering personalisation.

---

## Sub-problem 4: Dead code removal

The following can be deleted cleanly:
- JS functions `generateGaps()`, `generateLevers()`, `generateMoves()` (never called post-T-001-01)
- CSS classes `.mindmap`, `.node`, `.node h4`, `.node-content`, `.connector` (no HTML uses them)
- The `getPersonaContent` function only handles `socrates` — other persona types fall back to
  socrates. Leave this as-is (it's live code for page5).

**Approach:** simple line-range deletions. No behavior change.

---

## Sub-problem 5: Page4/5 ↔ Page3 round-trip

### State that must survive
- `nodeEdits` Map — survives navigateToPage (module-level Map, not cleared on navigate) ✅
- Canvas pan/zoom — `CanvasTransform` state survives (not reset between page3↔4↔5) ✅
  Wait: the patch calls `CanvasTransform.reset(); applyTransform();` when leaving canvas-mode
  (non-3 branch). That resets position to 0,0. But `_canvasCentred` remains true, so on
  return to page3, no re-centering is applied... and CanvasTransform was just reset to 0,0.
  This means pan position IS lost but centering is also not re-applied. This is a pre-existing
  bug. Fix: do NOT reset CanvasTransform when navigating away temporarily (to page4/5).
  Only reset when user explicitly goes back to form (confirmed back).

**Fix for pan state:** Remove `CanvasTransform.reset(); applyTransform();` from the
"leave canvas-mode" branch, OR only reset when `n === 2` (back to form, user confirmed).

**Decision:** Only reset CanvasTransform on confirmed back-to-form. On page4/5 navigation,
do not reset. This preserves the user's zoom/pan when returning.

However: `canvas-mode` must still be removed from body when going to page4/5 (to restore
normal scroll layout). The CanvasTransform state just shouldn't be reset.

---

## Final Design Summary

Changes to `mindshift.html`:

1. **HTML (page3 section):** Add `#canvas-lens-btn` and `#canvas-back-btn` inside `#canvas-root`.
2. **CSS:** Add styles for `#canvas-lens-btn` and `#canvas-back-btn` in canvas section.
3. **JS — navigateToPage patch:** Remove CanvasTransform.reset on leave; only reset on confirmed back-to-form.
4. **JS — new `deriveNodeContent(cat, userData)`** function; call in `renderCategoryNodes`.
5. **JS — back button handler:** confirm dialog, reset userData/nodeEdits/_canvasCentred, navigate(2).
6. **JS — delete** `generateGaps`, `generateLevers`, `generateMoves`.
7. **CSS — delete** `.mindmap`, `.node`, `.node h4`, `.node-content`, `.connector` rules.
