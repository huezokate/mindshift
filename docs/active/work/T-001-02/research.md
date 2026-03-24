# Research: T-001-02 central-hub-node

## File Inventory

Single file: `mindshift.html` (~921 lines). No build step, no modules. All HTML,
CSS, and JS inline.

---

## Page Structure

Five `.container` divs (`#page1`–`#page5`) managed by `navigateToPage(n)`.

- **page1** — welcome/intro
- **page2** — onboarding form (q1–q4)
- **page3** — canvas (T-001-01; no content yet)
- **page4** — persona selector
- **page5** — persona output

Navigation is controlled by toggling `.active` class. CSS hides all `.container`
except `.active`.

---

## User Data

`userData` object, populated in `createMindMap()` (line 573):

```js
userData = {
    now:    document.getElementById('q1').value,   // "where are you now"
    future: document.getElementById('q2').value,   // "where you want to be in 5–10 years"
    stuck:  document.getElementById('q3').value,   // "what feels stuck"
    area:   document.getElementById('q4').value    // select: career | money | relationships | confidence | creative | health
}
```

`userData.future` (q2) is the text that the ticket says must appear in the hub node
body. It is populated before `navigateToPage(3)` is called, so it is available by
the time the canvas initialises.

---

## Canvas Infrastructure (T-001-01)

### DOM Skeleton (lines 466–476)
```html
<div class="container" id="page3">
  <div id="canvas-root">
    <div id="canvas-world"></div>            <!-- transformed layer -->
    <svg id="canvas-svg" …></svg>            <!-- SVG overlay for edges -->
    <div id="canvas-controls">…</div>        <!-- zoom buttons, fixed -->
  </div>
</div>
```

### CanvasTransform (lines 702–732)
Global object: `x`, `y`, `scale`, `MIN_SCALE` (0.3), `MAX_SCALE` (2.0).
- `toScreen(wx, wy)` → screen coords
- `toWorld(sx, sy)` → world coords
- `toCSSTransform()` → CSS transform string
- `reset()` → zeroes x, y, scale=1

### applyTransform() (line 734)
Reads `CanvasTransform` and applies as `style.transform` to `#canvas-world`.

### initCanvas() (lines 741–875)
Guarded by `_canvasInitialized` flag. Sets up mouse/wheel/touch event handlers
on `#canvas-root`. On re-entry calls only `applyTransform()`.

### navigateToPage patch (lines 905–917)
Wraps original `navigateToPage`:
- `n === 3` → adds `body.canvas-mode`, calls `initCanvas()`
- Otherwise → removes `body.canvas-mode`, resets transform

### canvas-mode CSS (lines 334–412)
`body.canvas-mode` makes the body `display:block; padding:0; background:#1a1a2e`.
`#page3.container` becomes `position:fixed; 100vw×100vh`.
`#canvas-world` is `position:absolute; top:0; left:0; width:0; height:0;
transform-origin:0 0`. Nodes placed inside it use absolute pixel positioning.
`#canvas-svg` is `position:absolute; pointer-events:none; overflow:visible`.

---

## What Is Currently Empty

`#canvas-world` has no children. `createMindMap()` calls `navigateToPage(3)` but
adds nothing to the world. The canvas is a blank dark screen.

---

## Life Categories

The Figma lo-fi shows 7 satellite nodes: career, creativity, health & wellness,
relationships, travel, finances, Scandinavia (a custom one). The ticket says the
hub node subtitle should list "the life categories that have satellite nodes".

Since satellites do not exist yet, T-001-02 must establish the category list
and use it in the hub. The canonical 7 from the Figma are:

1. career
2. personal development
3. relationships
4. health & wellness
5. travel
6. finances
7. creativity

These align with the existing `q4` select options (career, money, relationships,
confidence, creative, health) but are slightly different—the canvas uses the
full-form category names. For T-001-02 the hub subtitle is static: it always
lists all 7 categories (the satellites ticket will control which exist; the hub
just names them).

---

## Constraints

- No framework, no build. DOM manipulation only.
- Hub node lives in `#canvas-world` as an absolutely-positioned `<div>`.
- World coordinate (0, 0) is the top-left corner of `#canvas-world`.
  Canvas pans so world (0,0) maps to screen (0,0) initially, then offset by
  `CanvasTransform.x/y`. Hub node must be centered on world (0,0), so it must
  be offset by `-width/2, -height/2`.
- Initial transform is `translate(0, 0) scale(1)`. To center the hub on screen,
  `initCanvas` (or its caller) must set the initial pan so world (0,0) maps
  to the viewport centre.
- `userData` may be empty if the user navigates directly to page 3 via URL param.
  In that case the hub must show placeholder text.
- Click handlers on `#canvas-root` use `e.button !== 0` guard; the hub should
  not propagate clicks to the pan handler (cursor style should be default, not
  grab).

---

## Entry Points for Hub Injection

`createMindMap()` already calls `navigateToPage(3)` after a 2.5 s timeout. The
simplest hook is to call a `renderHubNode()` function either:
  (a) just before `navigateToPage(3)` inside `createMindMap()`, or
  (b) inside the patched `navigateToPage` when `n === 3`.

Option (b) keeps rendering close to the canvas init and works for direct
navigation too. However `navigateToPage` runs every time page 3 is visited
(including back-button from page 4), so it must be idempotent (create once,
update content on re-visit).

---

## Relevant Lines Summary

| Concern | Lines |
|---|---|
| userData populated | 574–580 |
| createMindMap navigates | 588–591 |
| canvas-mode CSS | 334–412 |
| CanvasTransform object | 702–732 |
| applyTransform | 734–737 |
| _canvasInitialized guard | 739–746 |
| initCanvas body | 741–875 |
| navigateToPage patch | 905–917 |
| page3 DOM | 466–476 |
