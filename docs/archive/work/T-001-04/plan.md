# Plan: T-001-04 svg-arrow-connections

## Implementation Steps

### Step 1 — CSS: Add `#canvas-arrows` style rule

**What:** Add the `/* === Arrow Connectors (T-001-04) === */` comment and `#canvas-arrows`
CSS rule after the `/* === Category Nodes (T-001-03) === */` block.

**Where:** `mindshift.html`, in the `<style>` block, after the last category-node CSS rule.

**Code to insert:**
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

**Verification:** File saves cleanly; opening in browser shows no visual change yet (no
arrows rendered, CSS rule is inert until the element exists).

**Commit:** `T-001-04: add CSS rule for #canvas-arrows SVG`

---

### Step 2 — JS: Add `ellipseEdge` helper and `ARROW_OFFSETS` constant

**What:** Add the `// --- Arrow Connectors (T-001-04) ---` section header, the
`ellipseEdge` helper function, and the `ARROW_OFFSETS` constant array.

**Where:** After the `onNodeClick` function (line ~1174) and before the
`// Patch navigateToPage` comment (line ~1176).

**Code to insert:**
```js
// --- Arrow Connectors (T-001-04) ---

const ARROW_OFFSETS = [35, -30, 40, -25, 30, -40, 28];

function ellipseEdge(cx, cy, rx, ry, tx, ty) {
    const dx = tx - cx, dy = ty - cy;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return { x: cx, y: cy };
    const ux = dx / len, uy = dy / len;
    const t = 1 / Math.sqrt((ux / rx) * (ux / rx) + (uy / ry) * (uy / ry));
    return { x: cx + ux * t, y: cy + uy * t };
}
```

**Verification:** No syntax errors; function is callable from console after page load.
`ellipseEdge(0, 0, 140, 80, 0, -260)` should return approximately `{x: 0, y: -80}`.

**Commit:** `T-001-04: add ellipseEdge helper and ARROW_OFFSETS`

---

### Step 3 — JS: Add `renderArrows` function

**What:** Add the full `renderArrows()` function after the `ellipseEdge` helper.

**Code:**
```js
function renderArrows() {
    const world = document.getElementById('canvas-world');
    if (!world) return;
    const hub = document.getElementById('hub-node');
    if (!hub) return;

    const hubRx = hub.offsetWidth  / 2;
    const hubRy = hub.offsetHeight / 2;

    // Remove existing arrow SVG (idempotent)
    const existing = document.getElementById('canvas-arrows');
    if (existing) existing.remove();

    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.id = 'canvas-arrows';

    // Arrowhead marker
    const defs = document.createElementNS(NS, 'defs');
    const marker = document.createElementNS(NS, 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '8');
    marker.setAttribute('markerHeight', '6');
    marker.setAttribute('refX', '7');
    marker.setAttribute('refY', '3');
    marker.setAttribute('orient', 'auto');
    marker.setAttribute('markerUnits', 'strokeWidth');
    const arrowPoly = document.createElementNS(NS, 'polygon');
    arrowPoly.setAttribute('points', '0 0, 8 3, 0 6');
    arrowPoly.setAttribute('fill', '#2d2d2d');
    arrowPoly.setAttribute('opacity', '0.7');
    marker.appendChild(arrowPoly);
    defs.appendChild(marker);
    svg.appendChild(defs);

    CATEGORY_NODES.forEach(function(cat, i) {
        const nx = cat.wx, ny = cat.wy;
        const nrx = cat.width / 2, nry = cat.height / 2;

        // Edge of node toward hub
        const start = ellipseEdge(nx, ny, nrx, nry, 0, 0);
        // Edge of hub toward node
        const end   = ellipseEdge(0, 0, hubRx, hubRy, nx, ny);

        // Perpendicular direction for curve bow
        const edx = end.x - start.x, edy = end.y - start.y;
        const elen = Math.sqrt(edx * edx + edy * edy) || 1;
        const pux = -edy / elen, puy = edx / elen;
        const off = ARROW_OFFSETS[i];

        const cp1x = start.x * 0.65 + end.x * 0.35 + pux * off;
        const cp1y = start.y * 0.65 + end.y * 0.35 + puy * off;
        const cp2x = start.x * 0.35 + end.x * 0.65 + pux * off;
        const cp2y = start.y * 0.35 + end.y * 0.65 + puy * off;

        const d = `M ${start.x} ${start.y} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${end.x} ${end.y}`;

        const path = document.createElementNS(NS, 'path');
        path.setAttribute('id', 'arrow-' + cat.id);
        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', '#2d2d2d');
        path.setAttribute('stroke-width', '1.5');
        path.setAttribute('opacity', '0.65');
        path.setAttribute('marker-end', 'url(#arrowhead)');
        svg.appendChild(path);
    });

    // Insert before all other world children so arrows render behind nodes
    world.insertBefore(svg, world.firstChild);
}
```

**Verification:**
- No syntax errors in browser console after load
- Function is callable: `renderArrows()` from console after navigating to page 3

**Commit:** `T-001-04: add renderArrows function`

---

### Step 4 — JS: Call `renderArrows()` from navigateToPage patch

**What:** Add `renderArrows();` after the `renderCategoryNodes(userData);` call in
the navigateToPage patch.

**Where:** Inside `if (n === 3) { ... }` block, after `renderCategoryNodes(userData)`.

**Before:**
```js
renderHubNode();
renderCategoryNodes(userData);
```

**After:**
```js
renderHubNode();
renderCategoryNodes(userData);
renderArrows();
```

**Verification:** Navigate to page 3 (fill form → Create My Map). Seven curved arrows
should be visible connecting each satellite node to the hub.

**Commit:** `T-001-04: wire renderArrows into navigateToPage`

---

## Testing Strategy

No automated test harness exists (vanilla single-file). Manual verification:

### Functional checks

| Check | How |
|---|---|
| 7 arrows visible | Visual inspection on page 3 |
| Each arrow connects a node to the hub | Trace each curve visually |
| Arrows start from node edge, not center | Center of arrow start should be at node boundary |
| Arrows end at hub edge | Arrow tip (arrowhead) should sit at hub boundary |
| All arrows use cubic bezier (not straight) | All paths visually bow slightly |
| Arrowhead present at hub end | Small triangle visible at hub end of each path |
| Arrows behind nodes and hub | Drag a node area — arrows should not occlude text |
| Arrows update on pan | Pan canvas → arrows move with world |
| Arrows update on zoom | Scroll to zoom → arrows scale with world |
| Arrows update on zoom reset | Click reset button → arrows reset correctly |
| Stroke style: thin, dark | Thin (~1.5px equivalent) dark lines |

### Edge case checks

| Check | How |
|---|---|
| Page reload → arrows re-render correctly | Refresh browser, complete wizard again |
| Back to map → arrows re-render | Navigate away (page 4) then back to page 3 |
| `renderArrows()` idempotent | Call it twice from console → no duplicate arrows |

### Regression checks (prior tickets)

| Check | How |
|---|---|
| Hub node still renders | Page 3 shows hub |
| Category nodes still render | All 7 satellite nodes present |
| Pan still works | Mouse drag moves canvas |
| Zoom still works | Scroll wheel zooms |
| Node hover still works | Hover over node → scale animation |
| Node click still logs | Click node → console shows "node clicked: <id>" |

---

## Commit Sequence

1. `T-001-04: add CSS rule for #canvas-arrows SVG`
2. `T-001-04: add ellipseEdge helper and ARROW_OFFSETS`
3. `T-001-04: add renderArrows function`
4. `T-001-04: wire renderArrows into navigateToPage`
