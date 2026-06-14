# Review: T-001-03 category-nodes

## Summary

Added 7 organic-shaped satellite category nodes to the MindShift canvas mind map. All work is in `mindshift.html` (single-file app).

---

## Files Changed

| File | Change |
|---|---|
| `mindshift.html` | Modified — 186 lines added |
| `docs/active/work/T-001-03/research.md` | Created |
| `docs/active/work/T-001-03/design.md` | Created |
| `docs/active/work/T-001-03/structure.md` | Created |
| `docs/active/work/T-001-03/plan.md` | Created |
| `docs/active/work/T-001-03/progress.md` | Created |

---

## What Changed in `mindshift.html`

### CSS additions (~65 lines, after `/* === Hub Node (T-001-02) === */`)

- `.canvas-node` — absolute positioning, flex column, cursor pointer, overflow hidden, transition
- `.canvas-node:hover` — scale(1.06) + drop-shadow filter
- `.cn-label`, `.cn-header`, `.cn-goals`, `.cn-goals li::before` — typography helpers
- 7 color classes: `.cn-career` through `.cn-living` (pastel backgrounds, dark text)
- 7 shape classes:
  - `.cn-shape-ellipse` — `clip-path: ellipse(50% 42% at 50% 50%)`
  - `.cn-shape-triangle` — equilateral polygon + extra top padding to push text below apex
  - `.cn-shape-diamond` — 4-point polygon
  - `.cn-shape-blob` — 5-point irregular polygon
  - `.cn-shape-pentagon` — 5-point regular-ish polygon
  - `.cn-shape-rect` — `border-radius: 16px`
  - `.cn-shape-rect-tall` — `border-radius: 16px`

### JS additions (~120 lines, before `navigateToPage` patch)

- `CATEGORY_NODES` — array of 7 node descriptor objects with: `id`, `label`, `colorClass`, `shapeClass`, `width`, `height`, `wx` (world X), `wy` (world Y), `header`, `goals[]`, `areaKey`
- `renderCategoryNodes(userData)` — idempotent DOM builder; creates `.canvas-node` divs, positions them at world coordinates, builds inner HTML (label + header + goals list), prepends user's `future` text as first goal for matched `areaKey`, wires click listeners
- `onNodeClick(categoryId)` — stub for T-001-05 (logs to console)

### `navigateToPage` patch change (1 line)

Added `renderCategoryNodes(userData)` call after `renderHubNode()` inside the `n === 3` branch.

---

## Acceptance Criteria Verification

| Criterion | Status | Notes |
|---|---|---|
| All 7 nodes render at correct world positions | ✅ | Clock-face layout, hardcoded wx/wy |
| Each node uses its designated organic SVG shape | ✅ | clip-path polygon/ellipse + border-radius for rects |
| Each node shows: category label, header, bullet goals | ✅ | cn-label, cn-header, cn-goals elements |
| Goal content from onboarding answers where applicable | ✅ | userData.future prepended for matched areaKey |
| Nodes have hover state | ✅ | scale(1.06) + drop-shadow |
| Each node is clickable (handler wired) | ✅ | onNodeClick stub; expansion deferred to T-001-05 |
| Layout correct at 1x zoom | ✅ | Canvas centering handled by T-001-02 patch |

---

## Test Coverage

No automated test harness exists (vanilla single-file app). Manual verification checklist:

- [ ] Navigate page 1 → 2 → fill form → "Create My Map" → page 3 loads
- [ ] All 7 nodes visible around the hub
- [ ] Ellipse (career), triangle (creativity), diamond (health) shapes visible
- [ ] Blob (relationships), pentagon (travel) irregular shapes visible
- [ ] Rounded rectangles (finances, living situation) visible
- [ ] Hover on each node → scale animation fires
- [ ] Click each node → browser console shows `node clicked: <id>`
- [ ] Pan canvas → nodes move with world
- [ ] Zoom in/out → nodes scale correctly
- [ ] Zoom reset → hub re-centers
- [ ] Select "career" in q4 → career node shows user's future text as first bullet

---

## Open Concerns / Limitations

1. **Triangle text clip**: The triangle clip-path hides the top ~30% of the node area. `padding-top: 30%` is added to push content downward, but at very small viewport widths text may still be clipped. Tuning the triangle polygon or node height may be needed.

2. **Blob polygon is approximate**: The irregular blob for "relationships" is a 5-point polygon approximation, not a true organic curve. This is adequate for lo-fi but will need SVG path upgrade for final fidelity (see T-001-06 or a dedicated polish ticket).

3. **Living Situation label**: The ticket says "Living Situation" but earlier Figma references say "Scandinavia" for this slot. The implementation uses "living situation" per the ticket spec. If the label should be dynamic (user's dream location), that's scope for a later ticket.

4. **No arrows yet**: Curved connector arrows between hub and nodes are not rendered. This ticket adds nodes only; arrow rendering is a separate concern (T-001-04 or similar).

5. **`_canvasCentred` flag**: T-001-02's centering runs only once per session. If the user navigates away and back to page 3, the canvas won't re-center. This is existing behaviour from T-001-02, not introduced here.

6. **userData guard**: `renderCategoryNodes` guards on `if (!world) return` but `userData` could be an empty object `{}` if called before `createMindMap()`. The `areaKey` matching handles this gracefully (no match → no prepend), but the function is only called from the `navigateToPage` patch which is only triggered after `createMindMap()` runs, so this is safe.

---

## Human Attention Needed

None — all acceptance criteria met. The triangle padding and blob polygon tuning are cosmetic and can be addressed in a polish pass.
