# Plan: T-001-05 node-expand-detail

## Implementation Order

Steps are sequenced so each can be verified independently before the next.
All changes are in `mindshift.html`.

---

### Step 1 — Extend `.canvas-node` CSS transition

**Change:** Edit the existing `.canvas-node` rule (line ~474) to add `width`,
`height`, and `border-radius` to the transition property.

**Before:**
```css
transition: transform 0.15s ease, filter 0.15s ease;
```
**After:**
```css
transition: transform 0.15s ease, filter 0.15s ease,
            width 0.25s ease, height 0.25s ease,
            border-radius 0.2s ease;
```

**Verify:** No visible change in collapsed state. Browser devtools shows updated
transition property.

---

### Step 2 — Add T-001-05 CSS block

**Change:** Append new CSS section after the closing `/* Per-category shapes */` block
(after line ~527, before `</style>`):

Rules to add (in order):
1. `/* === Node Expand Detail (T-001-05) === */` comment
2. `.cn-expanded` — expanded state overrides (clip-path, dimensions, overflow, z-index)
3. `.cn-expanded:hover` — disable hover transform/filter
4. `.cn-edit-area` — hidden textarea base styles
5. `.cn-expanded .cn-edit-area` — show textarea when expanded
6. `.cn-close-btn` — hidden close button base styles
7. `.cn-expanded .cn-close-btn` — show close button when expanded

**Verify:** In browser console:
```js
document.getElementById('cn-career').classList.add('cn-expanded')
```
Node should visually expand to ~280×340 px rounded-rect with no clip-path.
Remove class to verify collapse.

---

### Step 3 — Add module-level state variables

**Change:** Insert two lines before the `onNodeClick` function:
```js
const nodeEdits = new Map();
let _expandedId = null;
```

**Verify:** In console: `typeof nodeEdits === 'object'` → true.

---

### Step 4 — Add `collapseNode()` function

**Change:** Insert `collapseNode()` function before `onNodeClick`:
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

**Verify:** After manually adding `.cn-expanded` via console, call `collapseNode()` —
class removed, dimensions restored.

---

### Step 5 — Add `expandNode()` function

**Change:** Insert `expandNode()` after `collapseNode()`:
```js
function expandNode(categoryId) {
    const el = document.getElementById('cn-' + categoryId);
    if (!el) return;
    el.classList.add('cn-expanded');
    const ta = el.querySelector('.cn-edit-area');
    if (ta && nodeEdits.has(categoryId)) {
        ta.value = nodeEdits.get(categoryId);
    }
    _expandedId = categoryId;
}
```

**Verify:** Console: `expandNode('career')` → career node expands.

---

### Step 6 — Replace `onNodeClick` stub

**Change:** Replace the stub body:
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

**Verify:** Click career node → expands. Click again → collapses. Click career → then
click health → career collapses, health expands (one at a time).

---

### Step 7 — Extend `renderCategoryNodes` to build textarea and close button

**Change:** Inside the `CATEGORY_NODES.forEach` callback, after the
`el.innerHTML = ...` assignment and before `el.addEventListener('click', ...)`,
insert:

```js
// Textarea for goal editing
const ta = document.createElement('textarea');
ta.className = 'cn-edit-area';
ta.placeholder = 'Add or refine your goals\u2026';
if (nodeEdits.has(cat.id)) ta.value = nodeEdits.get(cat.id);
ta.addEventListener('input', function() { nodeEdits.set(cat.id, ta.value); });
ta.addEventListener('mousedown', function(e) { e.stopPropagation(); });
ta.addEventListener('wheel',     function(e) { e.stopPropagation(); });
el.appendChild(ta);

// Close button
const closeBtn = document.createElement('button');
closeBtn.className = 'cn-close-btn';
closeBtn.textContent = '\u2715';
closeBtn.title = 'Collapse';
closeBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    collapseNode();
});
el.appendChild(closeBtn);

// Stop canvas pan when interacting with expanded node
el.addEventListener('mousedown', function(e) {
    if (_expandedId === cat.id) e.stopPropagation();
});
```

**Verify:** Expand a node — textarea appears. Type in textarea — value saved.
Navigate away (page 4) and back (page 3) — renderCategoryNodes re-runs. Re-expand
same node — textarea shows saved text.

---

### Step 8 — Add global collapse listeners

**Change:** After the `// T-001-05: expand node detail panel` stub comment (or at end
of script before `</script>`), add:

```js
// T-001-05: global collapse — Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && _expandedId) collapseNode();
});
```

Also add inside the `navigateToPage` patch (or in a standalone registration block)
a canvas-root click listener for click-outside collapse. This must run AFTER
`initCanvas` is called, so add it within the `if (n === 3)` branch of the patched
`navigateToPage`, guarded with a flag to avoid re-registration:

```js
// T-001-05: click-outside to collapse (registered once)
if (!_collapseListenerAdded) {
    document.getElementById('canvas-root').addEventListener('click', function(e) {
        if (!_expandedId) return;
        const expandedEl = document.getElementById('cn-' + _expandedId);
        if (expandedEl && !expandedEl.contains(e.target)) {
            collapseNode();
        }
    });
    _collapseListenerAdded = true;
}
```

Add `let _collapseListenerAdded = false;` alongside `_expandedId`.

**Verify:** Expand a node. Click canvas background → collapses. Re-expand. Press
Escape → collapses. Re-expand. Click a different node → first collapses, second opens.

---

## Testing Checklist

| Test | Expected |
|------|----------|
| Click node | Expands to ~280×340 rounded rect |
| Click same node again | Collapses back to original shape |
| Click different node | First collapses, second opens |
| Escape key | Collapses expanded node |
| Click canvas background | Collapses expanded node |
| Click close (✕) button | Collapses |
| Expanded node z-index | Sits visually above all other nodes |
| Type in textarea | Text visible |
| Navigate to page 4, back to page 3 | Typed text persists in textarea |
| Pan canvas while node expanded | Panning works; doesn't trigger when clicking inside node |
| Scroll inside textarea | Canvas does not zoom |
| Expand career node | All 3+ goals bullets visible (not clipped) |
| Hover expanded node | No scale transform applied |

---

## Commit Plan

Single atomic commit after all 8 steps are complete and checklist passes:

```
T-001-05: expand category nodes in-place with goals + editable textarea
```

Changes: CSS transition extension + T-001-05 CSS block + JS expand/collapse
functions + textarea/close button wiring + global collapse listeners.
