# Design: T-001-04 svg-arrow-connections

## Decision Summary

**Chosen: Option A — World-space SVG inside `#canvas-world`, ellipse-edge intersection,
cubic bezier with deterministic perpendicular offsets, arrowhead via SVG marker.**

---

## Approaches Considered

### Option A — SVG in `#canvas-world` (world space)
Insert `<svg id="canvas-arrows">` as first child of `#canvas-world`. Use world
coordinates directly for all paths. The SVG inherits pan/zoom via the parent CSS
transform; no recalculation is ever needed.

**Pros:**
- Zero coupling to pan/zoom events — paths are computed once at render time
- Coordinates are natural and readable (world-space = same units as node wx/wy)
- z-order is trivially controlled by DOM insertion order

**Cons:**
- SVG element is 0×0 in size (world div is 0×0); requires `overflow:visible` — this is
  standard practice and works in all target browsers

### Option B — SVG in `#canvas-svg` (screen space)
Keep arrows in the existing screen-space SVG sibling. Patch `applyTransform()` to
recompute all arrow path coordinates on every transform update.

**Pros:**
- Reuses the existing `#canvas-svg` element from T-001-01

**Cons:**
- Requires wrapping/patching `applyTransform()` — adds fragility to a hot code path
- All 7 paths must be recalculated on every mouse move (panning) — unnecessary work
- Screen-space coordinates are less readable in source

**Rejected.** The only "pro" is reusing an existing element, but `#canvas-svg` was
provisioned by T-001-01 as a placeholder and has never been used. Using the world-space
approach is cleaner.

### Option C — One `<line>` per arrow, no SVG marker
Draw straight lines between centers with a custom arrowhead polygon.

**Rejected.** Ticket explicitly requires cubic bezier curves, not straight lines.

---

## Chosen Design: Details

### 1. Arrow SVG element

```html
<svg id="canvas-arrows"
     style="position:absolute;left:0;top:0;width:0;height:0;overflow:visible;pointer-events:none;"
     xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrowhead" ...>...</marker>
  </defs>
  <!-- 7 <path> elements -->
</svg>
```

Inserted as **first child** of `#canvas-world`, ensuring arrows render below hub and nodes.

### 2. Arrowhead marker

```xml
<marker id="arrowhead"
        markerWidth="8" markerHeight="6"
        refX="8" refY="3"
        orient="auto"
        markerUnits="strokeWidth">
  <polygon points="0 0, 8 3, 0 6" fill="#2d2d2d" opacity="0.7"/>
</marker>
```

- `markerUnits="strokeWidth"` scales the marker proportionally with the stroke width
- `orient="auto"` rotates the marker to match path direction at the endpoint
- `refX="8"` places the tip at the path endpoint (not the base)
- Applied via `marker-end` attribute on each `<path>`

### 3. Edge intersection algorithm

For a node centered at `(cx, cy)` with bounding half-axes `(rx, ry)`:

```js
function ellipseEdge(cx, cy, rx, ry, tx, ty) {
    const dx = tx - cx, dy = ty - cy;
    const len = Math.sqrt(dx*dx + dy*dy);
    if (len === 0) return { x: cx, y: cy };
    // parametric t for ellipse boundary in direction (dx, dy)
    const t = 1 / Math.sqrt((dx/(rx*len))*(dx/(rx*len)) + (dy/(ry*len))*(dy/(ry*len)));
    return { x: cx + (dx/len)*t, y: cy + (dy/len)*t };
}
```

Hub center: `(0, 0)`. Hub half-axes: `(hub.offsetWidth/2, hub.offsetHeight/2)`.
Node center: `(cat.wx, cat.wy)`. Node half-axes: `(cat.width/2, cat.height/2)`.

The start point is the node edge toward the hub. The end point is the hub edge toward
the node.

### 4. Cubic bezier control points

```
start  = ellipseEdge(node → hub)
end    = ellipseEdge(hub → node)
mid_x  = (start.x + end.x) / 2
mid_y  = (start.y + end.y) / 2
perp_x = -(end.y - start.y)   // 90° rotation of path direction
perp_y =  (end.x - start.x)
norm   = sqrt(perp_x^2 + perp_y^2)
perp_ux = perp_x / norm, perp_uy = perp_y / norm
offset = OFFSETS[i]             // deterministic per-node offset (px)

cp1 = (start.x*0.65 + end.x*0.35 + perp_ux*offset,
        start.y*0.65 + end.y*0.35 + perp_uy*offset)
cp2 = (start.x*0.35 + end.x*0.65 + perp_ux*offset,
        start.y*0.35 + end.y*0.65 + perp_uy*offset)
```

A fixed offset table (one value per node, ranging from +40 to −40) gives each arrow a
slightly different curvature without using Math.random() (which would produce different
curves on every render). The perpendicular direction means curves bow outward or inward
without crossing node bodies.

Deterministic offset table (world pixels):
```js
const ARROW_OFFSETS = [35, -30, 40, -25, 30, -40, 28];
```

These values are tuned so that no two adjacent curves collide and the overall layout
feels casual/hand-drawn.

### 5. Stroke style

```
stroke: #2d2d2d
stroke-width: 1.5
fill: none
opacity: 0.65
```

Thin, dark, semi-transparent. Matches the lo-fi notebook aesthetic without competing with
node colors.

### 6. Idempotency

`renderArrows()` removes the existing `#canvas-arrows` SVG before recreating it.
This mirrors the pattern used by `renderCategoryNodes`.

### 7. Call site

Inside the patched `navigateToPage(3)` branch, after `renderCategoryNodes(userData)`:

```js
renderHubNode();
renderCategoryNodes(userData);
renderArrows();    // ← new call
```

`renderArrows()` requires `#hub-node` to be in the DOM (for `offsetHeight`) and all
`cn-*` nodes to be in the DOM. Both prerequisites are satisfied at this point.

---

## Rejected Alternatives for Bezier Control Points

**Catmull-Rom splines**: Overkill — we only have 2 endpoints, not a path through
intermediate waypoints.

**Using the node and hub centers as control points**: Produces an S-curve which looks
more mechanical than the lo-fi hand-drawn feel.

**Random jitter on control points**: Would look different on every render. Deterministic
offsets produce a stable, reviewable result.

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|---|---|---|
| Hub `offsetHeight` is 0 at render time | Low | Hub is rendered and appended before `renderArrows()` is called; layout is synchronous |
| Arrowhead too large at low zoom | Low | `markerUnits="strokeWidth"` scales with stroke; at any zoom the marker is proportional |
| Ellipse approximation looks off for triangle/diamond nodes | Medium | Lo-fi aesthetic tolerates imprecision; if arrows clip node content visually, the SVG is below nodes in z-order |
| Perpendicular offset causes arrows to overlap each other | Low | Offset table tuned for the known clock-face layout; adjacent nodes have opposite sign offsets |
