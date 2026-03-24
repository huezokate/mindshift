# Structure: T-001-05 node-expand-detail

## Files

| File | Change |
|------|--------|
| `mindshift.html` | Modified — CSS additions + JS additions/modifications |

No new files. No deletions.

---

## CSS Changes (inside `<style>`)

All new rules appended **after** the existing T-001-03 block
(`/* === Category Nodes (T-001-03) === */`, currently ending at line 527).

### New section comment

```css
/* === Node Expand Detail (T-001-05) === */
```

### Transition extension on `.canvas-node`

Edit the existing `.canvas-node` rule to add `width`, `height`, and `border-radius`
to the transition list (currently only `transform` and `filter`):

```css
transition: transform 0.15s ease, filter 0.15s ease,
            width 0.25s ease, height 0.25s ease,
            border-radius 0.2s ease;
```

### `.cn-expanded` — expanded state overrides

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
.cn-expanded:hover {
    transform: none;
    filter: none;
}
```

### `.cn-edit-area` — textarea inside expanded node

```css
.cn-edit-area {
    display: none;
    width: 100%;
    margin-top: 10px;
    padding: 8px;
    font-size: 0.72em;
    font-family: inherit;
    border: 1.5px solid rgba(0,0,0,0.18);
    border-radius: 8px;
    background: rgba(255,255,255,0.55);
    resize: vertical;
    min-height: 72px;
    box-sizing: border-box;
    color: inherit;
}
.cn-expanded .cn-edit-area {
    display: block;
}
```

### `.cn-close-btn` — close button

```css
.cn-close-btn {
    display: none;
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(0,0,0,0.12);
    border: none;
    border-radius: 50%;
    width: 22px;
    height: 22px;
    font-size: 0.7em;
    cursor: pointer;
    line-height: 22px;
    text-align: center;
    padding: 0;
    color: inherit;
}
.cn-expanded .cn-close-btn {
    display: block;
}
```

Note: `.canvas-node` must have `position: relative` (already has `position: absolute`
in the DOM context of `canvas-world`, but the close button is positioned relative to
the node). Add `position: relative` to `.canvas-node`? No — the node is already
`position: absolute` within the world, and child elements with `position: absolute`
are positioned relative to the nearest positioned ancestor, which IS the node itself.
No change needed.

---

## JS Changes (inside `<script>`)

### New module-level variables (immediately before `onNodeClick`)

```js
// T-001-05: expand state
const nodeEdits = new Map();   // categoryId → textarea value (session persistence)
let _expandedId = null;
```

### `collapseNode()` — new function

```js
function collapseNode() {
    if (!_expandedId) return;
    const el = document.getElementById('cn-' + _expandedId);
    const cat = CATEGORY_NODES.find(c => c.id === _expandedId);
    if (el && cat) {
        el.classList.remove('cn-expanded');
        el.style.width  = cat.width  + 'px';
        el.style.height = cat.height + 'px';
    }
    _expandedId = null;
}
```

Restoring inline `width`/`height` to the original collapsed dimensions is necessary
because `.cn-expanded` used `!important` for those, and removing the class alone
reverts to whatever the inline style says. After `collapseNode`, the inline styles
are the collapsed dimensions, and the CSS class overrides are gone.

### `expandNode(categoryId)` — new function

```js
function expandNode(categoryId) {
    const el = document.getElementById('cn-' + categoryId);
    if (!el) return;
    el.classList.add('cn-expanded');
    // Restore saved textarea content
    const ta = el.querySelector('.cn-edit-area');
    if (ta && nodeEdits.has(categoryId)) {
        ta.value = nodeEdits.get(categoryId);
    }
    _expandedId = categoryId;
}
```

### `onNodeClick(categoryId)` — replace stub

```js
function onNodeClick(categoryId) {
    if (_expandedId === categoryId) {
        collapseNode();
        return;
    }
    collapseNode();
    expandNode(categoryId);
}
```

### `renderCategoryNodes(userData)` — extend node building

Inside the `CATEGORY_NODES.forEach` loop, after the `el.innerHTML = ...` assignment,
add textarea and close button, and attach their event listeners:

```js
// Textarea for goal editing
const ta = document.createElement('textarea');
ta.className = 'cn-edit-area';
ta.placeholder = 'Add or refine your goals…';
if (nodeEdits.has(cat.id)) ta.value = nodeEdits.get(cat.id);
ta.addEventListener('input', function() { nodeEdits.set(cat.id, ta.value); });
ta.addEventListener('mousedown', function(e) { e.stopPropagation(); });
ta.addEventListener('wheel',     function(e) { e.stopPropagation(); });
el.appendChild(ta);

// Close button
const closeBtn = document.createElement('button');
closeBtn.className = 'cn-close-btn';
closeBtn.textContent = '✕';
closeBtn.title = 'Collapse';
closeBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    collapseNode();
});
el.appendChild(closeBtn);
```

Also: stop `mousedown` propagation on the expanded node itself (prevents canvas pan
when clicking inside the expanded panel):

```js
el.addEventListener('mousedown', function(e) {
    if (_expandedId === cat.id) e.stopPropagation();
});
```

### Global collapse listeners — add after `initCanvas()` call patch or at bottom of script

```js
// T-001-05: collapse expanded node on click-outside or Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && _expandedId) collapseNode();
});
```

For click-outside, extend the canvas-root click listener. Since the `initCanvas()`
block is closed before the `navigateToPage` patch, add this inside `initCanvas()` or
in the T-001-05 section:

```js
document.getElementById('canvas-root').addEventListener('click', function(e) {
    if (!_expandedId) return;
    const expandedEl = document.getElementById('cn-' + _expandedId);
    if (expandedEl && !expandedEl.contains(e.target)) {
        collapseNode();
    }
});
```

This event listener on `#canvas-root` catches clicks that bubble up from outside
the expanded node.

---

## Ordering of Changes

1. CSS: extend `.canvas-node` transition
2. CSS: add T-001-05 section with `.cn-expanded`, `.cn-edit-area`, `.cn-close-btn`
3. JS: add `nodeEdits`, `_expandedId` variables before `onNodeClick`
4. JS: add `collapseNode()` before `onNodeClick`
5. JS: add `expandNode()` before `onNodeClick`
6. JS: replace `onNodeClick` stub
7. JS: extend `renderCategoryNodes` forEach loop (textarea + close button + mousedown guard)
8. JS: add `keydown` listener and canvas-root `click` listener

---

## Interface / Boundary Summary

| Symbol | Type | Description |
|--------|------|-------------|
| `nodeEdits` | `Map<string, string>` | Session storage for textarea values |
| `_expandedId` | `string\|null` | Currently expanded node ID |
| `collapseNode()` | function | Collapses current expanded node; resets `_expandedId` |
| `expandNode(id)` | function | Applies `.cn-expanded` to node, restores textarea |
| `onNodeClick(id)` | function | Toggle: collapse if same, else collapse+expand |
| `.cn-expanded` | CSS class | Drives all expanded visual styles via cascade |
| `.cn-edit-area` | CSS class | Textarea element; shown via `.cn-expanded .cn-edit-area` |
| `.cn-close-btn` | CSS class | Close button; shown via `.cn-expanded .cn-close-btn` |
