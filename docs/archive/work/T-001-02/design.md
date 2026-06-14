# Design: T-001-02 central-hub-node

## Options Considered

### Option A — Render in navigateToPage patch

Add `renderHubNode()` call inside the existing `navigateToPage` override when
`n === 3`. The function creates the hub if it does not exist, or updates its
content if `userData` has changed.

**Pros:**
- Single injection point; works for direct URL navigation (`?page=3`) and the
  normal flow equally.
- No changes to `createMindMap()`.
- Idempotent guard (`if (!document.getElementById('hub-node'))`) keeps it safe
  on repeated visits (back from page 4).

**Cons:**
- Slightly surprising to put DOM work inside a navigation function.
- Hub content update on re-visit (back-button) may momentarily flash new content;
  acceptable since `userData` doesn't change between pages 3 and 4.

### Option B — Render inside createMindMap, after timeout

Call `renderHubNode()` just before `navigateToPage(3)` inside the `setTimeout`
callback in `createMindMap()`.

**Pros:**
- Only runs when the user completes the form; won't fire on direct nav.
- Clear causal link: user fills form → map generated → hub appears.

**Cons:**
- Direct navigation (`?page=3`) leaves a blank canvas. The ticket requires
  placeholder text in that case, so we need a second injection path anyway.
- Splits the logic across two callsites.

### Option C — Call from initCanvas

Add `renderHubNode()` as the last step of `initCanvas()`, after event handlers
are set up. Guard with `_canvasInitialized` ensures it runs exactly once.

**Cons:**
- `initCanvas` is a pure infrastructure function; mixing content rendering there
  mixes concerns.
- If we later need to re-render the hub (different user session), we'd need to
  undo the guard.

---

## Decision: Option A

Option A is chosen. It is the most minimal change and handles both the normal
flow and the direct-navigation case uniformly. The guard pattern (check for
existing `#hub-node`) makes it safe to call multiple times.

The `navigateToPage` patch already exists for T-001-01; extending it keeps all
canvas-mode orchestration in one place.

---

## Hub Node Visual Design

**Shape:** Ellipse (border-radius: 50%) or soft pill. The Figma lo-fi shows an
irregular blob shape, but reproducing that in pure CSS without SVG clip-path
masks is noisy. A wide oval (`border-radius: 50% / 40%`) achieves an organic
feel while being cross-browser safe. The ticket says "distinct visual style
(larger, different shape or weight)" — an oval at ~220×160px satisfies this.

**Typography:**
- Title: "In 5 years..." as a small label, light weight, muted colour.
- Body: `userData.future` text, capped at max-width with `word-wrap: break-word`.
- Subtitle: "career · personal development · relationships · health & wellness ·
  travel · finances · creativity" in a smaller, lighter font.

**Colour palette** (matches dark canvas background `#1a1a2e`):
- Background: semi-transparent white with blur (`rgba(255,255,255,0.08)` +
  `backdrop-filter: blur(8px)`), similar to the canvas control buttons.
- Border: `1px solid rgba(255,255,255,0.2)` — soft glow.
- Title text: `#a78bfa` (soft purple) to stand out as label.
- Body text: `#e2e8f0` (near-white).
- Subtitle text: `rgba(255,255,255,0.45)` (muted).

**Size:** `max-width: 280px`. Height auto-grows with content.

**Positioning:**
The hub must visually appear at the canvas centre when the map is first shown.
`#canvas-world` is `position:absolute; width:0; height:0` — everything inside
uses `position:absolute` and coordinates relative to world origin. The initial
`CanvasTransform` is `x=0, y=0, scale=1`, so world (0,0) maps to the viewport's
top-left corner. To centre the hub, we set the initial pan to
`(vw/2, vh/2)` so world (0,0) is at screen centre. The hub element then uses
`transform: translate(-50%, -50%)` to centre itself on world (0,0).

The centering pan must happen every time page 3 is entered (the user may have
zoomed/panned away on a previous visit; resetting to centred view is
appropriate on re-entry). It runs before `initCanvas()` is called (or inside it
before the guard exits early).

**Interaction:** `pointer-events: none` on the hub so all clicks fall through to
the pan handler. The ticket says "clicking the hub does nothing" — the simplest
guarantee is to make it non-interactive entirely, rather than a no-op click
handler. The cursor over it will inherit `grab` from `#canvas-root`.

**Text overflow:** `overflow: hidden; max-height: 180px` on the body text, with
`text-overflow: ellipsis` on a clamped container, prevents the node from growing
unboundedly for very long user inputs.

---

## Placeholder Text

When `userData.future` is empty/absent:
- Body shows: `"Your 5-year vision will appear here"`
- Style: italic, reduced opacity.

---

## Centering Strategy Detail

Inside the patched `navigateToPage` when `n === 3`:
```
// Centre world-origin on screen before init
const root = document.getElementById('canvas-root');
const vw = root.offsetWidth || window.innerWidth;
const vh = root.offsetHeight || window.innerHeight;
CanvasTransform.x = vw / 2;
CanvasTransform.y = vh / 2;
CanvasTransform.scale = 1;
applyTransform();
```

This must run before `initCanvas()` only on first entry (otherwise
the user's pan state is overwritten on back-button). A flag
`_canvasCentred` guards it.

---

## Rejected Approach: SVG foreignObject

Using SVG `<foreignObject>` to embed the hub in the SVG layer was considered
because the SVG layer already exists for edges. Rejected because:
- `foreignObject` has well-known rendering quirks in cross-browser environments.
- Mixing HTML and SVG layout is harder to reason about.
- The canvas world's HTML layer is the correct home for node content.
