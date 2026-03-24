# Research: T-001-04 svg-arrow-connections

## Scope

Curved SVG arrow connectors from each satellite node edge to the central hub edge.
All work is in `mindshift.html` (vanilla single-file, no build step).

---

## Canvas DOM Structure

```
#canvas-root                     — fixed full-viewport container (T-001-01)
  #canvas-world                  — div, CSS-transformed by CanvasTransform
  #canvas-svg                    — SVG sibling of canvas-world, screen-space, unused so far
```

`#canvas-world` receives:
```css
position: absolute; top: 0; left: 0; width: 0; height: 0; transform-origin: 0 0;
```
Its CSS `transform` is updated by `applyTransform()` every pan/zoom cycle.

`#canvas-svg` is positioned at `top:0; left:0; width:100%; height:100%` — it sits in
**screen space**, not world space. It is currently empty.

---

## CanvasTransform API

```js
CanvasTransform = {
    x, y, scale,
    toScreen(wx, wy)   → {x, y}   // world → screen coords
    toWorld(sx, sy)    → {x, y}   // screen → world coords
    toCSSTransform()   → string   // applied to #canvas-world
    reset()
}
```

`applyTransform()` calls `world.style.transform = CanvasTransform.toCSSTransform()`.
There is no callback or event fired when the transform changes.

---

## Hub Node (T-001-02)

Element: `#hub-node` — child of `#canvas-world`.

```css
position: absolute; left: 0; top: 0; transform: translate(-50%, -50%);
width: 280px; max-width: 280px; z-index: 1;
/* padding: ~20px estimated from visual; height is content-driven */
```

World center: **(0, 0)** (the hub is anchored at `left:0; top:0` and translated by −50%).
Width: 280px constant. Height: content-driven (typically ~150–180px at default content).

`hub.offsetWidth` and `hub.offsetHeight` give actual pixel dimensions in world space
(independent of scale, since they're CSS pixels on the un-transformed element).

---

## Category Nodes (T-001-03)

Seven `.canvas-node` divs, children of `#canvas-world`.

Each is positioned:
```js
el.style.left  = (cat.wx - cat.width  / 2) + 'px';
el.style.top   = (cat.wy - cat.height / 2) + 'px';
```

So node center in world space = `(cat.wx, cat.wy)`.

Node registry (CATEGORY_NODES array):
| id           | wx   | wy   | width | height | shape          |
|---|---|---|---|---|---|
| career       |   0  | -260 |  180  |  150   | ellipse        |
| creativity   | 240  | -160 |  175  |  175   | triangle       |
| health       | 290  |   60 |  175  |  175   | diamond        |
| relationships| 165  |  270 |  180  |  170   | blob           |
| travel       |-165  |  270 |  180  |  170   | pentagon       |
| finances     |-290  |   60 |  168  |  135   | rect           |
| living       |-240  | -160 |  158  |  195   | rect-tall      |

Node element IDs: `cn-career`, `cn-creativity`, etc.

Shape classes use `clip-path` polygons/ellipses. For edge intersection math, the actual
clipped visual shape differs from the bounding box, but approximating nodes as ellipses
(half-axes = width/2, height/2) produces acceptable arrow anchor points for a lo-fi aesthetic.

---

## renderCategoryNodes Lifecycle

Called from patched `navigateToPage(3)` after `renderHubNode()`. It is **idempotent**:
removes existing `.canvas-node` elements before re-creating them. This means any arrow
SVG added as a sibling of `.canvas-node` inside `#canvas-world` would survive re-renders
unless `renderArrows()` is also made idempotent.

---

## SVG Layer Options

### Option A — Arrows inside `#canvas-world`
- Insert a `<svg id="canvas-arrows">` as first child of `#canvas-world`
- Use world coordinates directly in `<path d="…">` elements
- Transforms with pan/zoom automatically (no recalculation needed)
- Need `overflow: visible` + `pointer-events: none` since world div is 0×0
- z-order: insert before hub/nodes → renders behind them

### Option B — Arrows in `#canvas-svg` (screen space)
- Recalculate screen coordinates on every `applyTransform()` call
- Requires patching or wrapping `applyTransform()`
- More moving parts; coordinates must be recomputed on each pan/zoom step

Option A is clearly simpler and more correct. World-space SVG eliminates the
coordinate conversion loop entirely.

---

## applyTransform Patch Requirement

Under Option A, no patch to `applyTransform()` is needed — the SVG is in the world
and moves with it. `renderArrows()` is a one-shot call (like `renderCategoryNodes`).

---

## Arrow Geometry

### Edge intersection (ellipse approximation)
Given a node centered at `(cx, cy)` with half-axes `(rx, ry)`:
```
direction (dx, dy) = (target_cx − cx, target_cy − cy)
t = (rx * ry) / sqrt((ry * dx)^2 + (rx * dy)^2)   [unnormalized form]
edge_x = cx + dx * t
edge_y = cy + dy * t
```
This gives the point on the axis-aligned ellipse in the direction of the target.

Hub half-axes: (140, hubHeight/2) — read from `hub.offsetHeight` at render time.
Node half-axes: (cat.width/2, cat.height/2).

### Bezier control points
A cubic bezier `M start C cp1 cp2 end`:
- `cp1` = midpoint between start and end, offset perpendicular
- `cp2` = same, other side

For gentle curves: control points at 35–40% along the line from each edge point toward
the other center, with a small perpendicular offset (±30–50px per node, deterministic
based on node index using a fixed offset table).

### Arrowhead
SVG `<marker>` element in `<defs>`:
- `markerUnits="strokeWidth"`
- `orient="auto"` — points along path direction
- Small filled triangle polygon
- Placed at `path end` (`marker-end`)

---

## Stroke Style (lo-fi aesthetic)

From ticket: "thin, dark, slightly casual".
Proposed: `stroke: #2d2d2d`, `stroke-width: 1.5`, `fill: none`, `opacity: 0.65`.
No dash arrays needed — solid thin line is lo-fi enough.

---

## Integration Points

1. `renderArrows()` — new function, called after `renderCategoryNodes()` in the
   `navigateToPage(3)` patch. Idempotent (removes `#canvas-arrows` before re-creating).

2. CSS: `#canvas-arrows` styles — minimal; most styling is SVG attributes.

3. No changes to CanvasTransform, applyTransform, initCanvas, or existing render functions.

---

## Constraints and Assumptions

- Hub height is read via `hub.offsetHeight` — requires hub to be in the DOM before
  `renderArrows()` runs. This is satisfied since `renderHubNode()` runs first.
- Arrow paths use world-space coordinates, so they are correct at all zoom/pan levels
  without recalculation.
- clip-path shapes on nodes mean arrows will visually emerge from inside the bounding box
  for triangle/diamond/blob nodes. The lo-fi aesthetic makes this acceptable.
- No interaction needed on arrows (pointer-events: none).
