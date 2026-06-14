# T-001-06 Research: mood-image-upload

## Overview

Single-file vanilla HTML/CSS/JS app. No build step, no framework, no external dependencies
beyond the Figma capture script at the very bottom. All logic is inline in `mindshift.html`
(~1430 lines).

---

## Relevant Files

| File | Role |
|------|------|
| `mindshift.html` | Entire application — HTML, CSS, JS |

No other files are involved. This ticket touches only `mindshift.html`.

---

## Canvas Architecture (established by T-001-01 through T-001-05)

### DOM Hierarchy

```
body.canvas-mode
  #page3.container.active
    #canvas-root               ← pan/zoom event surface
      #canvas-world            ← transform-origin: 0 0, scaled/translated
        #canvas-arrows (svg)   ← arrow connectors, z-index 0
        #hub-node              ← centre hub ellipse
        .canvas-node × 7       ← category nodes
      #canvas-svg              ← (unused pointer-events overlay)
      #canvas-controls         ← zoom buttons, fixed bottom-right
```

### Category Node Elements

Each `.canvas-node` is a `div` built by `renderCategoryNodes()` (line 1208). Structure per node:

```html
<div class="canvas-node cn-{color} cn-shape-{shape}" id="cn-{id}">
  <span class="cn-label">{label}</span>
  <span class="cn-header">{header}</span>
  <ul class="cn-goals">
    <li>…</li>
  </ul>
  <textarea class="cn-edit-area">…</textarea>   <!-- T-001-05 -->
  <button class="cn-close-btn">✕</button>        <!-- T-001-05 -->
</div>
```

---

## Expand/Collapse State (T-001-05)

### State Variables

```js
const nodeEdits = new Map();   // categoryId → string (textarea value, session-scoped)
let _expandedId = null;        // which node is currently expanded (one at a time)
let _collapseListenerAdded = false;
```

### Expand Dimensions (CSS)

```css
.cn-expanded {
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%) !important;
    border-radius: 18px !important;
    width: 280px !important;
    height: 340px !important;
    overflow: visible;
    z-index: 100;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 18px 16px;
    cursor: default;
}
```

Expanded nodes are 280 × 340 px (fixed, CSS `!important`). Currently there are three
visible child elements in expanded state: label, header, goals list, textarea, close button.
The height of 340 px gives moderate internal space for new content.

### expand/collapse Functions

- `expandNode(categoryId)` — adds `.cn-expanded` class, restores textarea value
- `collapseNode()` — removes `.cn-expanded` class, resets `_expandedId`, restores original
  `width`/`height` from `CATEGORY_NODES[i]`
- `onNodeClick(categoryId)` — toggle: if same node clicked again, collapse; else expand

---

## Session State Pattern

The only persisted-for-session state lives in module-level JS variables:

| Variable | Type | Scope |
|----------|------|-------|
| `userData` | plain object | global, set in `createMindMap()` |
| `nodeEdits` | `Map<string, string>` | global, never cleared |
| `_expandedId` | `string \| null` | global |

No `localStorage`, no `sessionStorage`, no server calls. Everything is in-memory for the
browser tab lifetime. The image store for this ticket should follow the same pattern: a
`Map<string, string[]>` keyed on categoryId, holding base64 data URL arrays.

---

## CATEGORY_NODES Data

Seven nodes defined at lines 1128–1206:

| id | label | Default size |
|----|-------|--------------|
| career | career | 180 × 150 |
| creativity | creativity | 175 × 175 |
| health | health & wellness | 175 × 175 |
| relationships | relationships | 180 × 170 |
| travel | travel | 180 × 170 |
| finances | finances | 168 × 135 |
| living | living situation | 158 × 195 |

The ticket calls out `travel` and `living` as the nodes expected to carry the most images
(matching the Figma lo-fi).

---

## renderCategoryNodes() Idempotency

`renderCategoryNodes()` (line 1208) removes all existing `.canvas-node` elements before
re-rendering. This is called each time page 3 is visited. The `nodeEdits` Map survives
re-renders because it's module-level; the same pattern must be followed for image state.

Textarea values are re-applied from the Map on each render (line 1241). Image state must
be likewise re-applied.

---

## File Input Patterns in Vanilla JS

No existing `<input type="file">` elements exist in the codebase. The ticket requires
client-side-only base64 encoding via `FileReader.readAsDataURL()`. Standard pattern:

```js
const input = document.createElement('input');
input.type = 'file';
input.accept = 'image/*';
input.multiple = true;
input.addEventListener('change', handler);
input.click();
```

The input element need not be attached to the DOM.

---

## Collapsed Node Badge

Currently collapsed nodes render only: label + header + goals list. The ticket requires
an image-count badge visible in collapsed state. This badge must be added inside
`renderCategoryNodes()` and shown/hidden based on whether the node has images.

Because `renderCategoryNodes()` is idempotent (always recreates nodes), the badge can be
unconditionally rendered but conditionally styled via a CSS class or `display` check.

---

## Expanded Node Height Constraint

The expanded size is `280 × 340 px` via `!important` CSS. Adding an image grid plus
an "Add image +" button will require either:
- Increasing the expanded height, or
- Using `overflow-y: auto` inside the expanded node, or
- Fitting images within the existing 340 px by making the grid compact

The textarea currently occupies ~72 px minimum. The goals list, header, and label take
~80–100 px. That leaves roughly 160–170 px for the image grid + button, which is feasible
for a 2-column thumbnail grid at ~60–70 px row height.

---

## Constraints / Assumptions

1. No localStorage needed per ticket — "images persist in memory for the session" means
   the same tab-scoped JS approach as `nodeEdits`.
2. Max 4–6 images visible; rest hidden — simplest implementation is cap the array at 6
   on add, or store all but only render first 6 with a "+N more" indicator.
3. The file input must accept only images (`accept="image/*"`).
4. Images removed via click × on thumbnail.
5. No external libraries; must remain vanilla JS.
6. The existing `renderCategoryNodes()` re-creates all DOM nodes on every page-3 visit —
   image state (base64 strings) stored in a module-level Map survives this.
7. Expanded height will likely need a bump from 340 → ~440–480 px to accommodate the grid
   without requiring overflow scroll inside a fixed-height node.
