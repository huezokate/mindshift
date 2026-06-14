# Design: T-001-05 node-expand-detail

## Problem Summary

Clicking a category node must expand it in-place to show all goals plus an editable
textarea. The key constraints from Research are:

1. Five of seven nodes use `clip-path` — expanded content would be clipped.
2. `renderCategoryNodes()` is destructive (re-creates all nodes); edits must survive.
3. Pan interaction (`mousedown` on canvas-root) conflicts with textarea interaction.
4. No storage exists for per-node user edits.

---

## Options

### Option A — In-place Growth with clip-path Override

Expand the node by toggling a `.cn-expanded` class that:
- Overrides `clip-path` to a full-coverage rectangle polygon (or `none`)
- Grows `width` and `height` to a larger size via CSS
- Removes `overflow: hidden`
- Raises `z-index`

All within `#canvas-world` (world-space), so the node pans/zooms with the canvas.

**Pros:**
- Minimal DOM — no new elements
- The node appears to grow from its position naturally
- No coordinate math needed

**Cons:**
- Clip-path from irregular shape to `polygon(0% 0%,100% 0%,100% 100%,0% 100%)` is not
  a smooth visual transition (vertex count differs for ellipse and triangle). The
  transition will be abrupt for the shape outline.
- Width/height CSS transitions work, but the clip-path snap is jarring for ellipse.

**Verdict:** Acceptable for a lo-fi implementation. The shape snap can be softened by
transitioning to a rounded-rect appearance (adding border-radius when expanded).

---

### Option B — Separate Overlay Panel (Screen-space)

On click, compute the node's screen-space position using `CanvasTransform`, then
render a fixed/absolute overlay panel at those coords (outside `canvas-world`).

**Pros:**
- No clip-path conflict — overlay has its own DOM context
- Textarea scrolls without panning the canvas

**Cons:**
- Requires coordinate math (`wx * scale + tx`, `wy * scale + ty`)
- Overlay doesn't pan/zoom with canvas — it stays fixed while the user pans, which
  looks detached
- Two sources of truth for position — fragile
- Much more code (position updates on every pan/zoom event)

**Verdict:** Rejected. The "floats away from node while panning" behaviour violates
the AC requirement for a natural in-place feel. Coordinate math adds fragility.

---

### Option C — Wrapper Approach: Inner Collapsed + Expanded Content

Replace `overflow: hidden` and clip-path on expand with a larger transparent wrapper
that holds an inner div (the visible shaped portion) and an overlay inner panel.

**Cons:** Complex DOM restructuring, harder to maintain.

**Verdict:** Rejected. Over-engineered for a lo-fi single-file app.

---

## Decision: Option A with Clip-path Snap + Border-radius Polish

Use Option A. When `.cn-expanded` is applied:

1. Override clip-path → `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)` (full rect)
2. Add `border-radius: 18px`
3. Set expanded dimensions (`width: 280px; height: 340px`)
4. Set `overflow: visible` (so textarea isn't clipped) + high z-index
5. Transition: `width 0.25s, height 0.25s, border-radius 0.2s` — shape snap is
   instant but size growth is smooth

The clip-path snap (instant) is acceptable for a lo-fi version. The size expansion
and border-radius give a clear "pop open" feel.

---

## Expanded Node Content Structure

```html
<div class="canvas-node cn-career cn-shape-ellipse cn-expanded">
  <span class="cn-label">career</span>
  <span class="cn-header">I work at a company I love</span>
  <ul class="cn-goals cn-goals-full">
    <li>Senior IC or lead role</li>
    <li>Work I'm proud of</li>
    <li>Strong team relationships</li>
  </ul>
  <textarea class="cn-edit-area" placeholder="Add or refine your goals…"></textarea>
  <button class="cn-close-btn" title="Collapse">✕</button>
</div>
```

The collapsed view already has `.cn-goals` (truncated by overflow). We need a full
goals list. Two approaches:

- **Approach i:** Keep one `.cn-goals` list; hide list items beyond index 1 in
  collapsed state via `:not(.cn-expanded) .cn-goals li:nth-child(n+3) { display:none }`.
- **Approach ii:** Build a `.cn-goals-full` hidden section separately from the
  truncated collapsed list.

Approach i is simpler — all goals are already in the DOM, just hidden/shown by CSS.
Collapsed state hides all goals beyond the first 2. Expanded state shows all.

**Decision:** Approach i. Single `cn-goals` list; CSS controls visibility.
In collapsed state `overflow:hidden` already clips content; no extra CSS needed.

---

## Textarea for Editing Goals

- Class: `cn-edit-area`
- Placeholder: `"Add or refine your goals…"`
- Hidden in collapsed state (`display: none`)
- Shown in expanded state
- `mousedown` / `click` on textarea stop propagation to prevent canvas pan

### Persistence

Module-level `Map`: `const nodeEdits = new Map()` keyed by `categoryId`.

On textarea `input` event: `nodeEdits.set(categoryId, textarea.value)`.
On `renderCategoryNodes` rebuild: after creating each node, if `nodeEdits.has(cat.id)`,
restore the textarea value.

Since `renderCategoryNodes` destroys and rebuilds DOM, this external map is the
only option for surviving re-renders within the session.

---

## Collapse Triggers

| Trigger | Handler Location |
|---------|-----------------|
| Click outside expanded node | `click` listener on `#canvas-root` (bubbled); check `!expandedEl.contains(e.target)` |
| Escape key | `keydown` on `document`; check `e.key === 'Escape'` |
| Opening a second node | inside `onNodeClick` before expanding new node |
| Close button (✕) | `click` on `.cn-close-btn` |

---

## One-at-a-time Enforcement

Module-level variable `let _expandedId = null`.

`onNodeClick(id)`:
1. If `_expandedId === id` → collapse and return.
2. If `_expandedId !== null` → collapse `_expandedId` first.
3. Expand new node.

---

## Pan Conflict Resolution

Inside the expanded node div, stop propagation on:
- `mousedown` — prevents canvas pan when interacting with textarea
- `wheel` — prevents canvas zoom when scrolling textarea
- `click` — already bubbles up through the node for close-on-outside-click check;
  this is fine since we check `!expandedEl.contains(e.target)` before collapsing.

---

## CSS Transition Strategy

Add to `.canvas-node`:
```css
transition: transform 0.15s ease, filter 0.15s ease,
            width 0.25s ease, height 0.25s ease,
            border-radius 0.2s ease;
```

`.cn-expanded` overrides:
```css
clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%) !important;
border-radius: 18px !important;
width: 280px !important;
height: 340px !important;
overflow: visible;
z-index: 100;
align-items: flex-start;
justify-content: flex-start;
padding: 18px;
cursor: default;
```

Hover scale should be disabled on expanded node:
```css
.cn-expanded:hover { transform: none; filter: none; }
```

---

## Data Flow Summary

```
User clicks node
  → onNodeClick(id)
      → collapseNode() if _expandedId exists
      → expandNode(id)
          → find element #cn-{id}
          → add .cn-expanded
          → show .cn-edit-area
          → restore textarea from nodeEdits

User edits textarea
  → 'input' event → nodeEdits.set(id, value)

User presses Escape / clicks outside / clicks ✕ / clicks another node
  → collapseNode()
      → remove .cn-expanded
      → hide .cn-edit-area
      → _expandedId = null
```

---

## Acceptance Criteria Mapping

| Criterion | Approach |
|-----------|----------|
| Click toggles expanded state | `onNodeClick` toggle logic |
| Full goals shown | `overflow` + clip-path removal via `.cn-expanded` |
| Editable textarea | `.cn-edit-area`, shown/hidden by class |
| Edits persist in session | `nodeEdits` Map, restored on rebuild |
| Click outside / Escape collapses | `click` on root + `keydown` on document |
| Only one expanded at a time | `_expandedId` gate in `onNodeClick` |
| Expanded sits above others | `z-index: 100` on `.cn-expanded` |
| Smooth animation | CSS transition on width/height/border-radius |
