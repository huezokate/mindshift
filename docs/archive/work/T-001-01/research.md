# Research: T-001-01 canvas-infrastructure

## Overview

The goal is to add a full-viewport, pannable, zoomable canvas with an SVG overlay to `mindshift.html`.
This research maps the existing codebase structure relevant to that addition.

---

## Codebase: mindshift.html

Single-file vanilla HTML/CSS/JS, ~689 lines. No build step, no external JS dependencies.
One external script tag: `https://mcp.figma.com/mcp/html-to-design/capture.js` (async, for Figma capture).

---

## Screen / Navigation System

### DOM Structure

Five page `div`s with `id="page1"` through `id="page5"`, all sharing class `.container`.

```
#page1  — landing / intro
#page2  — question form (current situation, future, stuck, area)
#page3  — mind map display  ← TARGET for canvas replacement
#page4  — persona selection
#page5  — persona deep-dive
```

A `.loading-overlay` (position: fixed, z-index: 1000) sits outside the `.container`s.

### Navigation Function

```js
function navigateToPage(pageNum) {
    document.querySelectorAll('.container').forEach(c => c.classList.remove('active'));
    document.getElementById('page' + pageNum).classList.add('active');
}
```

- Removes `.active` from all `.container` divs, adds it to the target.
- No lifecycle hooks — no "entering" or "leaving" callbacks exist.
- Called from button `onclick` attributes and from URL-param initialization block.

### URL Param Init Block

An IIFE at script start reads `?page=N&persona=NAME` and calls `navigateToPage(N)`.
This can navigate directly to page3, which means the canvas must initialize correctly
even when landed on directly.

---

## Current Page 3 Content

```html
<div class="container" id="page3">
    <h2>Your Mind Map</h2>
    <p>...</p>
    <div class="mindmap">
        <!-- 5 static .node divs with .connector arrows between them -->
    </div>
    <div class="ai-helper" onclick="navigateToPage(4)">...</div>
</div>
```

The `.mindmap` div is a plain stacked layout — not a spatial canvas. It holds `.node` divs
with `.connector` arrows (just text `↓`) between them. These are populated by `createMindMap()`.

---

## Relevant CSS: Body and Container

```css
body {
    font-family: ...;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
}

.container {
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    max-width: 800px;
    width: 100%;
    padding: 50px;
    display: none;
}

.container.active {
    display: block;
    animation: fadeIn 0.5s ease;
}
```

**Key constraint:** `body` is a flex container that centers children. `.container` has
`max-width: 800px` and `padding: 50px`. A full-viewport canvas for page3 cannot live
inside this layout as-is — it would be clipped at 800px and padded 50px on all sides.

---

## Relevant CSS: Mindmap and Nodes

```css
.mindmap {
    margin: 30px 0;
    position: relative;
}
.node {
    background: #f7fafc;
    border: 2px solid #667eea;
    border-radius: 12px;
    padding: 20px;
    margin: 15px 0;
    position: relative;
}
```

These are the existing static node styles. They will be replaced/superseded by the canvas approach.

---

## State Management

```js
let userData = {};
```

Single global. Populated in `createMindMap()` from form values. Read in `generateGaps()`,
`generateLevers()`, `generateMoves()`, `getPersonaContent()`, `viewCustomPersona()`.

No existing canvas state. There is no pan/zoom state, no transform matrix, no world-coordinate
tracking. Everything must be introduced.

---

## createMindMap() Flow

1. Reads `#q1–#q4` values into `userData`.
2. Validates all fields present.
3. Shows loading overlay for 2.5s.
4. Populates `#now-content`, `#future-content`, `#gaps-content`, `#levers-content`, `#moves-content`.
5. Calls `navigateToPage(3)`.

All five target elements (`#now-content` etc.) are inside `#page3 .mindmap`. The canvas
implementation must account for these IDs either preserving them or replacing them.

---

## No Existing Canvas / SVG Infrastructure

- No `<canvas>` elements.
- No `<svg>` elements.
- No `pointer-events`, `wheel`, `touchstart`, `touchmove` handlers.
- No `requestAnimationFrame` loops.
- No coordinate transform utilities.

---

## Browser Compatibility Constraints (from ticket)

- Latest Chrome, Firefox, Safari.
- No framework, vanilla JS only.
- `pointer-events` API is universally supported.
- `WheelEvent` with `deltaY` is universally supported.
- `Touch` events (touchstart/touchmove/touchend) are supported on Safari mobile.
- CSS `transform` with `translate` + `scale` is universally supported.
- `<svg>` overlay over a `div` is straightforward with `position: absolute`.

---

## Acceptance Criteria Mapping → Code Gaps

| Criterion | Current State | Gap |
|---|---|---|
| Full-viewport canvas on page3 | 800px max-width card | Must override/escape body flex + container sizing |
| Pan by click-drag | None | Mouse/pointer event handlers needed |
| Zoom by scroll (0.3–2x) | None | WheelEvent handler needed |
| Pinch zoom on mobile | None | Touch event handlers needed |
| SVG overlay for arrows | None | `<svg>` element positioned above canvas |
| World/screen coordinate helper | None | Transform encapsulation needed |
| State resets on nav away/back | None | Reset hook into navigateToPage needed |
| Cross-browser | N/A | Use standard APIs |

---

## Assumptions and Constraints

1. **Single-file constraint**: All changes go into `mindshift.html`. No separate JS/CSS files.
2. **Existing node IDs**: `#now-content` etc. can be removed or repurposed since the new
   mind map screen will have a different visual structure. The static nodes are placeholder content.
3. **No framework**: All pan/zoom must be implemented in vanilla JS.
4. **Body layout override**: For page3 to be full-viewport, its container must escape the
   `body` flex centering. Options: (a) override styles when page3 is active, (b) move page3
   outside body flex, (c) make page3 `position: fixed` over everything.
5. **navigateToPage is the only nav hook**: Reset logic must hook into this function or
   intercept calls to it.
6. **Loading overlay z-index**: Currently 1000. Canvas z-index must stay below this.
7. **The Figma design reference** (Lo-fi new UI for mind map screen) shows a spatial canvas
   centered on "In 5 years..." with 7 organic nodes. This ticket is only the infrastructure
   (pan, zoom, SVG layer, coordinate system). Node rendering is a separate ticket.
