# Plan: T-001-03 category-nodes

## Implementation Steps

### Step 1 — Add category-node CSS block

**Where:** `mindshift.html`, inside `<style>`, after the `/* === Canvas Mode (T-001-01) === */` block.

**What:**
- `.canvas-node` base styles (position, flex, padding, cursor, transition, overflow)
- `.canvas-node:hover` (scale + drop-shadow filter)
- `.cn-label`, `.cn-header`, `.cn-goals`, `.cn-goals li::before` typography helpers
- 7 per-category color classes (`.cn-career` through `.cn-living`)
- 7 per-shape clip-path / border-radius classes (`.cn-shape-ellipse` through `.cn-shape-rect-tall`)

**Verify:** No existing selector conflicts; CSS block is self-contained.

**Commit:** `T-001-03: add category-node CSS (shapes, colors, hover)`

---

### Step 2 — Add `CATEGORY_NODES` data constant

**Where:** `mindshift.html`, inside `<script>`, after the `// --- Canvas Infrastructure (T-001-01) ---` block, before the `navigateToPage` patch.

**What:** Single `const CATEGORY_NODES = [...]` with 7 objects. Each object has: `id`, `label`, `colorClass`, `shapeClass`, `width`, `height`, `wx`, `wy`, `header`, `goals[]`, `areaKey`.

**Verify:** JS syntax valid; array has exactly 7 entries; IDs are unique.

**Commit:** (combined with Step 3)

---

### Step 3 — Add `renderCategoryNodes()` and `onNodeClick()` functions

**Where:** Same JS location as Step 2.

**`renderCategoryNodes(userData)`:**
1. Select `#canvas-world`.
2. Remove any existing elements with class `canvas-node` (idempotency).
3. For each node descriptor in `CATEGORY_NODES`:
   a. Create `div.canvas-node` with `id="cn-{id}"`.
   b. Add `colorClass` and `shapeClass`.
   c. Set inline style: `width`, `height`, `left` (`wx - width/2`), `top` (`wy - height/2`), `position: absolute`.
   d. Build inner HTML: `cn-label` span, `cn-header` span, `cn-goals` ul with `<li>` items.
   e. If `cat.areaKey === userData.area` and `userData.future`, prepend user's future text as first goal.
   f. Append to `#canvas-world`.
   g. Add click listener: `el.addEventListener('click', () => onNodeClick(cat.id))`.

**`onNodeClick(categoryId)`:**
- Stub: `console.log('node clicked:', categoryId)`.

**Commit:** `T-001-03: add CATEGORY_NODES data and renderCategoryNodes()`

---

### Step 4 — Integrate `renderCategoryNodes` into `createMindMap()`

**Where:** `createMindMap()` function, inside the `setTimeout` callback after `navigateToPage(3)`.

**What:**
```js
renderCategoryNodes(userData);
// Center canvas on hub (world origin)
CanvasTransform.x = window.innerWidth / 2;
CanvasTransform.y = window.innerHeight / 2;
applyTransform();
```

**Verify:** After clicking "Create My Map →", nodes appear around the hub area. Panning and zooming work.

**Commit:** `T-001-03: wire renderCategoryNodes into createMindMap, center canvas on hub`

---

### Step 5 — Visual QA pass

Manual verification checklist:

- [ ] All 7 nodes visible at 1x zoom after page 3 loads
- [ ] Ellipse (career) visible and clipped
- [ ] Triangle (creativity) visible; text centered
- [ ] Diamond (health) visible
- [ ] Blob polygon (relationships) visible
- [ ] Pentagon (travel) visible
- [ ] Rounded rects (finances, living situation) visible
- [ ] Hover state: nodes scale up slightly on hover
- [ ] Click: `console.log` fires with correct category ID
- [ ] Pan: nodes move with canvas
- [ ] Zoom: nodes scale with canvas
- [ ] Zoom reset: canvas re-centers on hub

If any shape clips text too aggressively, adjust `padding` or `clip-path` vertex tuning.

**Commit:** `T-001-03: node shape/position tuning` (if any adjustments needed)

---

## Testing Strategy

No automated tests (vanilla single-file app has no test harness). Verification is manual via browser.

Test scenarios:
1. **Default path** — click through pages 1–2 with any area selected → verify all 7 nodes render.
2. **Matched area** — select "career" in q4 → verify career node shows user's future text as first goal.
3. **Canvas interaction** — pan, zoom in, zoom out, reset → nodes remain correctly positioned.
4. **Click** — click each node → browser console shows correct ID.
5. **Re-entry** — navigate away from page 3 and back → nodes re-render without duplicates (`renderCategoryNodes` idempotency).

---

## Risks

| Risk | Mitigation |
|---|---|
| Triangle/diamond clip-path hides most of text area | Increase node size; adjust clip-path percentages |
| Blob polygon looks bad at some sizes | Tune polygon vertices; fallback to ellipse if needed |
| Canvas centering off by node offset | Test at 1280×800 and 1920×1080; adjust if needed |
| `userData` not set when `renderCategoryNodes` is called | Guard: `if (!userData) return;` at top of function |

---

## Commit Sequence

1. CSS block → `T-001-03: add category-node CSS`
2. Data + functions → `T-001-03: add CATEGORY_NODES and renderCategoryNodes`
3. Integration → `T-001-03: wire nodes into createMindMap, center canvas`
4. (optional) Tuning → `T-001-03: shape/position tuning`
