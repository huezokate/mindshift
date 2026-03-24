# Plan: T-001-02 central-hub-node

## Steps

### Step 1 — Add hub node CSS

Insert the `#hub-node` CSS block into `mindshift.html` just before `</style>`
(after the existing canvas-mode rules, ~line 412).

Rules to add:
- `#hub-node` — absolute positioning, oval shape via `border-radius: 50%/35%`,
  glass-morphism background, `pointer-events: none`, `transform: translate(-50%,-50%)`
- `.hub-label` — "In 5 years…" label styling
- `.hub-body` — user text, clamped to 5 lines
- `.hub-body.placeholder` — italic, muted
- `.hub-subtitle` — category list, small and muted

**Verification:** Open the file, check the new CSS is inside the `<style>` block.

---

### Step 2 — Add HUB_CATEGORIES constant and renderHubNode() function

Insert after `initCanvas()` closes (after line 875) and before the existing
`navigateToPage` patch (before line 905).

```js
const HUB_CATEGORIES = [
    'career', 'personal development', 'relationships',
    'health & wellness', 'travel', 'finances', 'creativity'
];

function renderHubNode() {
    const world = document.getElementById('canvas-world');
    let hub = document.getElementById('hub-node');
    if (!hub) {
        hub = document.createElement('div');
        hub.id = 'hub-node';
        hub.innerHTML = `
            <div class="hub-label">In 5 years…</div>
            <div class="hub-body"></div>
            <div class="hub-subtitle"></div>
        `;
        world.appendChild(hub);
    }

    const body = hub.querySelector('.hub-body');
    const subtitle = hub.querySelector('.hub-subtitle');
    const text = (userData && userData.future && userData.future.trim()) || '';

    if (text) {
        body.textContent = text;
        body.classList.remove('placeholder');
    } else {
        body.textContent = 'Your 5-year vision will appear here.';
        body.classList.add('placeholder');
    }

    subtitle.textContent = HUB_CATEGORIES.join(' · ');
}
```

**Verification:** The file has `renderHubNode` declared in `<script>`.

---

### Step 3 — Replace navigateToPage patch with extended version

The existing patch (lines 905–917) is replaced with the version that:
1. Introduces `let _canvasCentred = false;` before the patch.
2. On `n === 3`: sets centring pan once via `_canvasCentred` guard, then calls
   `initCanvas()` then `renderHubNode()`.
3. Else-branch is unchanged.

New patch:
```js
let _canvasCentred = false;

const _navigateToPage_orig = navigateToPage;
navigateToPage = function(n) {
    if (n === 3) {
        document.body.classList.add('canvas-mode');
        if (!_canvasCentred) {
            const root = document.getElementById('canvas-root');
            CanvasTransform.x = (root.offsetWidth  || window.innerWidth)  / 2;
            CanvasTransform.y = (root.offsetHeight || window.innerHeight) / 2;
            CanvasTransform.scale = 1;
            _canvasCentred = true;
        }
        initCanvas();
        renderHubNode();
    } else if (document.body.classList.contains('canvas-mode')) {
        document.body.classList.remove('canvas-mode');
        CanvasTransform.reset();
        applyTransform();
    }
    _navigateToPage_orig(n);
};
```

**Verification:** Search for `renderHubNode()` call and `_canvasCentred` in the
file.

---

### Step 4 — Manual browser verification

Open `mindshift.html` in a browser and verify each acceptance criterion:

1. **Normal flow:** Fill in page 2, especially q2 ("where you want to be"). Click
   "Create My Map". After loading, canvas appears with an oval hub node visually
   centred.
2. **Hub content:** The node shows the "In 5 years…" label, the q2 text in the
   body, and the category list below.
3. **Visual style:** Hub is larger and more prominent than a typical satellite
   (future tickets will add satellites; for now, verify size and glass style look
   correct in isolation).
4. **No click interaction:** Clicking anywhere on the hub still allows dragging
   the canvas (hub has `pointer-events: none`).
5. **Text wrap:** Enter a very long q2 answer (100+ words). Verify the hub clips
   at ~5 lines with no overflow outside the oval.
6. **Placeholder:** Navigate directly to `?page=3`. Hub shows "Your 5-year vision
   will appear here." in italic/muted style.
7. **Back navigation:** Go from page 3 to page 4 and back to page 3. Hub still
   renders; canvas does not double-initialise (check console for errors).

---

## Testing Strategy

This project has no automated test suite (vanilla HTML, no test runner). All
verification is manual in-browser.

Key scenarios to exercise manually:
- Empty `userData` (direct navigation to page 3)
- Short q2 text (1 sentence)
- Long q2 text (paragraph, 200+ chars)
- Back-and-forth navigation (pages 3 → 4 → 3)
- Zoom/pan after hub renders

No unit tests are written; the logic is too simple (one function, one DOM
insertion) and there is no test infrastructure to add to.

---

## Commit Strategy

One atomic commit after all three edit steps complete and manual verification
passes:

```
T-001-02: add central hub node — renders at canvas centre, shows vision text
```
