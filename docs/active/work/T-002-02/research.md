# Research: T-002-02 node-component-refinement

## The Core Problem

`clip-path` is applied to `.canvas-node` itself. Since `.canvas-node` contains both the background and the text content, the clip-path clips all of it — including text. Complex shapes (triangle, diamond, blob, pentagon) cut off labels and goal bullets.

Visual evidence (from user screenshot):
- Creativity (triangle): label shows "REATIVITY", header truncated
- Health (diamond): label shows "ALTH & WELLNE"
- Blob and pentagon also clip content in some viewport sizes

---

## Current CSS Structure

```css
/* Color class: background + text color on the element */
.cn-career { background: var(--cn-career-bg); color: var(--cn-career-fg); }

/* Shape class: clip-path OR border-radius on the element */
.cn-shape-ellipse  { clip-path: ellipse(50% 42% at 50% 50%); }
.cn-shape-triangle { clip-path: polygon(50% 0%, 100% 87%, 0% 87%); padding-top: 30%; }
.cn-shape-diamond  { clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); }
.cn-shape-blob     { clip-path: polygon(20% 0%, 82% 8%, 100% 55%, 62% 100%, 0% 82%); }
.cn-shape-pentagon { clip-path: polygon(50% 0%, 100% 35%, 82% 100%, 18% 100%, 0% 35%); }
.cn-shape-rect      { border-radius: var(--cn-radius); }
.cn-shape-rect-tall { border-radius: var(--cn-radius); }
```

For rect shapes, `border-radius` doesn't clip content — no problem there.
For all non-rect shapes, the clip-path clips text.

---

## Solution: `::before` Pseudo-element Shape Layer

Split the rendering into two layers:

1. **`::before` pseudo-element** — carries `background` color + `clip-path` shape. Absolutely positioned to fill the parent. `z-index: 0`.
2. **Direct children** — carry text content. `position: relative; z-index: 1`. Never clipped.

```css
.canvas-node {
    background: transparent; /* moved to ::before */
    position: relative;
}
.canvas-node::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit; /* picks up radius from rect shapes */
    z-index: 0;
}
/* Color on ::before */
.cn-career::before        { background: var(--cn-career-bg); }
/* Shape clip-path on ::before */
.cn-shape-ellipse::before  { clip-path: ellipse(50% 42% at 50% 50%); }
/* Children above pseudo */
.canvas-node > * { position: relative; z-index: 1; }
```

For rect shapes: `border-radius: var(--cn-radius)` stays on `.canvas-node` and is inherited by `::before` via `border-radius: inherit`. No clip-path needed.

---

## cn-expanded Interaction (T-001-05)

The expand state uses:
```css
.cn-expanded {
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%) !important;
    border-radius: 18px !important;
    ...
}
```

This overrides `clip-path` on the element. With the new approach, there's no clip-path on the element itself — only on `::before`. The `!important` override becomes irrelevant. But `border-radius: 18px !important` still works (it sets the radius on the container, which `::before` inherits). The `.cn-expanded::before` clip-path would still be whatever the shape class sets, which could clip the expanded card's full-rectangle shape.

**Fix needed**: Add `.cn-expanded::before { clip-path: none !important; }` to the expanded state CSS.

---

## Hover State

`.canvas-node:hover { transform: scale(1.06); filter: drop-shadow(...); }`

`filter` and `transform` on `.canvas-node` apply to the entire element including `::before` and all children. This behavior is unchanged — the hover still works correctly.

---

## `renderCategoryNodes` JS

No changes needed to the JavaScript. The DOM structure is unchanged — the node divs already have the correct class names. The fix is purely CSS.

---

## Files Affected

| File | Change |
|---|---|
| `mindshift.html` | CSS only — modify color classes, shape classes, add `::before` rules, update cn-expanded |
