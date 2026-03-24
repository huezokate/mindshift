# Structure: T-001-07 wire-into-app-flow

## Files

| File | Change |
|---|---|
| `mindshift.html` | Modified — net ~+80 / -70 lines across CSS, HTML, JS |

No new files created. No files deleted.

---

## HTML Changes

### Inside `#page3 > #canvas-root` (after `#canvas-controls` div)

Add two new overlay buttons as siblings of `#canvas-controls`:

```html
<button id="canvas-back-btn" title="Back to form">← Back</button>
<button id="canvas-lens-btn">Choose Your Lens →</button>
```

Both are `position: absolute` overlays styled in the canvas CSS section.

---

## CSS Changes

### Remove (old page3 dead styles — lines ~128–158)
```css
.mindmap { ... }
.node { ... }
.node h4 { ... }
.node-content { ... }
.connector { ... }
```
These classes exist in CSS but no HTML uses them post-T-001-01.

### Add (inside `/* === Canvas Mode (T-001-01) === */` section or new sub-section)

```css
/* === Canvas Nav Buttons (T-001-07) === */
#canvas-lens-btn {
    position: absolute;
    bottom: 24px;
    left: 24px;
    z-index: 10;
    /* pill style consistent with .button defaults but overridden for canvas */
    background: rgba(102, 126, 234, 0.85);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255,255,255,0.3);
    color: white;
    font-size: 0.9em;
    font-weight: 600;
    padding: 10px 20px;
    border-radius: 24px;
    cursor: pointer;
    margin: 0;
    transition: background 0.2s;
}
#canvas-lens-btn:hover {
    background: rgba(118, 75, 162, 0.9);
    transform: none;
    box-shadow: none;
}
#canvas-back-btn {
    position: absolute;
    top: 16px;
    left: 16px;
    z-index: 10;
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255,255,255,0.2);
    color: rgba(255,255,255,0.7);
    font-size: 0.78em;
    font-weight: 500;
    padding: 6px 14px;
    border-radius: 16px;
    cursor: pointer;
    margin: 0;
    transition: background 0.2s, color 0.2s;
}
#canvas-back-btn:hover {
    background: rgba(255,255,255,0.18);
    color: white;
    transform: none;
    box-shadow: none;
}
```

---

## JS Changes

### 1. Remove dead functions (lines ~780–847)
Delete `generateGaps()`, `generateLevers()`, `generateMoves()`. These were used by old
page3 content and are never called in the current codebase.

### 2. New `deriveNodeContent(cat, userData)` helper
Location: before `renderCategoryNodes`, in the `// --- Category Nodes (T-001-03) ---` section.

```
function deriveNodeContent(cat, userData) {
    // Returns { header, goals } overrides for a node given user answers
    // Falls back to cat.header / cat.goals if no relevant user data
}
```

Internal logic:
- If `cat.areaKey` matches `userData.area`:
  - Career: header uses first 50 chars of `userData.now` (q1) if non-empty
  - Money/finances: header uses first 50 chars of `userData.future` if non-empty
  - Health: header uses static default (health q4 not strongly mapped to q1)
  - Relationships: header uses static default
  - confidence / creative: use static defaults for their matched nodes
- If `userData.future` is non-empty: prepend up to 60-char snippet to goals list for
  the area-matched node (this already partially happens; make it the canonical place)
- All non-area-matched nodes: return `{ header: cat.header, goals: cat.goals }` unchanged

### 3. Update `renderCategoryNodes` to use `deriveNodeContent`
Replace the inline `goals` derivation block (lines 1224-1227) and static `cat.header`
reference (line 1231) with a call to `deriveNodeContent(cat, userData)`.

### 4. navigateToPage patch — preserve CanvasTransform on page4/5

**Current behavior (buggy):**
```js
} else if (document.body.classList.contains('canvas-mode')) {
    document.body.classList.remove('canvas-mode');
    CanvasTransform.reset();      // ← wipes pan/zoom on every exit
    applyTransform();
}
```

**New behavior:**
```js
} else {
    document.body.classList.remove('canvas-mode');
    // Do NOT reset CanvasTransform here — preserve pan/zoom for return trip
}
```
CanvasTransform reset happens only in the back-to-form handler (see below).

### 5. Back button handler
Wire onclick of `#canvas-back-btn` after DOM is ready (can be inline onclick or in
navigateToPage patch's n===3 branch, registering once):

```js
function onCanvasBackClick() {
    if (!confirm('Going back will reset your mind map. Continue?')) return;
    collapseNode();
    nodeEdits.clear();
    userData = {};
    _canvasCentred = false;
    CanvasTransform.reset();
    applyTransform();
    navigateToPage(2);
}
```

Registration: inline `onclick="onCanvasBackClick()"` in HTML (simplest, consistent with
how other page buttons are wired in this codebase).

### 6. Lens button handler
Inline `onclick="navigateToPage(4)"` in HTML.

---

## Ordering of Changes

1. Remove dead CSS (`.mindmap`, `.node`, etc.) — no behavior change, safe first
2. Remove dead JS (`generateGaps`, `generateLevers`, `generateMoves`) — same
3. Add CSS for `#canvas-lens-btn` and `#canvas-back-btn`
4. Add HTML buttons inside `#canvas-root`
5. Add `deriveNodeContent()` function
6. Update `renderCategoryNodes` to call `deriveNodeContent`
7. Fix navigateToPage patch (remove CanvasTransform.reset on exit)
8. Add `onCanvasBackClick()` function

Each step is independently verifiable in the browser.

---

## Module Boundaries / Public Interface

No new module boundaries. All changes are within the single `<script>` tag.

New globals added to script scope:
- `deriveNodeContent(cat, userData)` — pure helper, no side effects
- `onCanvasBackClick()` — called from inline onclick; must be globally accessible

Existing globals unchanged in signature:
- `navigateToPage(n)` — internal behavior change (CanvasTransform no longer reset)
- `renderCategoryNodes(userData)` — same signature, enriched internals
