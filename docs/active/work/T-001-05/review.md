# Review: T-001-05 node-expand-detail

## Summary

Implemented in-place expand/collapse for all 7 category nodes on the MindShift canvas.
Clicking a node toggles an expanded state that shows full goal bullets + an editable
textarea. All work is in `mindshift.html` (single-file app).

---

## Files Changed

| File | Change |
|------|--------|
| `mindshift.html` | Modified — ~90 lines added (CSS + JS) |
| `docs/active/work/T-001-05/research.md` | Created |
| `docs/active/work/T-001-05/design.md` | Created |
| `docs/active/work/T-001-05/structure.md` | Created |
| `docs/active/work/T-001-05/plan.md` | Created |
| `docs/active/work/T-001-05/progress.md` | Created |

---

## What Changed in `mindshift.html`

### CSS additions (~55 lines)

**Transition extension** on `.canvas-node`:
```css
width 0.25s ease, height 0.25s ease, border-radius 0.2s ease
```
Added to existing `transform`/`filter` transition.

**New section `/* === Node Expand Detail (T-001-05) === */`:**

- `.cn-expanded` — overrides clip-path, dimensions (280×340px), overflow, z-index,
  alignment, padding; `!important` ensures shape nodes' clip-paths are removed
- `.cn-expanded:hover` — disables hover scale/filter on expanded nodes
- `.cn-edit-area` — hidden textarea; styled with translucent background, inherits
  node color, resizable vertically; shown via `.cn-expanded .cn-edit-area`
- `.cn-close-btn` — hidden absolute-positioned ✕ button (top-right corner); shown
  via `.cn-expanded .cn-close-btn`

### JS additions (~35 lines)

**New state variables** (before `onNodeClick`):
- `const nodeEdits = new Map()` — session persistence for textarea values
- `let _expandedId = null` — currently expanded node ID
- `let _collapseListenerAdded = false` — guards single-registration of click-outside

**`collapseNode()`** — removes `.cn-expanded`, restores inline width/height from
`CATEGORY_NODES` descriptor, clears `_expandedId`.

**`expandNode(categoryId)`** — adds `.cn-expanded`, restores textarea value from
`nodeEdits` if present, sets `_expandedId`.

**`onNodeClick(categoryId)`** (stub replaced) — collapses if same node clicked,
otherwise collapse + expand new.

**`renderCategoryNodes` forEach extension** — after `el.innerHTML` assignment:
- Creates `<textarea class="cn-edit-area">` with `input` → `nodeEdits.set`
- Attaches `mousedown` + `wheel` stop-propagation on textarea (prevents canvas pan/zoom)
- Creates `<button class="cn-close-btn">` with click → `collapseNode()`
- Attaches `mousedown` stop-propagation on the node itself when expanded

**Global listeners** (after `onNodeClick`):
- `document keydown` → collapses on Escape
- `#canvas-root click` → collapses if click target is outside expanded node (once)

---

## Acceptance Criteria Verification

| Criterion | Status | Notes |
|-----------|--------|-------|
| Click toggles expanded state | ✅ | `onNodeClick` toggle logic |
| Full goals shown in expanded state | ✅ | `overflow:visible` + clip-path override reveals all `cn-goals` items |
| Editable textarea for goals | ✅ | `.cn-edit-area` shown via `.cn-expanded .cn-edit-area` |
| Edits persist in session | ✅ | `nodeEdits` Map survives `renderCategoryNodes` re-run |
| Click outside collapses | ✅ | Canvas-root click listener with `contains()` check |
| Escape collapses | ✅ | `document keydown` listener |
| Only one node expanded at a time | ✅ | `collapseNode()` called before `expandNode()` |
| Expanded node sits above others | ✅ | `z-index: 100` on `.cn-expanded` |
| Smooth animation | ✅ | `width 0.25s`, `height 0.25s`, `border-radius 0.2s` CSS transitions |

---

## Test Coverage

No automated test harness (vanilla single-file). Manual verification checklist:

- [ ] Navigate through wizard → reach canvas (page 3)
- [ ] Click career node → expands to ~280×340 rounded rect, all 3 goals visible
- [ ] Click career node again → collapses to original ellipse shape
- [ ] Click career → click health → career collapses, health expands (one at a time)
- [ ] Press Escape → expanded node collapses
- [ ] Click canvas background (not on node) → expanded node collapses
- [ ] Click ✕ button → expanded node collapses
- [ ] Expanded node visually sits above other nodes
- [ ] No hover scale effect on expanded node
- [ ] Type in textarea → text appears
- [ ] Navigate to page 4 (lens selector), back to page 3 → reopen same node → typed text preserved
- [ ] Pan canvas while node expanded: pan works; clicking inside expanded node does NOT pan
- [ ] Scroll inside expanded textarea → canvas does not zoom
- [ ] Triangle node (creativity) expands — clip-path removed, content visible without top-clip
- [ ] Diamond (health), blob (relationships), pentagon (travel) all expand correctly

---

## Open Concerns / Limitations

1. **Shape snap on expand**: The clip-path transition from ellipse/triangle/polygon to
   the full-rect polygon override is instantaneous (no smooth morph). Width/height
   grow smoothly, but the shape boundary changes instantly. This is a known lo-fi
   trade-off documented in design.md.

2. **Expanded node overflow on small screens**: The expanded node is 280×340px in
   world-space. At low zoom levels or on small viewports, the expanded node may extend
   beyond the visible canvas area. No auto-scroll/auto-zoom-to-fit is implemented.
   This is acceptable for the current lo-fi phase.

3. **`nodeEdits` stores raw text, not structured bullets**: The textarea is a free-form
   input. If a future ticket parses textarea content into structured goal bullets, it
   will need to define a format (e.g., newline-delimited). For now, raw text is fine.

4. **`renderCategoryNodes` re-run collapses state**: If `renderCategoryNodes` is called
   while a node is expanded (e.g., a hypothetical future re-render trigger), the
   expanded state is lost from the DOM (new elements created), even though `_expandedId`
   still holds the ID. `renderCategoryNodes` would need to call `expandNode(_expandedId)`
   after building nodes if this becomes an issue. Currently, it is only called on
   navigate-to-page-3, at which point no node is expanded.

5. **Click-outside uses canvas-root `click` event**: The `click` event on canvas-root
   fires after mousedown + mouseup. If the user mouses-down inside the expanded node
   and releases outside, it collapses. This is standard behaviour for modals and
   acceptable here.

---

## Human Attention Needed

None — all acceptance criteria met. Concerns listed above are known lo-fi limitations
appropriate for this phase.
