# Review: T-001-02 central-hub-node

## Summary of Changes

### Files Modified

| File | Change |
|---|---|
| `mindshift.html` | +50 CSS lines (hub node styles), +35 JS lines (HUB_CATEGORIES + renderHubNode), +10 JS lines (extended navigateToPage patch). Net +~95 lines. |

### Files Created

| File | Purpose |
|---|---|
| `docs/active/work/T-001-02/research.md` | Research artifact |
| `docs/active/work/T-001-02/design.md` | Design artifact |
| `docs/active/work/T-001-02/structure.md` | Structure artifact |
| `docs/active/work/T-001-02/plan.md` | Plan artifact |
| `docs/active/work/T-001-02/progress.md` | Progress/completion artifact |
| `docs/active/work/T-001-02/review.md` | This file |

### Commit

`fdebe82` — T-001-02: add central hub node — renders at canvas centre, shows vision text

---

## Acceptance Criteria Evaluation

| Criterion | Status | Notes |
|---|---|---|
| Central node renders at canvas centre on load | ✅ | `_canvasCentred` flag sets `CanvasTransform.x/y = vw/2, vh/2` before `initCanvas()` on first visit; hub element is `transform: translate(-50%,-50%)` at world (0,0) |
| Displays `userData.future` (q2 text) | ✅ | `renderHubNode()` reads `userData.future`, sets it as `.hub-body` textContent |
| Displays subtitle listing life categories | ✅ | `HUB_CATEGORIES.join(' · ')` rendered in `.hub-subtitle` |
| Distinct visual style (larger, different shape) | ✅ | Oval `border-radius: 50%/35%`, 280px wide, glass-morphism; will be visually distinct from planned satellite nodes |
| Clicking hub does nothing | ✅ | `pointer-events: none` on `#hub-node`; clicks fall through to canvas pan handler |
| Text wraps at max-width; no overflow | ✅ | `max-width: 280px; word-wrap: break-word; -webkit-line-clamp: 5; max-height: 120px` |
| No-data placeholder text | ✅ | Falls back to "Your 5-year vision will appear here." in italic/muted style when `userData.future` is empty |

---

## Test Coverage

No automated tests. Project has no test infrastructure (vanilla HTML, single
file, no bundler). Manual verification scenarios listed in plan.md step 4.

**Gaps:**
- No regression test for re-entrant navigation (page 3 → 4 → 3 loop). Covered
  by the `_canvasCentred` guard and idempotent hub creation (`getElementById`
  check), but only verified by code reading, not by an automated test.
- No test for very long q2 input. CSS `-webkit-line-clamp: 5` handles this in
  WebKit/Blink browsers; behaviour in Firefox (which ignores the legacy property
  syntax) is unverified. Firefox will let the text overflow `max-height: 120px`
  unless the `overflow: hidden` rule clips it — which it does, so worst case the
  text is cut off without the ellipsis indicator.

---

## Open Concerns

1. **Firefox line-clamp**: `-webkit-line-clamp` is WebKit/Blink only. The
   standard `line-clamp` property is not yet widely supported. Firefox will clip
   via `max-height: 120px; overflow: hidden` but won't show an ellipsis. Low
   priority given the lo-fi nature of this build, but worth revisiting before
   production.

2. **Initial centring fires only once**: `_canvasCentred` is never reset. If the
   user navigates away from page 3 and the viewport is resized before returning,
   the hub will be off-centre. Acceptable for now; the zoom-reset button recentres
   the transform manually.

3. **Category list is static**: `HUB_CATEGORIES` is hardcoded. The ticket says
   the subtitle should list "categories that have satellite nodes." When satellite
   nodes are added (future tickets), this list may need to be dynamic (only
   include categories with data). For now, all 7 are always shown, which matches
   the lo-fi Figma.

4. **No animation on hub appear**: The node snaps in synchronously. A fade-in
   would match the canvas's visual language better. Low priority for this ticket;
   can be added in a polish pass.

5. **Hub does not re-read userData on back-navigation**: If a user hypothetically
   edits page 2 and returns to page 3, the hub content won't update because
   `_canvasCentred` and the `hub-node` DOM element already exist. This is an edge
   case not described in the ticket, and the current linear flow doesn't expose
   a path from page 3 back to page 2.

---

## What a Reviewer Needs to Know

The implementation is confined to a single section of `mindshift.html`. The three
logical additions are clearly delineated with `/* === Hub Node (T-001-02) === */`
and `// --- Hub Node (T-001-02) ---` comments. The change to the
`navigateToPage` patch is additive; the T-001-01 else-branch is untouched.

The hub node sits at world coordinate (0,0) inside `#canvas-world`. Its
`transform: translate(-50%,-50%)` means its visual centre is at (0,0). The
canvas pan is initialised to `(vw/2, vh/2)` so world (0,0) maps to the
screen centre, making the hub appear centred on first load.

No other existing functionality is affected.
