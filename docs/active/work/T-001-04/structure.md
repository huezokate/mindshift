# Structure: T-001-04 svg-arrow-connections

## File-Level Changes

| File | Change |
|---|---|
| `mindshift.html` | Modified — ~60 lines added |
| `docs/active/work/T-001-04/research.md` | Created (this workflow) |
| `docs/active/work/T-001-04/design.md` | Created (this workflow) |
| `docs/active/work/T-001-04/structure.md` | Created (this workflow) |
| `docs/active/work/T-001-04/plan.md` | Created (this workflow) |
| `docs/active/work/T-001-04/progress.md` | Created (this workflow) |
| `docs/active/work/T-001-04/review.md` | Created (this workflow) |

---

## Changes Inside `mindshift.html`

### A — CSS addition (~8 lines)

Location: after `/* === Category Nodes (T-001-03) === */` block, around line 580.

```css
/* === Arrow Connectors (T-001-04) === */
#canvas-arrows {
    position: absolute;
    left: 0;
    top: 0;
    width: 0;
    height: 0;
    overflow: visible;
    pointer-events: none;
    z-index: 0;
}
```

This is minimal — most arrow styling is done via SVG attributes on the `<path>` elements
directly. The CSS class exists only to document the element in the stylesheet section.

### B — JS addition (~50 lines)

Location: after `// --- Category Nodes (T-001-03) ---` section and before the
`navigateToPage` patch (currently around line 1176).

#### New section header comment
```js
// --- Arrow Connectors (T-001-04) ---
```

#### Helper: `ellipseEdge(cx, cy, rx, ry, tx, ty)`
Returns the point on an axis-aligned ellipse centered at (cx,cy) with half-axes (rx,ry)
in the direction toward (tx,ty).

```js
function ellipseEdge(cx, cy, rx, ry, tx, ty) {
    const dx = tx - cx, dy = ty - cy;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return { x: cx, y: cy };
    const ux = dx / len, uy = dy / len;
    const t = 1 / Math.sqrt((ux / rx) * (ux / rx) + (uy / ry) * (uy / ry));
    return { x: cx + ux * t, y: cy + uy * t };
}
```

#### Constant: `ARROW_OFFSETS`
```js
const ARROW_OFFSETS = [35, -30, 40, -25, 30, -40, 28];
```
One perpendicular-offset value (in world pixels) per node, indexed to match
`CATEGORY_NODES` order.

#### Main function: `renderArrows()`
```
renderArrows()
  1. Get #canvas-world — guard if missing
  2. Get #hub-node — guard if missing
  3. Read hub half-axes from hub.offsetWidth / hub.offsetHeight
  4. Remove existing #canvas-arrows if present (idempotency)
  5. Create <svg id="canvas-arrows"> with overflow:visible, pointer-events:none
  6. Create <defs> containing the <marker id="arrowhead"> polygon
  7. For each node in CATEGORY_NODES (index i):
     a. Compute start point = ellipseEdge(node toward hub)
     b. Compute end   point = ellipseEdge(hub toward node)
     c. Compute perpendicular direction from start to end
     d. Compute cp1, cp2 using ARROW_OFFSETS[i]
     e. Build SVG path: "M sx sy C cp1x cp1y cp2x cp2y ex ey"
     f. Create <path> with stroke style + marker-end="url(#arrowhead)"
     g. Append to SVG
  8. Insert SVG as first child of #canvas-world
```

#### Call site modification: navigateToPage patch
Add one line after `renderCategoryNodes(userData)`:
```js
renderArrows();
```

---

## Module Boundaries

All code is inline in `mindshift.html`. There are no module imports.

New symbols introduced:
- `ellipseEdge` — pure function, no side effects, no external dependencies
- `ARROW_OFFSETS` — module-level const array, read-only
- `renderArrows` — stateful only via DOM manipulation; depends on `#hub-node` and
  `#canvas-world` being present in the DOM

Existing symbols touched:
- The `navigateToPage` patch body (1 new line added)

---

## DOM Structure After Changes

```
#canvas-root
  #canvas-world           (CSS-transformed by CanvasTransform)
    #canvas-arrows        ← NEW: SVG, position:absolute, overflow:visible, z-index:0
      <defs>
        <marker id="arrowhead">
    <path id="arrow-career">
    <path id="arrow-creativity">
    <path id="arrow-health">
    <path id="arrow-relationships">
    <path id="arrow-travel">
    <path id="arrow-finances">
    <path id="arrow-living">
      </defs>             (note: paths are direct children of svg, not defs)
    #hub-node             (z-index:1, renders above arrows)
    #cn-career            (no explicit z-index, DOM-order above hub-node)
    #cn-creativity
    #cn-health
    #cn-relationships
    #cn-travel
    #cn-finances
    #cn-living
  #canvas-svg             (unchanged, empty, screen-space)
  #canvas-controls        (unchanged)
```

Wait — DOM order note: `#canvas-arrows` is inserted as `world.insertBefore(svg, world.firstChild)`.
Since `#hub-node` and nodes are appended by earlier render functions, and `renderArrows`
runs after them, `insertBefore(svg, firstChild)` puts the arrow SVG before everything
else in the world. This ensures arrows render behind hub and category nodes.

---

## Ordering of Changes

1. CSS addition (section marker + `#canvas-arrows` rule)
2. JS `ellipseEdge` helper
3. JS `ARROW_OFFSETS` constant
4. JS `renderArrows` function
5. Add `renderArrows()` call to navigateToPage patch

Each step is independently reviewable and can be committed atomically.

---

## No Changes Required To

- `CanvasTransform` — world-space approach needs no transform recalculation
- `applyTransform()` — no wrapping or patching needed
- `initCanvas()` — no changes
- `renderHubNode()` — no changes
- `renderCategoryNodes()` — no changes
- `#canvas-svg` — remains empty, reserved for future use
- HTML structure (`<div id="canvas-root">` etc.) — no changes
