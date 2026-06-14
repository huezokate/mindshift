# Research: T-001-03 category-nodes

## Overview

This ticket adds 7 satellite nodes to the mind map canvas introduced in T-001-01. The nodes orbit a central hub, each with an organic shape, category label, header aspiration, and bullet goals.

---

## File Inventory

### `mindshift.html` (single-file app, ~921 lines)

All HTML, CSS, and JS live inline. Key sections:

| Lines | Content |
|---|---|
| 1–332 | Global CSS (containers, buttons, forms, personas) |
| 334–413 | Canvas-mode CSS added by T-001-01 |
| 414–538 | Page HTML (page1–page2, loading overlay) |
| 466–474 | Page 3 HTML — canvas root, world div, SVG layer, zoom controls |
| 540–918 | `<script>` block — all JS |
| 700–875 | Canvas infrastructure block (T-001-01) |
| 905–917 | `navigateToPage` patch (T-001-01) |

---

## Canvas Infrastructure (T-001-01 deliverables)

### DOM structure

```
#page3.container   (full-viewport in canvas-mode)
  #canvas-root     (overflow:hidden, cursor:grab)
    #canvas-world  (absolutely positioned, transform-origin:0 0)
    #canvas-svg    (absolutely positioned, pointer-events:none, overflow:visible)
    #canvas-controls
```

`#canvas-world` is the world-space container — all HTML nodes go here.
`#canvas-svg` is the SVG layer — arrows and clip-path defs go here.
`CanvasTransform` stores `{x, y, scale}` and drives a CSS matrix transform on `#canvas-world`.

### CanvasTransform API

```js
CanvasTransform.x, .y, .scale        // current state
CanvasTransform.MIN_SCALE = 0.2
CanvasTransform.MAX_SCALE = 4.0
CanvasTransform.reset()              // x=0, y=0, scale=1
CanvasTransform.toCSSTransform()     // returns matrix(...) string
```

### `initCanvas()`

- Protected by `_canvasInitialized` flag — idempotent.
- Wires mouse/wheel/touch events on `#canvas-root`.
- Calls `applyTransform()` once on entry.

### `applyTransform()`

```js
function applyTransform() {
    const world = document.getElementById('canvas-world');
    if (world) world.style.transform = CanvasTransform.toCSSTransform();
}
```

### `createMindMap()`

Reads four form fields (`q1–q4`) into `userData`, shows loading overlay, then calls `navigateToPage(3)` after 2.5s. Currently does nothing with the canvas — no hub or nodes are rendered.

### `navigateToPage` patch

When navigating to page 3: adds `canvas-mode` to `<body>`, calls `initCanvas()`.
When leaving page 3: removes `canvas-mode`, resets transform.

---

## userData Shape

After `createMindMap()` runs:

```js
userData = {
    now:    string,   // q1 — current state
    future: string,   // q2 — 5-year vision
    stuck:  string,   // q3 — what's blocking
    area:   string,   // q4 — life area dropdown (career|money|relationships|health|creativity)
}
```

`userData.area` selects one primary category. The other 6 categories will use placeholder content.

---

## Figma Lo-fi Reference (from ticket + CLAUDE.md)

Seven nodes, each with distinct organic shape:

| # | Category | Shape |
|---|---|---|
| 1 | Career | Ellipse |
| 2 | Creativity | Triangle (regular polygon) |
| 3 | Health & Wellness | Diamond (rotated square) |
| 4 | Relationships | Irregular blob/triangle |
| 5 | Travel | Pentagon / irregular blob |
| 6 | Finances | Rounded rectangle |
| 7 | Living Situation | Tall rounded rectangle (with photo grid placeholder) |

Clock-face layout around a central hub. Positions are hardcoded world coordinates (not computed dynamically — ticket requirement).

---

## Existing Node-Related CSS

Lines 133–158 define `.node`, `.node h4`, `.node-content`, `.connector` — these are the old linear-list mind map styles from the pre-canvas era and are unrelated to the spatial canvas nodes. They do not conflict but should not be reused.

---

## Constraints

1. **Vanilla HTML/CSS/JS** — no framework, no build step.
2. **Single file** — all additions go into `mindshift.html`.
3. **No dynamic position computation** — positions are hardcoded world-space constants.
4. **Goal content from `userData`** — the category matching `userData.area` gets the user's actual text; others use placeholder content.
5. **Clip shapes via SVG** — organic shapes require either CSS clip-path with polygon/ellipse, or SVG `<clipPath>` with a `<path>`. Both are viable.
6. **Hover state required** — subtle highlight or scale (CSS transition on the node element).
7. **Click handler wired** — detail expansion deferred to T-001-05.
8. **SVG layer (`#canvas-svg`)** is declared `pointer-events: none` — click handlers must go on HTML elements in `#canvas-world`.

---

## Adjacent Tickets

- **T-001-01 (done)**: Canvas infrastructure — pan, zoom, SVG layer. This ticket builds on it.
- **T-001-02**: Central hub node — likely adds a hub element to `#canvas-world`. May or may not be complete; its presence doesn't block this ticket since nodes position themselves independently.
- **T-001-05**: Node detail expansion — click handlers wired here, behaviour implemented there.
- **T-001-06**: Mood board images inside nodes — photo grid placeholder space is reserved here.

---

## Key Questions / Assumptions

1. **Hub position**: If T-001-02 is done, the hub sits at world origin (0,0) or near it. This ticket's nodes should be positioned relative to that same world origin.
2. **Clip approach**: `clip-path` (CSS) is simpler for ellipse/polygon shapes but limited for true blobs. SVG `<clipPath>` + `<path>` is more flexible but requires registering defs in `#canvas-svg`.
3. **Initial pan offset**: `CanvasTransform.reset()` puts the world at (0,0) with scale 1. The canvas container is full-viewport. The hub will be at screen position equal to its world position offset. We should center the canvas on the hub when navigating to page 3 — likely done in `createMindMap()` or `initCanvas()`.
4. **Content generation**: Since there's no AI integration yet, goal bullets are hardcoded per category, with the user's primary area showing `userData.future`/`userData.stuck` as supplementary text.
