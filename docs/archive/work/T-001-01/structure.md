# Structure: T-001-01 canvas-infrastructure

## Files Changed

| File | Change |
|---|---|
| `mindshift.html` | Modified — CSS additions, HTML changes to page3, JS additions |

No new files are created. No files are deleted. Everything stays in the single HTML file.

---

## mindshift.html — Change Map

### 1. CSS Block (`<style>` tag) — Additions

Added after existing rules (no existing rules are deleted or modified):

```
/* === Canvas Mode: body override === */
body.canvas-mode { ... }
body.canvas-mode #page3.container { ... }

/* === Canvas Root === */
#canvas-root { ... }

/* === Canvas World (pannable/zoomable layer) === */
#canvas-world { ... }

/* === Canvas SVG Overlay === */
#canvas-svg { ... }

/* === Canvas UI controls (zoom buttons, etc.) === */
#canvas-controls { ... }
```

Existing `.mindmap`, `.node`, `.connector` rules remain for pages 1–2, 4–5 and are not
referenced by the canvas. They are dead CSS once page3 is replaced but cause no harm.

### 2. HTML — Page 3 Replacement

**Before:**
```html
<div class="container" id="page3">
    <h2>Your Mind Map</h2>
    <p>...</p>
    <div class="mindmap">
        <div class="node">...</div>  <!-- 5 nodes + connectors -->
    </div>
    <div class="ai-helper" onclick="navigateToPage(4)">...</div>
</div>
```

**After:**
```html
<div class="container" id="page3">
    <div id="canvas-root">
        <div id="canvas-world">
            <!-- Node elements will be injected here by node-rendering tickets -->
        </div>
        <svg id="canvas-svg" xmlns="http://www.w3.org/2000/svg">
            <!-- Arrow paths will be injected here -->
        </svg>
        <div id="canvas-controls">
            <button id="zoom-in-btn" title="Zoom in">+</button>
            <button id="zoom-out-btn" title="Zoom out">−</button>
            <button id="zoom-reset-btn" title="Reset view">⊙</button>
        </div>
    </div>
</div>
```

**Removed from page3:**
- `<h2>Your Mind Map</h2>` and its `<p>` — not needed in spatial canvas view.
- `<div class="mindmap">` and all its children (5 static `.node` divs with `#now-content` etc.).
- `<div class="ai-helper">` — this will become a floating overlay or separate navigation
  element once nodes are implemented; for now, omitted from infrastructure.

**Note on removed element IDs:** `#now-content`, `#future-content`, `#gaps-content`,
`#levers-content`, `#moves-content` are removed from the DOM. `createMindMap()` still
writes to them — this will silently fail (writing to null). `createMindMap()` will be updated
to not write to those IDs (or to pass data via `userData` only), which is safe since no
downstream code reads those div contents directly.

### 3. JS Block (`<script>` tag) — Additions and Patches

**Location:** Additions appended to the existing `<script>` block (after `viewCustomPersona`
and before the closing `</script>`).

#### 3a. CanvasTransform object (new)

```js
const CanvasTransform = { x, y, scale, MIN_SCALE, MAX_SCALE, toScreen(), toWorld(), toCSSTransform(), reset() }
```

Public interface:
- `toScreen(wx, wy)` → `{x, y}` — converts world coords to screen coords
- `toWorld(sx, sy)` → `{x, y}` — converts screen coords to world coords
- `toCSSTransform()` → string for `#canvas-world`'s `style.transform`
- `reset()` — resets to x=0, y=0, scale=1

#### 3b. applyTransform() function (new)

Updates `#canvas-world`'s `style.transform`. Called after any state change.

#### 3c. initCanvas() function (new)

Attaches all event listeners to `#canvas-root` and `document`. Called once (guarded by
an `initialized` flag) when page3 is first entered. Also attaches zoom button handlers.

Event listeners attached:
- `#canvas-root`: `mousedown`, `wheel`, `touchstart`, `touchmove`, `touchend`
- `document`: `mousemove`, `mouseup` (for drag tracking)
- `#zoom-in-btn`, `#zoom-out-btn`, `#zoom-reset-btn`: `click`

#### 3d. navigateToPage patch (modification)

The existing `navigateToPage` function is preserved. A wrapper is applied immediately
after the function declaration:

```js
const _navigateToPage_orig = navigateToPage;
navigateToPage = function(n) {
    if (n === 3) {
        document.body.classList.add('canvas-mode');
        initCanvas();
    } else if (document.body.classList.contains('canvas-mode')) {
        document.body.classList.remove('canvas-mode');
        CanvasTransform.reset();
        applyTransform();
    }
    _navigateToPage_orig(n);
};
```

**Why a wrapper instead of editing the original function body?**
Minimizes diff size and keeps the existing function readable. The patch is clearly labeled.

#### 3e. createMindMap() patch (modification)

The lines that write to `#now-content`, `#future-content`, etc. are removed (those elements
no longer exist). `createMindMap()` still populates `userData` and calls `navigateToPage(3)`.
The userData will be consumed by future node-rendering code.

---

## Internal Organization Within the JS Block

```
[existing code unchanged]
    let userData = {}
    function navigateToPage(pageNum) { ... }
    (IIFE for URL params)
    function showLoading / hideLoading
    function createMindMap
    function generateGaps / generateLevers / generateMoves
    function viewPersona / getPersonaContent / viewCustomPersona

[appended canvas infrastructure]
    // --- Canvas Infrastructure (T-001-01) ---
    const CanvasTransform = { ... }
    function applyTransform() { ... }
    function initCanvas() { ... }
    // patch navigateToPage
    const _navigateToPage_orig = navigateToPage;
    navigateToPage = function(n) { ... }
    // patch createMindMap (remove dead ID writes)
```

The patch to `createMindMap` is done by redefining the function or by editing its body directly.
Since the function body is short and contained, we edit it in place.

---

## Module Boundaries and Public Interfaces

This is a single-file app with no modules. The "public interface" is:

**CanvasTransform** — exported to window scope (accessible by future node/arrow rendering tickets):
- `CanvasTransform.toScreen(wx, wy)`
- `CanvasTransform.toWorld(sx, sy)`
- `CanvasTransform.x`, `.y`, `.scale` (readable)

**applyTransform()** — exported to window scope:
- Future node/arrow rendering code calls this after updating CanvasTransform externally.

**#canvas-world** — the DOM element into which nodes are injected by future tickets.

**#canvas-svg** — the SVG element into which arrow paths are injected by future tickets.

---

## Ordering of Changes

1. Add CSS rules (no dependency).
2. Replace page3 HTML (no dependency on JS).
3. Append canvas JS (CanvasTransform, applyTransform, initCanvas).
4. Patch navigateToPage (depends on CanvasTransform and initCanvas being defined).
5. Edit createMindMap to remove dead element writes (independent, but logical last step).

---

## What Is Not Changed

- Pages 1, 2, 4, 5 — untouched.
- `.container`, `.container.active` — untouched (page3 overrides via `body.canvas-mode`).
- `navigateToPage` original function body — untouched (wrapped, not modified).
- `userData` global — untouched, still the data store.
- All existing persona/mindmap generation functions — untouched except `createMindMap` cleanup.
- Loading overlay — untouched (still z-index 1000, still works on all screens).
