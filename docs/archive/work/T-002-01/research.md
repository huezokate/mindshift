# Research: T-002-01 design-tokens-and-figma

## Scope

Define MindShift's design system as CSS custom properties and create a Figma reference frame. Inspired by the old UI's palette (deep purple, periwinkle, warm pastels) but not copying it literally.

---

## Current State: CSS Values

All values are hardcoded in `mindshift.html` `<style>` block. No CSS custom properties exist.

### Node colors (inline hex, lines ~483–489)
```css
.cn-career       { background: #ffd6e0; color: #7c2d52; }
.cn-creativity   { background: #fde68a; color: #78350f; }
.cn-health       { background: #bbf7d0; color: #166534; }
.cn-relationships{ background: #fecaca; color: #7f1d1d; }
.cn-travel       { background: #bfdbfe; color: #1e3a5f; }
.cn-finances     { background: #d1fae5; color: #065f46; }
.cn-living       { background: #e0e7ff; color: #312e81; }
```

### Node typography (inline em values, lines ~421–481)
```css
.canvas-node .cn-label  { font-size: 0.62em; font-weight: 700; }
.canvas-node .cn-header { font-size: 0.76em; font-weight: 700; }
.canvas-node .cn-goals  { font-size: 0.68em; line-height: 1.5; }
```

### Node base (line ~421)
```css
.canvas-node {
    padding: 14px 16px;
    /* no font-size base defined — inherits from body */
}
```

### Canvas background (line ~336)
```css
body.canvas-mode { background: #1a1a2e; }
```

### Hub styling (lines ~414–464)
```css
#hub-node {
    background: rgba(255,255,255,0.08);
    border: 1.5px solid rgba(255,255,255,0.15);
    ...
}
#hub-node .hub-label { color: #a78bfa; }
#hub-node .hub-body  { color: #e2e8f0; }
```

### Arrow stroke (lines ~1382–1385)
Set via SVG attributes in JS: `stroke: '#2d2d2d'`, `opacity: '0.65'`, `stroke-width: '1.5'`.
These are in `renderArrows()` as string literals in `path.setAttribute(...)` calls.

---

## Old UI Color Analysis (from Figma screenshots)

Frame 1:21 (title slide) and 1:33 (user impact slide):
- Background: rich deep purple `#4a0e6b` (presentation bg), `#1a1a2e` (app mock bg)
- Accent 1: lavender/periwinkle `#667eea` (used for CTA text, nav)
- Accent 2: violet `#764ba2`
- Text: near-white `#f0e6ff`, warm whites
- Highlight: lime-green for "SHIFT" wordmark
- Overall mood: mysterious, forward-looking, sophisticated

The pastel nodes in the canvas are already a deliberate contrast to the dark canvas background. The palette is directionally right. Key improvements:
- Career: current `#ffd6e0` (pink) → shift to warm peach `#ffd6cc` — more terracotta, less bubblegum
- Travel: current `#bfdbfe` (sky blue) → shift to `#c7d2fe` (periwinkle) — echoes old UI accent
- Living: current `#e0e7ff` (cool lilac) → shift to `#ede9fe` (warmer lavender) — more distinct from travel
- Relationships: current `#fecaca` (red-pink) → `#fecdd3` (cooler blush) — more sophisticated
- Others: fine as-is

---

## Token Taxonomy

### Tier 1: Semantic tokens (what the token means)
```
--canvas-bg             canvas background color
--hub-bg                hub node background
--hub-border            hub node border
--hub-accent            hub "IN 5 YEARS…" label color
--hub-text              hub body text color
--hub-sub               hub subtitle text color
--cn-[id]-bg            category node background (7 tokens)
--cn-[id]-fg            category node text color (7 tokens)
```

### Tier 2: Typography tokens
```
--cn-font-base          base font-size for nodes (1em root)
--cn-font-label         category label size (relative)
--cn-font-header        header/vision statement size
--cn-font-goals         goal bullets size
--cn-lh-goals           goal bullets line-height
```

### Tier 3: Spacing + shape tokens
```
--cn-padding-x          horizontal padding
--cn-padding-y          vertical padding
--cn-radius             border-radius for rect shapes
--cn-gap                gap between label / header / goals
```

### Tier 4: Arrow tokens
```
--arrow-stroke          SVG stroke color
--arrow-opacity         SVG opacity
--arrow-width           SVG stroke-width
```

---

## Figma File Structure

Current page 1 (0:1) contains:
- Presentation frames (1:21, 1:27, 1:33) — old UI slides
- Large lo-fi mind map frame (4:81) — the original hand-drawn vision board

There is no dedicated design system page or frame. The Figma reference frame will be added to Page 1 (or a new page) as a standalone "Design System" frame containing:
1. Color swatches — 7 node palettes + semantic colors
2. Typography specimens — label / header / goals at correct sizes
3. Node specimens — one per shape/category showing the post-refinement design

---

## Integration Constraints

- All CSS is inline in `mindshift.html` — no separate stylesheet file
- `:root {}` block does not yet exist — will be added at top of `<style>` block
- Token names must not conflict with any existing CSS variable (none exist currently)
- JS in `renderArrows()` will still use string literals for SVG attributes; these should reference the same conceptual values but SVG attributes cannot use CSS variables directly
