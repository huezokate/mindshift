# Structure: T-001-03 category-nodes

## Files Changed

### `mindshift.html` — modified (only file)

No new files are created. All changes are additions within the single HTML file.

---

## CSS Additions (inside `<style>`)

Append a new block after the existing `/* === Canvas Mode (T-001-01) === */` block.

```
/* === Category Nodes (T-001-03) === */
```

### `.canvas-node` — base node styles

Properties:
- `position: absolute` — placed in `#canvas-world`
- `display: flex; flex-direction: column; align-items: center; justify-content: center`
- `padding: 14px 16px`
- `cursor: pointer`
- `transition: transform 0.15s ease, filter 0.15s ease`
- `text-align: center`
- `overflow: hidden` (clips content to shape)

### `.canvas-node:hover`

- `transform: scale(1.06)`
- `filter: brightness(1.06) drop-shadow(0 4px 16px rgba(0,0,0,0.22))`

### `.canvas-node .cn-label`

- Category label (e.g., "career")
- `font-size: 0.65em; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.7; margin-bottom: 4px`

### `.canvas-node .cn-header`

- Aspiration headline (e.g., "I work at a company I love")
- `font-size: 0.78em; font-weight: 700; line-height: 1.3; margin-bottom: 6px`

### `.canvas-node .cn-goals`

- Bullet list
- `font-size: 0.7em; line-height: 1.5; list-style: none; text-align: left; padding: 0; margin: 0`

### `.canvas-node .cn-goals li::before`

- `content: "• "; opacity: 0.6`

### Per-category color classes

One class per category that sets `background` and `color`:

- `.cn-career` — bg `#ffd6e0`, color `#7c2d52`
- `.cn-creativity` — bg `#fde68a`, color `#78350f`
- `.cn-health` — bg `#bbf7d0`, color `#166534`
- `.cn-relationships` — bg `#fecaca`, color `#7f1d1d`
- `.cn-travel` — bg `#bfdbfe`, color `#1e3a5f`
- `.cn-finances` — bg `#d1fae5`, color `#065f46`
- `.cn-living` — bg `#e0e7ff`, color `#312e81`

### Per-category shape classes

- `.cn-shape-ellipse` — `clip-path: ellipse(50% 42% at 50% 50%)`
- `.cn-shape-triangle` — `clip-path: polygon(50% 0%, 100% 87%, 0% 87%)`; top padding increase to center text below triangle apex.
- `.cn-shape-diamond` — `clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)`
- `.cn-shape-blob` — `clip-path: polygon(20% 0%, 82% 8%, 100% 55%, 62% 100%, 0% 82%)` (irregular)
- `.cn-shape-pentagon` — `clip-path: polygon(50% 0%, 100% 35%, 82% 100%, 18% 100%, 0% 35%)`
- `.cn-shape-rect` — `border-radius: 16px` (no clip-path needed)
- `.cn-shape-rect-tall` — `border-radius: 16px` (taller aspect, same rule)

---

## JS Additions (inside `<script>`)

Append after `// --- Canvas Infrastructure (T-001-01) ---` block, before the `navigateToPage` patch.

### `CATEGORY_NODES` constant

Array of 7 node descriptor objects:

```js
const CATEGORY_NODES = [
  {
    id: 'career',
    label: 'career',
    colorClass: 'cn-career',
    shapeClass: 'cn-shape-ellipse',
    width: 180, height: 150,
    wx: 0,    wy: -260,
    header: 'I work at a company I love',
    goals: ['Senior IC or lead role', 'Work I\'m proud of', 'Strong team relationships'],
    areaKey: 'career',
  },
  {
    id: 'creativity',
    label: 'creativity',
    colorClass: 'cn-creativity',
    shapeClass: 'cn-shape-triangle',
    width: 170, height: 170,
    wx: 220,  wy: -160,
    header: 'I publish my novel',
    goals: ['Write 500 words daily', 'Finish first draft', 'Find a writing group'],
    areaKey: null,
  },
  {
    id: 'health',
    label: 'health & wellness',
    colorClass: 'cn-health',
    shapeClass: 'cn-shape-diamond',
    width: 170, height: 170,
    wx: 280,  wy: 60,
    header: 'I feel strong & energized',
    goals: ['Run 3x per week', 'Sleep 7–8 hrs', 'Consistent nutrition'],
    areaKey: 'health',
  },
  {
    id: 'relationships',
    label: 'relationships',
    colorClass: 'cn-relationships',
    shapeClass: 'cn-shape-blob',
    width: 175, height: 165,
    wx: 160,  wy: 260,
    header: 'I have deep connections',
    goals: ['Weekly quality time', 'Honest communication', 'New friendships'],
    areaKey: 'relationships',
  },
  {
    id: 'travel',
    label: 'travel',
    colorClass: 'cn-travel',
    shapeClass: 'cn-shape-pentagon',
    width: 175, height: 165,
    wx: -160, wy: 260,
    header: 'I explore the world',
    goals: ['2 international trips/yr', 'Learn a new language', 'Live abroad for 3 mo'],
    areaKey: null,
  },
  {
    id: 'finances',
    label: 'finances',
    colorClass: 'cn-finances',
    shapeClass: 'cn-shape-rect',
    width: 165, height: 135,
    wx: -280, wy: 60,
    header: 'I am financially free',
    goals: ['6-month emergency fund', 'Consistent investing', 'Debt-free'],
    areaKey: 'money',
  },
  {
    id: 'living',
    label: 'living situation',
    colorClass: 'cn-living',
    shapeClass: 'cn-shape-rect-tall',
    width: 155, height: 195,
    wx: -220, wy: -160,
    header: 'I live where I thrive',
    goals: ['Own or rent a space I love', 'Intentional neighbourhood', 'Home that feels like me'],
    areaKey: null,
  },
];
```

### `renderCategoryNodes(userData)` function

- Idempotent: clears any existing `.canvas-node` elements from `#canvas-world` first.
- Iterates `CATEGORY_NODES`, creates a DOM element per node.
- Inserts DOM into `#canvas-world`.
- Wires click handler per node: `node.addEventListener('click', () => onNodeClick(cat.id))`.

### `onNodeClick(categoryId)` function (stub)

```js
function onNodeClick(categoryId) {
    // T-001-05: expand node detail panel
    console.log('node clicked:', categoryId);
}
```

### Integration with `createMindMap()`

After `navigateToPage(3)` call (inside the `setTimeout`):

1. Call `renderCategoryNodes(userData)`.
2. Center the canvas: set `CanvasTransform.x = window.innerWidth / 2`, `CanvasTransform.y = window.innerHeight / 2`, call `applyTransform()`.

---

## DOM Output Shape (per node)

```html
<div class="canvas-node cn-career cn-shape-ellipse"
     id="cn-career"
     style="width:180px;height:150px;left:..px;top:..px">
  <span class="cn-label">career</span>
  <span class="cn-header">I work at a company I love</span>
  <ul class="cn-goals">
    <li>Senior IC or lead role</li>
    <li>Work I'm proud of</li>
    <li>Strong team relationships</li>
  </ul>
</div>
```

Position calculation: `left = wx - width/2`, `top = wy - height/2` (world-space px).

---

## Change Ordering

1. CSS block added after T-001-01 CSS (lines ~413).
2. JS constants and functions added after T-001-01 JS block (lines ~875), before `navigateToPage` patch.
3. `createMindMap()` patched to call `renderCategoryNodes` and center canvas after navigating.

---

## What Is NOT Changed

- `navigateToPage` patch — untouched.
- `CanvasTransform` object — untouched.
- `initCanvas()` — untouched.
- Pages 1, 2, 4, 5 HTML/CSS — untouched.
- Old `.node` styles — untouched (irrelevant, no conflict).
