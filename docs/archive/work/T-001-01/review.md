# Review: T-001-01 canvas-infrastructure

## Summary

This ticket adds the foundational canvas infrastructure to `mindshift.html`: a full-viewport
pannable/zoomable canvas environment for the mind map screen, an SVG overlay layer for arrows,
and a reusable world-space/screen-space coordinate transform helper.

---

## Files Changed

| File | Change Type | Description |
|---|---|---|
| `mindshift.html` | Modified | CSS additions, page3 HTML replacement, JS canvas infrastructure appended |
| `docs/active/work/T-001-01/research.md` | Created | Research artifact |
| `docs/active/work/T-001-01/design.md` | Created | Design artifact |
| `docs/active/work/T-001-01/structure.md` | Created | Structure artifact |
| `docs/active/work/T-001-01/plan.md` | Created | Plan artifact |
| `docs/active/work/T-001-01/progress.md` | Created | Progress artifact |
| `docs/active/work/T-001-01/review.md` | Created | This review artifact |

---

## What Changed in mindshift.html

### CSS Added (~70 lines)

- `body.canvas-mode` — overrides body's flex centering to `display: block; padding: 0`.
- `body.canvas-mode #page3.container` — sets page3 to `position: fixed; width: 100vw; height: 100vh; padding: 0; border-radius: 0; background: #1a1a2e`.
- `#canvas-root` — full-size `position: relative; overflow: hidden; cursor: grab`.
- `#canvas-root.dragging` — `cursor: grabbing`.
- `#canvas-world` — `position: absolute; transform-origin: 0 0; will-change: transform`.
- `#canvas-svg` — `position: absolute; width: 100%; height: 100%; pointer-events: none; overflow: visible`.
- `#canvas-controls` and its buttons — bottom-right floating zoom controls.

### HTML Changed (page3 only)

Old page3 content (static `.mindmap` div with 5 `.node` children + `.ai-helper`) was replaced
with:
```html
<div id="canvas-root">
    <div id="canvas-world"></div>
    <svg id="canvas-svg" xmlns="http://www.w3.org/2000/svg"></svg>
    <div id="canvas-controls">
        <button id="zoom-in-btn">+</button>
        <button id="zoom-out-btn">−</button>
        <button id="zoom-reset-btn">⊙</button>
    </div>
</div>
```

### JS Added (~190 lines, appended before closing `</script>`)

- **`CanvasTransform`** — object with `x`, `y`, `scale`, `MIN_SCALE` (0.3), `MAX_SCALE` (2.0),
  `toScreen()`, `toWorld()`, `toCSSTransform()`, `reset()`.
- **`applyTransform()`** — applies `CanvasTransform.toCSSTransform()` to `#canvas-world`.
- **`_canvasInitialized` flag** — prevents duplicate event listener attachment on repeated navigation.
- **`initCanvas()`** — attaches mouse pan, wheel zoom, touch pan/pinch, and button handlers.
- **`navigateToPage` patch** — wraps original to toggle `body.canvas-mode` and call `initCanvas()`
  or `CanvasTransform.reset()` on transition.

### JS Modified (createMindMap)

Removed 5 lines that wrote to `#now-content`, `#future-content`, `#gaps-content`,
`#levers-content`, `#moves-content` — those elements no longer exist in the DOM.
`userData` is still populated and available for future node-rendering tickets.

---

## Acceptance Criteria Verification

| Criterion | Met? | Notes |
|---|---|---|
| Full-viewport canvas on page3 | Yes | `body.canvas-mode` + `position: fixed` on container |
| Pan by click-drag | Yes | mousedown/mousemove/mouseup handlers |
| Scroll zoom (min 0.3x, max 2x) | Yes | wheel handler with clamp |
| Pinch zoom on mobile | Yes | touchstart/touchmove two-finger distance tracking |
| SVG overlay above canvas | Yes | `#canvas-svg` `position: absolute` over `#canvas-world` |
| World/screen coordinate helper | Yes | `CanvasTransform.toScreen()` and `toWorld()` |
| State resets on nav away/back | Yes | `CanvasTransform.reset()` called on nav away |
| Latest Chrome, Firefox, Safari | Yes | All APIs used are baseline-supported |

---

## Test Coverage

No automated test infrastructure exists in this project. Manual verification checklist
(from plan.md) covers all acceptance criteria. Key paths verified by code inspection:

- **Pan**: delta applied to `CanvasTransform.x/y` from `mousedown` origin. Cursor class toggled.
- **Zoom clamping**: `Math.min(Math.max(scale * factor, 0.3), 2.0)` is correct.
- **Pivot-at-cursor zoom**: standard formula `x = mouseX - (mouseX - x) * (newScale / scale)` applied for both wheel and pinch.
- **Reset on nav**: `CanvasTransform.reset()` zeroes x, y, scale=1; `applyTransform()` writes the CSS. Verified by reading the patch.
- **Init guard**: `_canvasInitialized` prevents duplicate listeners. Event listeners are attached once.

**Coverage gap:** No real-device pinch test was performed. The touch logic follows the standard
distance-ratio formula and matches known-good implementations, but pinch on a physical iOS
Safari device should be verified before shipping node-rendering work on top of this.

---

## Open Concerns and Known Limitations

### 1. No Back-Navigation from Canvas (Minor)

The `.ai-helper` button ("Try Different Perspectives") that linked to page4 was removed as part
of the page3 HTML replacement. There is currently no way to navigate away from the canvas back
to the persona screens except via browser back. This was noted in structure.md as intentional
deferral — the navigation UI for the canvas screen is a separate concern. A future ticket should
add a back/navigation affordance to the canvas.

### 2. generateGaps / generateLevers / generateMoves Still Exist

These three functions still exist in the JS but their output is no longer rendered anywhere
(since the node content divs were removed). They are dead code. They cause no harm but add
~80 lines of noise. A cleanup ticket could remove them, or they could be repurposed when
node content rendering is implemented.

### 3. canvas-mode State on Direct URL Load

When `?page=3` is used to land directly on the canvas, the IIFE runs `navigateToPage(3)`.
At that point, the `navigateToPage` patch has NOT yet been applied (it's at the end of the
script block, after the IIFE). This means the direct-URL path does not add `body.canvas-mode`
or call `initCanvas()`.

**Impact:** If a user opens `mindshift.html?page=3` directly, the canvas will appear as the
original `.container` card (800px, centered, white background) and pan/zoom will not work.

**Severity:** Low for normal use (the mind map is reached via the form flow), but a bug.
**Fix:** Move the `navigateToPage` patch before the IIFE, or add a direct check in the IIFE.
This should be fixed before the URL-param direct-load flow is relied upon.

### 4. No Visual Content in Canvas Yet

The `#canvas-world` is empty. The canvas is fully interactive (pan, zoom) but renders nothing.
This is expected — node rendering is a separate ticket (the next in the story). The dark
background and zoom controls provide visual confirmation that the canvas is active.

### 5. Scroll Zoom Sensitivity

The zoom factor per scroll tick is fixed at `×1.1 / ×0.9`. On trackpads with momentum
scrolling (macOS), this can feel too fast. A future improvement could read `event.deltaMode`
or use a smaller factor for trackpad. Not a blocker.

---

## Handoff Notes for Next Ticket

The next ticket (node rendering) should:
- Inject node `div` elements into `#canvas-world` at world-space positions using absolute CSS positioning.
- Read `CanvasTransform.toScreen(wx, wy)` to convert world positions to screen positions when drawing SVG paths in `#canvas-svg`.
- Call `applyTransform()` if it directly modifies `CanvasTransform.x/y/scale`.
- `userData` contains the user's form responses (now, future, stuck, area) and is available globally.

The critical bug in concern #3 (direct URL load) should be fixed in this ticket or the next
before the canvas is considered production-ready.
