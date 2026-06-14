# Structure: T-001-02 central-hub-node

## Files Changed

| File | Action |
|---|---|
| `mindshift.html` | Modified — add CSS block, add `renderHubNode()` function, extend `navigateToPage` patch |

No new files created.

---

## CSS Block (insert before `</style>`, after existing canvas-mode rules)

```
/* === Hub Node (T-001-02) === */
#hub-node {
    position: absolute;
    left: 0;
    top: 0;
    transform: translate(-50%, -50%);
    width: 280px;
    max-width: 280px;
    padding: 28px 32px;
    background: rgba(255, 255, 255, 0.07);
    border: 1.5px solid rgba(255, 255, 255, 0.22);
    border-radius: 50% / 35%;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: 0 0 40px rgba(167, 139, 250, 0.18), inset 0 0 20px rgba(255,255,255,0.03);
    pointer-events: none;
    cursor: default;
    text-align: center;
    z-index: 1;
}
#hub-node .hub-label {
    font-size: 0.7em;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #a78bfa;
    margin-bottom: 8px;
    font-weight: 600;
}
#hub-node .hub-body {
    font-size: 1em;
    color: #e2e8f0;
    line-height: 1.5;
    max-height: 120px;
    overflow: hidden;
    word-wrap: break-word;
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
}
#hub-node .hub-body.placeholder {
    font-style: italic;
    color: rgba(255, 255, 255, 0.35);
}
#hub-node .hub-subtitle {
    margin-top: 12px;
    font-size: 0.72em;
    color: rgba(255, 255, 255, 0.4);
    line-height: 1.6;
    letter-spacing: 0.02em;
}
```

---

## JavaScript: renderHubNode() function

New function, inserted in the `<script>` block after `initCanvas()` and before
the `navigateToPage` patch.

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

---

## navigateToPage Patch Extension

The existing patch (lines 905–917) is extended to:
1. Set initial centring pan (once, guarded by `_canvasCentred` flag).
2. Call `renderHubNode()` after `initCanvas()`.

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

---

## Component Boundaries

```
#canvas-world (T-001-01)
  └─ #hub-node (T-001-02)        ← new; world coords (0,0); transform: translate(-50%,-50%)
       ├─ .hub-label              "In 5 years…"
       ├─ .hub-body               userData.future or placeholder
       └─ .hub-subtitle           category list

#canvas-svg (T-001-01)           ← unchanged; edges will attach here in future tickets
```

---

## Ordering of Changes

1. Add CSS block (before `</style>`).
2. Add `HUB_CATEGORIES` const and `renderHubNode()` function (after `initCanvas`, before patch).
3. Replace the existing `navigateToPage` patch with the extended version.

All three changes are in `mindshift.html`. They can be made in one edit session.
There are no dependencies between step 1 and steps 2–3 (CSS can be added in
any order relative to JS, since the element doesn't exist until `renderHubNode`
runs).

---

## What Is NOT Changed

- `createMindMap()` — no change needed; it already calls `navigateToPage(3)`.
- `initCanvas()` — untouched; centering happens before it is called.
- `CanvasTransform` — untouched.
- pages 1, 2, 4, 5 — untouched.
- The SVG layer — untouched.
- Loading overlay — untouched.
