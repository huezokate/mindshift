# Design: T-001-01 canvas-infrastructure

## Problem Statement

Page3 must become a full-viewport, pannable, zoomable canvas with an SVG layer, replacing
the current static 800px card layout. The implementation must be vanilla JS in a single HTML
file and must reset state when the user navigates away and returns.

---

## Option A: CSS Override on Body When Page3 is Active

When page3 becomes active, add a class to `body` (e.g., `body.canvas-mode`) that overrides
its flex/centering styles and sets page3's `.container` to full-viewport sizing.

**Approach:**
```css
body.canvas-mode {
    display: block;
    padding: 0;
    background: none;
}
body.canvas-mode #page3.container {
    max-width: 100vw;
    width: 100vw;
    height: 100vh;
    padding: 0;
    border-radius: 0;
    box-shadow: none;
    overflow: hidden;
    position: fixed;
    top: 0; left: 0;
}
```

`navigateToPage` is patched to add/remove the class.

**Pros:**
- Minimal structural change. Existing `.container` logic and other pages untouched.
- Clean separation: canvas-specific overrides scoped to `body.canvas-mode`.
- Easy to reset: remove the class when navigating away.

**Cons:**
- CSS specificity dance between the overrides and existing `.container` rules.
- `position: fixed` on the container means it's taken out of flow — fine since body is otherwise
  hidden when only page3 is active.

---

## Option B: Move Page3 Outside the Normal Flow

Move `#page3` to be a sibling of `body` — or more practically, move it outside the flex
container entirely by giving it `position: fixed` inherently (not just in canvas mode).

**Approach:**
```css
#page3 {
    position: fixed;
    top: 0; left: 0;
    width: 100vw;
    height: 100vh;
    /* override container defaults */
    max-width: none;
    padding: 0;
    ...
}
```

**Pros:**
- No JS involvement in layout switching.
- Always full-viewport regardless of class toggling.

**Cons:**
- Page3 becomes an always-fixed element even when hidden, which is fragile.
- Every other screen's layout is unaffected, but page3 becomes a special case baked into CSS,
  making the pattern inconsistent and confusing.
- Can't easily add transition animations for entering page3.

---

## Option C: Replace navigateToPage with a Full Router

Introduce a proper page lifecycle with `onEnter`/`onLeave` callbacks for each page.

**Approach:**
```js
const pages = {
    3: {
        onEnter: () => initCanvas(),
        onLeave: () => destroyCanvas()
    }
};
```

**Pros:**
- Most architecturally clean for a growing app.
- Clear lifecycle for initialization and teardown.

**Cons:**
- Significant refactor of the navigation system.
- Over-engineered for the current single-file, no-framework constraint.
- Ticket scope is canvas infrastructure only — a full router is not required.

---

## Decision: Option A with a Patched navigateToPage

**Rationale:**
- Option A has the smallest blast radius. Only page3's visual behavior changes.
- The patch to `navigateToPage` is minimal (3–4 lines) and readable.
- Option B bakes page3 as a permanent special case in CSS, which is harder to reason about.
- Option C is premature for this ticket.

The implementation will:
1. Add `body.canvas-mode` CSS overrides that make page3 fill the viewport.
2. Wrap/patch `navigateToPage` to toggle `canvas-mode` on `body` and call canvas reset.
3. Build the canvas internals inside page3's DOM.

---

## Canvas Architecture

### DOM Structure Inside Page3

```
#page3 (full-viewport container)
└── #canvas-root (position: relative, width: 100%, height: 100%, overflow: hidden)
    ├── #canvas-world (position: absolute, transform: translate + scale origin 0 0)
    │   └── (node elements go here, positioned absolutely in world space)
    └── #canvas-svg (position: absolute, top/left 0, width/height 100%, pointer-events: none)
        └── (SVG <path> and <line> elements for arrows)
```

**Why two layers?**
- `#canvas-world` moves and scales with pan/zoom. Nodes live here.
- `#canvas-svg` is fixed in screen space but its coordinate system is set to world space
  via `viewBox` (or its children use screen-space transforms). Arrows connect world-space nodes,
  so their endpoints must be translated to screen space before drawing in SVG.

**SVG approach — fixed screen overlay with JS-computed coordinates:**
The SVG stays `position: absolute, top:0, left:0, width:100%, height:100%`. Arrow endpoints
are world-space coordinates transformed to screen space on every redraw. This is simpler than
using SVG's own `viewBox` tracking and is the standard approach for canvas+SVG hybrid UIs.

---

## Coordinate Transform Helper

A single object `CanvasTransform` encapsulates the pan/zoom state:

```js
const CanvasTransform = {
    x: 0,         // pan offset x (screen pixels)
    y: 0,         // pan offset y (screen pixels)
    scale: 1,     // zoom factor
    MIN_SCALE: 0.3,
    MAX_SCALE: 2.0,

    // World coords → screen coords
    toScreen(wx, wy) {
        return {
            x: wx * this.scale + this.x,
            y: wy * this.scale + this.y
        };
    },

    // Screen coords → world coords
    toWorld(sx, sy) {
        return {
            x: (sx - this.x) / this.scale,
            y: (sy - this.y) / this.scale
        };
    },

    // Apply to CSS transform string
    toCSSTransform() {
        return `translate(${this.x}px, ${this.y}px) scale(${this.scale})`;
    },

    reset() {
        this.x = 0; this.y = 0; this.scale = 1;
    }
};
```

This encapsulation satisfies the acceptance criterion: "world space vs screen space is
encapsulated in a reusable transform helper so node positioning and arrow drawing can
use world coordinates."

---

## Pan Interaction

- `mousedown` on `#canvas-root`: begin drag, record `startX`, `startY`, current `CanvasTransform.x/y`.
- `mousemove` on `document` (while dragging): delta = current - start; update `CanvasTransform.x/y`; apply CSS transform.
- `mouseup` / `mouseleave` on document: end drag.
- Cursor: `grab` normally, `grabbing` while dragging.

**Drag on child elements:** Need to prevent drag from interfering with future node interactions.
Use `pointer-events: none` on `#canvas-svg` (already planned). Node elements will handle
their own pointer events but must call `stopPropagation` to avoid triggering pan.

---

## Zoom Interaction

- `wheel` event on `#canvas-root`: read `event.deltaY`.
- Zoom toward cursor position (pivot at mouse): compute mouse position in world space before
  and after scaling; adjust pan offset so the world point under the cursor stays fixed.
- Clamp `scale` to `[0.3, 2.0]`.
- `event.preventDefault()` to suppress page scroll.

**Pivot zoom formula:**
```
newScale = clamp(scale * factor, MIN, MAX)
// keep world point under cursor fixed:
x = mouseX - (mouseX - x) * (newScale / scale)
y = mouseY - (mouseY - y) * (newScale / scale)
scale = newScale
```

---

## Pinch Zoom (Mobile / Touchpad)

- `touchstart`: record two touch points, initial distance.
- `touchmove`: compute new distance ratio; apply zoom pivot at midpoint; also handle pan from midpoint movement.
- `touchend`: clean up.

---

## State Reset

`navigateToPage` is patched:

```js
const _origNavigate = navigateToPage;
navigateToPage = function(pageNum) {
    if (pageNum === 3) {
        document.body.classList.add('canvas-mode');
    } else {
        document.body.classList.remove('canvas-mode');
        CanvasTransform.reset();
        applyTransform();
    }
    _origNavigate(pageNum);
};
```

When navigating away from page3, the transform resets. When returning to page3, the canvas
is already built in the DOM (built once on first entry) and resets to origin.

---

## Rejected Options

| Idea | Why Rejected |
|---|---|
| Use `<canvas>` element for rendering | SVG is better for arrows (scalable, no pixel math). Nodes are HTML divs, not canvas drawings. |
| Transform via `viewBox` on SVG root | Complex to sync with pan/zoom. Screen-space SVG with JS coordinate conversion is simpler. |
| CSS `transform-origin: center center` | Zoom-to-cursor requires `transform-origin: 0 0` + manual offset calculation. |
| `wheel` with `deltaMode` normalization | Not needed for "latest Chrome/Firefox/Safari" — `deltaY` in pixel mode is consistent enough. |
| Full router / lifecycle (Option C) | Overkill for this ticket scope. |
