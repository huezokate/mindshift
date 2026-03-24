# Plan: T-002-01 design-tokens-and-figma

## Steps

### Step 1 — Add `:root {}` design token block

Insert as first rule inside `<style>`, before `* { margin: 0... }`.

Contains all tokens: canvas bg, hub colors, 14 node palette tokens, typography scale,
spacing, arrow reference values. ~45 lines.

Commit: `T-002-01: add :root design token block`

---

### Step 2 — Update canvas + hub CSS to use tokens

**Canvas:**
- `body.canvas-mode`: `background: #1a1a2e` → `background: var(--canvas-bg)`

**Hub:**
- `#hub-node`: `background: rgba(...)` → `background: var(--hub-bg)`, `border-color` → `var(--hub-border)`
- `.hub-label`: `color: #a78bfa` → `color: var(--hub-accent)`
- `.hub-body`: `color: #e2e8f0` → `color: var(--hub-text)`
- `.hub-body.placeholder`: `color: rgba(...)` → inline or `var(--hub-sub)`
- `.hub-subtitle`: `color` → `var(--hub-sub)`

Commit: `T-002-01: apply tokens to canvas and hub CSS`

---

### Step 3 — Update node base + typography CSS to use tokens

**Base:**
- `.canvas-node`: add `font-size: var(--cn-font-base)`, `line-height: var(--cn-lh-base)`
- `.canvas-node`: `padding: 14px 16px` → `padding: var(--cn-pad-y) var(--cn-pad-x)`
- `.canvas-node`: add `gap: var(--cn-gap)` (if flex column already set, gap replaces margins)

**Typography:**
- `.cn-label`: `font-size: 0.62em` → `font-size: var(--cn-font-label)`
- `.cn-header`: `font-size: 0.76em` → `font-size: var(--cn-font-header)`
- `.cn-goals`: `font-size: 0.68em` → `font-size: var(--cn-font-goals)`, `line-height` → `var(--cn-lh-goals)`

**Shape tokens:**
- `.cn-shape-rect`, `.cn-shape-rect-tall`: `border-radius: 16px` → `border-radius: var(--cn-radius)`

Commit: `T-002-01: apply tokens to node base and typography CSS`

---

### Step 4 — Update color classes to use fg tokens

Replace hardcoded `color:` and `background:` on each category class:
```css
.cn-career        { color: var(--cn-career-fg);        background: var(--cn-career-bg); }
.cn-creativity    { color: var(--cn-creativity-fg);    background: var(--cn-creativity-bg); }
/* etc. */
```

Note: the `background:` value here is temporary — it will be moved to `::before` in T-002-02.
The color values themselves are the refined palette from the design.

Commit: `T-002-01: apply palette tokens to color classes`

---

### Step 5 — Create Figma "Design System / S-002" frame

Use Figma Plugin API to create:
- A frame at (18000, 0) on Page 1, named "Design System / S-002"
- Color swatch grid: 7 paired node swatches + semantic swatches
- Typography specimen block on dark background
- 7 node specimens (styled rectangles showing color + label/header/goals text)

Commit: `T-002-01: create Figma design system reference frame`

---

## Verification

- [ ] Open `mindshift.html` in browser, navigate to page 3
- [ ] All 7 nodes show correct pastel colors (no regressions)
- [ ] Hub still renders correctly
- [ ] Canvas background still #1a1a2e
- [ ] In DevTools: `getComputedStyle(document.documentElement).getPropertyValue('--cn-career-bg')` returns `#ffd6cc`
- [ ] Figma file updated with Design System frame visible
