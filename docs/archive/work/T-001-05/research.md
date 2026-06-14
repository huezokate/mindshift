# Research: T-001-05 node-expand-detail

## Scope

Understand the existing canvas, node rendering, and interaction code to inform the
expand-in-place detail panel. All work lives in `mindshift.html` (single-file vanilla
HTML/CSS/JS, no build step).

---

## File Map

```
mindshift.html
  ├── <style>                     lines 7–528
  │   ├── General UI              lines 7–464
  │   └── Category Nodes (T-001-03)  lines 465–528
  ├── <body>
  │   ├── #page1–#page2           linear wizard
  │   ├── #page3                  canvas shell
  │   │   └── #canvas-root
  │   │       ├── #canvas-world   transform target; nodes live here
  │   │       ├── #canvas-svg     SVG overlay
  │   │       └── #canvas-controls  zoom buttons
  │   └── #page4, #page5          persona pages
  └── <script>                    lines 655–1200
      ├── navigateToPage()        lines 658–661
      ├── createMindMap()         lines 688–707
      ├── Canvas Infrastructure   lines 815–990  (T-001-01)
      ├── Hub Node                lines 992–1025 (T-001-02)
      └── Category Nodes          lines 1055–1174 (T-001-03)
```

---

## Canvas Architecture

### Transform Model

`CanvasTransform` (lines 817–847) holds `{ x, y, scale }`.
`applyTransform()` (lines 849–852) writes
`translate(${x}px, ${y}px) scale(${scale})` onto `#canvas-world`.

All node coordinates are **world-space** (integer px centred at origin 0,0).
Nodes are children of `#canvas-world`, so they inherit the CSS transform.
To convert world coords to screen coords:
```
screenX = wx * scale + transformX
screenY = wy * scale + transformY
```

### Pan Interaction

`initCanvas()` (lines 856–990) attaches:
- `mousedown` on `#canvas-root` → sets `dragging = true`, calls `e.preventDefault()`
- `mousemove` / `mouseup` on `document` → update `CanvasTransform`
- `wheel` on `#canvas-root` → zoom toward cursor
- Touch events for mobile pan/pinch-zoom

`e.preventDefault()` on mousedown prevents text selection but does **not** prevent
`click` events. Since click fires after mousedown+mouseup with minimal pointer
movement, node click handlers still fire normally.

---

## Category Node Rendering (T-001-03)

### Data: `CATEGORY_NODES` (lines 1057–1135)

Array of 7 objects:
```js
{
  id, label, colorClass, shapeClass,
  width, height,   // collapsed px dimensions
  wx, wy,          // world-space centre coords
  header,          // italicised affirmation text
  goals[],         // 3 bullet strings
  areaKey          // matches userData.area for future-text injection
}
```

Sizes range from 158–180 × 135–195 px.

### Rendering: `renderCategoryNodes(userData)` (lines 1137–1169)

- Idempotent: removes all existing `.canvas-node` elements, then rebuilds them.
- Positions each node at `left = wx - width/2`, `top = wy - height/2`.
- Inner HTML: `.cn-label` + `.cn-header` + `.cn-goals` ul.
- Wires `click` listener: `el.addEventListener('click', () => onNodeClick(cat.id))`.

**Critical implication:** every call to `renderCategoryNodes` destroys and re-creates
all nodes, discarding any DOM state (expanded class, textarea content, etc.) unless
goal edits are stored externally.

### Stub: `onNodeClick(categoryId)` (lines 1171–1174)

```js
function onNodeClick(categoryId) {
    // T-001-05: expand node detail panel
    console.log('node clicked:', categoryId);
}
```

This is the sole extension point for T-001-05.

---

## CSS Constraints on Expansion

### Clip-path shapes

Five of the seven nodes use clip-path:

| ID            | Shape class         | clip-path value                                       |
|---------------|---------------------|-------------------------------------------------------|
| career        | cn-shape-ellipse    | `ellipse(50% 42% at 50% 50%)`                        |
| creativity    | cn-shape-triangle   | `polygon(50% 0%, 100% 87%, 0% 87%)`                  |
| health        | cn-shape-diamond    | `polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)`        |
| relationships | cn-shape-blob       | `polygon(20% 0%, 82% 8%, 100% 55%, 62% 100%, 0% 82%)`|
| travel        | cn-shape-pentagon   | `polygon(50% 0%, 100% 35%, 82% 100%, 18% 100%, 0% 35%)`|

The two rect nodes (`finances`, `living`) use `border-radius: 16px` only — no clip-path.

**Consequence:** if an expanded node grows in-place while retaining its clip-path, the
extra content will be clipped. The clip region scales proportionally with the element
dimensions (percentage values), so even a larger element stays clipped to the same
proportional shape.

### `overflow: hidden`

`.canvas-node` has `overflow: hidden` (line 476). Any content that extends past the
element's bounding box is hidden.

### `transition` on `.canvas-node`

Already has `transition: transform 0.15s ease, filter 0.15s ease` (line 474).
Expanding width/height via CSS would also transition if `width`, `height`, and/or
`clip-path` are added to the transition property.

---

## Session State

`userData` global (line 656) holds `{ now, future, stuck, area }`. No per-node goal
storage exists. T-001-05 needs to introduce a storage mechanism for edited goals so
that:
- Edits survive `renderCategoryNodes` re-runs (which destroy DOM).
- Edits survive navigation away from page 3 and back (within the same session).

---

## Interaction Boundaries

### Pan vs. node interaction

The canvas pan attaches `mousedown` on `#canvas-root` with `e.preventDefault()`.
If a node is expanded and the user interacts with its textarea or scrolls, those
events bubble up to the root and trigger panning. Propagation must be stopped on
the expanded node.

### Click outside to collapse

The existing pan `mousedown` on `#canvas-root` is a natural "click outside" signal,
but only if it doesn't also drag. A simple approach: track whether a drag occurred;
if the mouseup had negligible movement, treat it as a "click outside" and collapse.

Alternatively, listen for `click` on `#canvas-root` (which bubbles from outside
the expanded node) and collapse. This is simpler.

### Escape key

No keyboard listener exists yet. Need to add `keydown` on `document` for Escape.

---

## Z-index

No `z-index` is currently set on `.canvas-node`. To ensure expanded node sits above
others, set a higher `z-index` on the expanded element.

---

## Open Questions for Design

1. How should shape → rounded-rect visual transition work when clip-path is removed?
2. Does the expanded node stay in world-space (scrolls/zooms with canvas) or fixed
   to screen?
3. Where are edited goals persisted — module-level Map, or piggybacked on `CATEGORY_NODES`?
4. Should `renderCategoryNodes` become non-destructive so it preserves expanded state?
