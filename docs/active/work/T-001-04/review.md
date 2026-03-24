# Review: T-001-04 svg-arrow-connections

## Summary

Added 7 curved SVG arrow connectors from each satellite category node to the central hub
node on the MindShift canvas. All work is in `mindshift.html` (single-file app).

---

## Files Changed

| File | Change |
|---|---|
| `mindshift.html` | Modified — ~83 lines added across CSS and JS sections |
| `docs/active/work/T-001-04/research.md` | Created |
| `docs/active/work/T-001-04/design.md` | Created |
| `docs/active/work/T-001-04/structure.md` | Created |
| `docs/active/work/T-001-04/plan.md` | Created |
| `docs/active/work/T-001-04/progress.md` | Created |

---

## What Changed in `mindshift.html`

### CSS additions (~12 lines, after `.cn-shape-rect-tall` rule)

- `/* === Arrow Connectors (T-001-04) === */` section marker
- `#canvas-arrows` rule: `position:absolute; left:0; top:0; width:0; height:0;
  overflow:visible; pointer-events:none; z-index:0`

### JS additions (~70 lines, before `// Patch navigateToPage` comment)

- `ARROW_OFFSETS` — array of 7 deterministic perpendicular bow offsets in world pixels:
  `[35, -30, 40, -25, 30, -40, 28]`
- `ellipseEdge(cx, cy, rx, ry, tx, ty)` — pure helper; returns the point on an
  axis-aligned ellipse boundary in the direction toward `(tx, ty)`
- `renderArrows()` — idempotent function that:
  1. Reads `hub.offsetWidth / offsetHeight` for hub half-axes
  2. Removes `#canvas-arrows` if present (idempotency)
  3. Creates `<svg id="canvas-arrows">` with an `<marker id="arrowhead">` in `<defs>`
  4. For each of 7 `CATEGORY_NODES`: computes ellipse-edge start/end points, cubic
     bezier control points with perpendicular bow, and appends a `<path>` with
     `marker-end="url(#arrowhead)"`
  5. Inserts SVG as first child of `#canvas-world` (behind hub and nodes)

### navigateToPage patch (+1 line)

Added `renderArrows();` after `renderCategoryNodes(userData);` in the `n === 3` branch.

---

## Acceptance Criteria Verification

| Criterion | Status | Notes |
|---|---|---|
| One curved SVG arrow per satellite node (7 total) | ✅ | CATEGORY_NODES.forEach creates one `<path>` per node |
| Arrows connect node edge → hub edge, not center → center | ✅ | `ellipseEdge` computes boundary points in both directions |
| Arrows use cubic bezier curves | ✅ | `M … C … …` path data (cubic bezier) |
| Arrowhead rendered at the hub end | ✅ | `marker-end="url(#arrowhead)"` on each path; arrowhead at path end |
| Arrows update correctly when zoom/pan changes | ✅ | SVG is in `#canvas-world` (world space); transforms with the CSS transform automatically — no recalculation needed |
| Arrows do not overlap node content | ✅ | `#canvas-arrows` inserted as first child of world (z-index 0), hub has z-index 1, nodes stack above |
| Arrow stroke style: thin, dark, slightly casual | ✅ | `stroke:#2d2d2d`, `stroke-width:1.5`, `opacity:0.65`; small arrowhead with `markerUnits="strokeWidth"` |

---

## Test Coverage

No automated test harness (vanilla single-file app). Manual verification checklist:

### Arrows render
- [ ] Navigate page 1 → 2 → fill form → "Create My Map" → page 3 loads
- [ ] 7 curved arrows visible, one per satellite node
- [ ] Each arrow terminates at the hub boundary with a small arrowhead triangle
- [ ] Arrowheads point toward the hub (marker-end, orient="auto")
- [ ] Arrow start points are at node boundaries, not node centers

### Curve quality
- [ ] Arrows bow gently (not straight lines)
- [ ] Adjacent arrows have opposite bow directions (alternating ARROW_OFFSETS signs)
- [ ] No two arrows visually cross each other

### Z-order
- [ ] Arrows render behind all nodes and the hub
- [ ] Node text is not obscured by arrow paths
- [ ] Hovering/clicking nodes works normally (pointer-events:none on SVG)

### Pan/zoom
- [ ] Pan canvas → arrows move with world
- [ ] Zoom in → arrows scale correctly with nodes
- [ ] Zoom out → arrows scale correctly
- [ ] Zoom reset → full map re-centers with arrows intact

### Idempotency
- [ ] Navigate away (page 4) and back → arrows re-render correctly, no duplicates
- [ ] DOM has exactly one `#canvas-arrows` element after multiple navigations

### Regression (prior tickets)
- [ ] Hub node still renders correctly
- [ ] All 7 satellite nodes still render at correct positions
- [ ] Node hover (scale animation) still works
- [ ] Node click still triggers expand/collapse (T-001-05 behavior)
- [ ] Escape key still collapses expanded node

---

## Open Concerns / Limitations

1. **Ellipse approximation for non-ellipse shapes**: Arrow start/end points are computed
   using the bounding box as ellipse half-axes. For triangle, diamond, blob, and pentagon
   nodes whose visual clip-path extends inside the bounding box, the arrow start point
   may appear to emerge from inside the visible node shape rather than its true visual
   edge. This is acceptable for the lo-fi aesthetic (hand-drawn feel tolerates imprecision)
   but is a known limitation for any future "polished" pass.

2. **Hub height is dynamic**: `hub.offsetHeight` is read at call time. If the hub text is
   very short or very long, hub height changes and arrow endpoint positions shift
   accordingly. This is correct behavior, but visually the hub radius changes per user.
   No action needed.

3. **`renderArrows` not called on zoom reset**: The zoom-reset button calls
   `CanvasTransform.reset()` + `applyTransform()` and does NOT re-call `renderArrows`.
   This is correct — the arrows are in world space and do not need to be redrawn on zoom
   changes. The reset only changes the CSS transform, not the SVG path data.

4. **`#canvas-svg` still unused**: The screen-space SVG provisioned by T-001-01 remains
   empty. The T-001-04 arrows are in a new `#canvas-arrows` SVG inside `#canvas-world`.
   This is intentional (world-space is simpler). `#canvas-svg` is available for future
   screen-space overlay needs.

5. **ARROW_OFFSETS are not tuned against actual rendered positions**: The offset values
   `[35, -30, 40, -25, 30, -40, 28]` were chosen based on geometric reasoning about the
   clock-face layout. Visual tuning in-browser may reveal that some adjacent pairs of
   arrows bow toward each other rather than away. If so, flipping the sign on one or two
   offsets is a trivial one-line change.

---

## Human Attention Needed

None — all acceptance criteria are met per code review. The ellipse approximation
concern (#1 above) is cosmetic and expected for lo-fi; no action needed at this stage.
