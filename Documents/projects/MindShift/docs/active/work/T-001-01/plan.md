# Plan: T-001-01 canvas-infrastructure

## Implementation Order

Steps are ordered by dependency. Each step is independently verifiable.

---

### Step 1 — Add canvas-mode CSS

**What:** Add CSS rules to the `<style>` block for `body.canvas-mode`, `#canvas-root`,
`#canvas-world`, `#canvas-svg`, and `#canvas-controls`.

**Rules to add:**

```css
/* === Canvas Mode === */
body.canvas-mode {
    display: block;
    padding: 0;
    background: #1a1a2e;
}
body.canvas-mode #page3.container {
    position: fixed;
    top: 0; left: 0;
    width: 100vw;
    height: 100vh;
    max-width: none;
    padding: 0;
    border-radius: 0;
    box-shadow: none;
    background: #1a1a2e;
    overflow: hidden;
    display: block;
}
#canvas-root {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    cursor: grab;
    user-select: none;
}
#canvas-root.dragging {
    cursor: grabbing;
}
#canvas-world {
    position: absolute;
    top: 0; left: 0;
    width: 0; height: 0;
    transform-origin: 0 0;
    will-change: transform;
}
#canvas-svg {
    position: absolute;
    top: 0; left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: visible;
}
#canvas-controls {
    position: absolute;
    bottom: 24px;
    right: 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 10;
}
#canvas-controls button {
    width: 40px;
    height: 40px;
    padding: 0;
    margin: 0;
    border-radius: 8px;
    font-size: 1.2em;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.3);
    color: white;
    backdrop-filter: blur(4px);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}
#canvas-controls button:hover {
    background: rgba(255,255,255,0.25);
    transform: none;
    box-shadow: none;
}
```

**Verify:** Open the file in browser, navigate to page3 via URL `?page=3`. The page should
fill the viewport with dark background. No layout shift on other pages.

**Commit:** `step 1: add canvas-mode CSS rules`

---

### Step 2 — Replace Page3 HTML

**What:** Replace the contents of `#page3` with the canvas DOM structure.

**New HTML:**
```html
<div class="container" id="page3">
    <div id="canvas-root">
        <div id="canvas-world"></div>
        <svg id="canvas-svg" xmlns="http://www.w3.org/2000/svg"></svg>
        <div id="canvas-controls">
            <button id="zoom-in-btn" title="Zoom in">+</button>
            <button id="zoom-out-btn" title="Zoom out">−</button>
            <button id="zoom-reset-btn" title="Reset view">⊙</button>
        </div>
    </div>
</div>
```

**Verify:** Navigate to `?page=3`. Canvas root fills page. No JS errors (yet — canvas
controls won't work until Step 5).

**Commit:** `step 2: replace page3 HTML with canvas DOM structure`

---

### Step 3 — Add CanvasTransform Object

**What:** Add `CanvasTransform` to the JS block (appended after existing code).

```js
// --- Canvas Infrastructure (T-001-01) ---

const CanvasTransform = {
    x: 0,
    y: 0,
    scale: 1,
    MIN_SCALE: 0.3,
    MAX_SCALE: 2.0,

    toScreen(wx, wy) {
        return {
            x: wx * this.scale + this.x,
            y: wy * this.scale + this.y
        };
    },

    toWorld(sx, sy) {
        return {
            x: (sx - this.x) / this.scale,
            y: (sy - this.y) / this.scale
        };
    },

    toCSSTransform() {
        return `translate(${this.x}px, ${this.y}px) scale(${this.scale})`;
    },

    reset() {
        this.x = 0;
        this.y = 0;
        this.scale = 1;
    }
};

function applyTransform() {
    const world = document.getElementById('canvas-world');
    if (world) world.style.transform = CanvasTransform.toCSSTransform();
}
```

**Verify:** Open browser console. `CanvasTransform.toScreen(100, 100)` → `{x:100, y:100}`.
`CanvasTransform.toWorld(100, 100)` → `{x:100, y:100}`. `CanvasTransform.toCSSTransform()`
→ `"translate(0px, 0px) scale(1)"`.

**Commit:** `step 3: add CanvasTransform coordinate helper`

---

### Step 4 — Add initCanvas() with Pan, Zoom, Touch, and Button Handlers

**What:** Add `initCanvas()` function. It attaches all interaction event listeners.

```js
let _canvasInitialized = false;

function initCanvas() {
    if (_canvasInitialized) {
        applyTransform();
        return;
    }
    _canvasInitialized = true;

    const root = document.getElementById('canvas-root');

    // --- Pan ---
    let dragging = false, dragStartX = 0, dragStartY = 0, panStartX = 0, panStartY = 0;

    root.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        dragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        panStartX = CanvasTransform.x;
        panStartY = CanvasTransform.y;
        root.classList.add('dragging');
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        CanvasTransform.x = panStartX + (e.clientX - dragStartX);
        CanvasTransform.y = panStartY + (e.clientY - dragStartY);
        applyTransform();
    });

    document.addEventListener('mouseup', () => {
        if (!dragging) return;
        dragging = false;
        root.classList.remove('dragging');
    });

    // --- Scroll Zoom ---
    root.addEventListener('wheel', (e) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.1 : 0.9;
        const newScale = Math.min(Math.max(
            CanvasTransform.scale * factor,
            CanvasTransform.MIN_SCALE
        ), CanvasTransform.MAX_SCALE);

        const rect = root.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        CanvasTransform.x = mouseX - (mouseX - CanvasTransform.x) * (newScale / CanvasTransform.scale);
        CanvasTransform.y = mouseY - (mouseY - CanvasTransform.y) * (newScale / CanvasTransform.scale);
        CanvasTransform.scale = newScale;
        applyTransform();
    }, { passive: false });

    // --- Touch: pan + pinch ---
    let lastTouches = null;

    root.addEventListener('touchstart', (e) => {
        lastTouches = Array.from(e.touches).map(t => ({ x: t.clientX, y: t.clientY }));
        e.preventDefault();
    }, { passive: false });

    root.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touches = Array.from(e.touches).map(t => ({ x: t.clientX, y: t.clientY }));

        if (touches.length === 1 && lastTouches && lastTouches.length === 1) {
            // Single-finger pan
            CanvasTransform.x += touches[0].x - lastTouches[0].x;
            CanvasTransform.y += touches[0].y - lastTouches[0].y;
        } else if (touches.length === 2 && lastTouches && lastTouches.length === 2) {
            // Pinch zoom
            const prevDist = Math.hypot(
                lastTouches[1].x - lastTouches[0].x,
                lastTouches[1].y - lastTouches[0].y
            );
            const newDist = Math.hypot(
                touches[1].x - touches[0].x,
                touches[1].y - touches[0].y
            );
            const factor = newDist / prevDist;
            const newScale = Math.min(Math.max(
                CanvasTransform.scale * factor,
                CanvasTransform.MIN_SCALE
            ), CanvasTransform.MAX_SCALE);

            const rect = root.getBoundingClientRect();
            const midX = (touches[0].x + touches[1].x) / 2 - rect.left;
            const midY = (touches[0].y + touches[1].y) / 2 - rect.top;

            CanvasTransform.x = midX - (midX - CanvasTransform.x) * (newScale / CanvasTransform.scale);
            CanvasTransform.y = midY - (midY - CanvasTransform.y) * (newScale / CanvasTransform.scale);
            CanvasTransform.scale = newScale;

            // Also pan from midpoint movement
            const prevMidX = (lastTouches[0].x + lastTouches[1].x) / 2;
            const prevMidY = (lastTouches[0].y + lastTouches[1].y) / 2;
            CanvasTransform.x += (touches[0].x + touches[1].x) / 2 - prevMidX;
            CanvasTransform.y += (touches[0].y + touches[1].y) / 2 - prevMidY;
        }

        lastTouches = touches;
        applyTransform();
    }, { passive: false });

    root.addEventListener('touchend', (e) => {
        lastTouches = Array.from(e.touches).map(t => ({ x: t.clientX, y: t.clientY }));
    });

    // --- Zoom Buttons ---
    document.getElementById('zoom-in-btn').addEventListener('click', () => {
        const rect = root.getBoundingClientRect();
        const cx = rect.width / 2, cy = rect.height / 2;
        const newScale = Math.min(CanvasTransform.scale * 1.2, CanvasTransform.MAX_SCALE);
        CanvasTransform.x = cx - (cx - CanvasTransform.x) * (newScale / CanvasTransform.scale);
        CanvasTransform.y = cy - (cy - CanvasTransform.y) * (newScale / CanvasTransform.scale);
        CanvasTransform.scale = newScale;
        applyTransform();
    });

    document.getElementById('zoom-out-btn').addEventListener('click', () => {
        const rect = root.getBoundingClientRect();
        const cx = rect.width / 2, cy = rect.height / 2;
        const newScale = Math.max(CanvasTransform.scale / 1.2, CanvasTransform.MIN_SCALE);
        CanvasTransform.x = cx - (cx - CanvasTransform.x) * (newScale / CanvasTransform.scale);
        CanvasTransform.y = cy - (cy - CanvasTransform.y) * (newScale / CanvasTransform.scale);
        CanvasTransform.scale = newScale;
        applyTransform();
    });

    document.getElementById('zoom-reset-btn').addEventListener('click', () => {
        CanvasTransform.reset();
        applyTransform();
    });

    applyTransform();
}
```

**Verify:**
- Navigate to page3. Drag canvas — cursor changes to `grabbing`.
- Scroll wheel — zoom in/out.
- Zoom buttons work.
- Console: `CanvasTransform.scale` changes as expected after zoom.

**Commit:** `step 4: add initCanvas with pan, zoom, pinch, and button handlers`

---

### Step 5 — Patch navigateToPage and createMindMap

**What:**

Patch `navigateToPage`:
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

Edit `createMindMap()`: Remove the five lines that write to `#now-content` through
`#moves-content` (those elements no longer exist). The function still populates `userData`
and calls `navigateToPage(3)`.

**Verify:**
- Flow: page1 → page2 → fill form → "Create My Map" → page3 canvas appears. Body has
  `canvas-mode`. CanvasTransform is at origin.
- Navigate back to page4 → body loses `canvas-mode`. CanvasTransform resets.
- Navigate back to page3 → canvas reappears, pan/zoom reset to origin.
- No console errors about missing elements.

**Commit:** `step 5: patch navigateToPage for canvas-mode and reset; clean createMindMap`

---

## Testing Strategy

### Manual Verification Checklist

| Test | Expected |
|---|---|
| `?page=3` direct load | Full viewport canvas, dark background, no 800px card |
| Drag canvas | Cursor changes, `#canvas-world` translates |
| Scroll zoom in | Scale increases up to 2.0, zooms toward cursor |
| Scroll zoom out | Scale decreases down to 0.3 |
| Zoom buttons +/−/⊙ | Scale changes around center / resets to 1 |
| Navigate page2→3→2→3 | Canvas resets to origin on each return to page3 |
| Complete form and submit | Page3 shown as canvas, no JS errors |
| Pinch (touch simulator or real device) | Pinch zoom works |
| Resize window | Canvas fills viewport (fixed positioning) |
| Chrome, Firefox, Safari | No regressions on other pages |

### What Cannot Be Unit Tested (Single-File, No Test Framework)

- All interaction logic is event-handler based; no isolated units to test.
- Manual browser verification is the primary test method.

### No Automated Tests Added

The existing codebase has no test infrastructure. Adding a test framework is out of scope
for this ticket.
