# Research: T-001-07 wire-into-app-flow

## File Inventory

Single deliverable: `mindshift.html` (~1431 lines). No build step, no external modules.
All CSS, HTML, and JS are inline. Runs by opening in a browser.

---

## Page Structure (HTML)

| ID     | Role                        | Current state                                      |
|--------|-----------------------------|----------------------------------------------------|
| page1  | Welcome / intro             | Static copy + "Let's Start →" → navigateToPage(2) |
| page2  | Onboarding form (4 Qs)      | q1 (now), q2 (future), q3 (stuck), q4 (area dropdown) |
| page3  | Canvas mind map             | `#canvas-root` > `#canvas-world`, `#canvas-svg`, `#canvas-controls` |
| page4  | Choose Your Lens (persona)  | 4 persona cards + custom input; "← Back to Map" → navigateToPage(3) |
| page5  | Persona deep-dive           | "← Try Another Lens" → navigateToPage(4); "Back to Map" → navigateToPage(3) |

---

## Navigation System

`navigateToPage(n)` (lines 729-732) — original function: toggles `.active` class on `.container`s.

**Monkey-patch** (lines 1395-1427) wraps the original:
- `n === 3` branch: adds `body.canvas-mode`, centred view (once via `_canvasCentred`),
  calls `initCanvas()`, `renderHubNode()`, `renderCategoryNodes(userData)`, `renderArrows()`,
  and registers the click-outside collapse listener (once via `_collapseListenerAdded`).
- Other `n`: removes `canvas-mode`, resets CanvasTransform.

`createMindMap()` (lines 759-778): validates form, sets `userData`, shows 2.5s loading spinner,
then calls `navigateToPage(3)`.

---

## userData Object

Populated in `createMindMap()`:
```js
userData = {
  now:    q1.value,   // current situation (text)
  future: q2.value,   // 5-year vision (text)
  stuck:  q3.value,   // stuck / foggy / scary (text)
  area:   q4.value    // career | money | relationships | confidence | creative | health
}
```

---

## Canvas Components (prior tickets)

### T-001-01 — Canvas infrastructure
- `CanvasTransform` object (x, y, scale; min 0.3, max 2.0)
- `initCanvas()` — pan (mousedown/mousemove/mouseup), scroll zoom, touch pan/pinch,
  zoom buttons (zoom-in-btn, zoom-out-btn, zoom-reset-btn)
- `applyTransform()` — sets `#canvas-world` CSS transform

### T-001-02 — Hub node
- `HUB_CATEGORIES` array (7 labels displayed as subtitle)
- `renderHubNode()` — idempotent; creates `#hub-node` if absent; fills `.hub-body`
  with `userData.future` text or placeholder

### T-001-03 — Category nodes
- `CATEGORY_NODES` array (7 nodes: career, creativity, health, relationships, travel,
  finances, living; each has id, label, colorClass, shapeClass, width, height, wx, wy,
  header, goals[], areaKey)
- `renderCategoryNodes(userData)` — idempotent (removes existing .canvas-node before
  re-creating); for each node, if `areaKey === userData.area`, prepends a 60-char snippet
  of `userData.future` to the goals list

### T-001-04 — Arrow connectors
- `ARROW_OFFSETS`, `ellipseEdge()`, `renderArrows()` — SVG cubic bezier arrows in world-space

### T-001-05 — Node expand/collapse
- `nodeEdits` Map (session persistence of textarea values), `_expandedId`, `_collapseListenerAdded`
- `collapseNode()`, `expandNode(id)`, `onNodeClick(id)`
- Global Escape listener; click-outside via canvas-root listener

---

## What Exists for Page 3 Already

**Canvas IS page3.** Prior tickets (T-001-01 through T-001-05) replaced the old linear mind map
content entirely. The `#page3` div now only contains `#canvas-root`. No old HTML fragments remain.

**But dead code persists:**
- `generateGaps()`, `generateLevers()`, `generateMoves()` (lines 780–847) — functions that
  built the old mind map content cards. They are never called after T-001-01 replaced page3.
- CSS for `.mindmap`, `.node`, `.node h4`, `.node-content`, `.connector` (lines 128–158) —
  old page3 card layout styles; no corresponding HTML exists anymore.

---

## Missing for T-001-07

### 1. "Choose Your Lens →" button on canvas
No button exists on page3 that navigates to page4. The only way to reach page4 is if a user
knows to manually call navigateToPage(4). Must be added as a floating overlay in `#canvas-root`.

### 2. Back from canvas to onboarding (page 2) with warning
No button exits the canvas back to the form. Must warn the user that returning resets the map
(because createMindMap re-populates userData and navigateToPage(3) re-renders nodes, clearing
nodeEdits visually once nodes are rebuilt with new data). Need a confirm dialog.

### 3. "← Back to Map" state preservation (page4 → page3)
page4 already has `onclick="navigateToPage(3)"` (line 701). On navigate-to-page-3, the patch
calls `renderHubNode()` and `renderCategoryNodes(userData)`. `renderCategoryNodes` removes and
recreates all `.canvas-node` elements, but then re-applies `nodeEdits` values from the Map.
`_expandedId` is not restored after re-render (see T-001-05 known limitation). Overall: node
content and textarea edits survive, but expanded state does not — acceptable.

### 4. Career node + other nodes populated from onboarding answers
Currently:
- `userData.future` → hub body text ✅
- Career node: header is always "I work at a company I love" (static); goals prepend future
  snippet only if `userData.area === 'career'`. If user's focus is on career, the header
  should reflect their q1/q4 context.
- Other nodes: fully static regardless of user answers.

Ticket requires "career node content from q1 and q4 selection" and "remaining nodes with
sensible defaults derived from the answers." This means dynamic node generation is needed.

### 5. Page5 "Back to Map" button
Line 711: `<button onclick="navigateToPage(3)">Back to Map</button>` — already present ✅.

---

## Constraints

- Vanilla JS/HTML — no imports, no module bundler.
- Single file: all changes go into `mindshift.html`.
- The "warn before back" behavior must use native `confirm()` (no custom modal needed for lo-fi).
- State: `userData` is a module-level `let` — safe to read at any time after createMindMap.
- `nodeEdits` Map and `_expandedId` are also module-level — survive navigation.
- Dead CSS (`generateGaps` etc.) can be removed without risk; nothing references it.
