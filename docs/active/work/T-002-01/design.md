# Design: T-002-01 design-tokens-and-figma

## Decision Summary

**Define a `:root` CSS token block at the top of the `<style>` section. Replace all hardcoded values in node, hub, canvas, and arrow CSS with token references. Create a "Design System" frame in Figma with color swatches, type scale, and node specimens.**

---

## Token Values

### Colors — node palette

Refined from current values. Inspired by old UI's warmth and depth but translated to pastels that read on the dark canvas background.

| Category | bg token | bg value | fg token | fg value | Rationale |
|---|---|---|---|---|---|
| career | `--cn-career-bg` | `#ffd6cc` | `--cn-career-fg` | `#7c2d12` | Warm peach, terracotta text. More earthy than bubblegum pink |
| creativity | `--cn-creativity-bg` | `#fef08a` | `--cn-creativity-fg` | `#713f12` | Brighter yellow. Energetic, creative |
| health | `--cn-health-bg` | `#bbf7d0` | `--cn-health-fg` | `#14532d` | Sage green, forest text. Unchanged — works well |
| relationships | `--cn-relationships-bg` | `#fecdd3` | `--cn-relationships-fg` | `#881337` | Cooler blush vs current red-pink. More sophisticated |
| travel | `--cn-travel-bg` | `#c7d2fe` | `--cn-travel-fg` | `#312e81` | Periwinkle blue. Echoes old UI's `#667eea` accent family |
| finances | `--cn-finances-bg` | `#d1fae5` | `--cn-finances-fg` | `#065f46` | Mint green. Unchanged |
| living | `--cn-living-bg` | `#ede9fe` | `--cn-living-fg` | `#4c1d95` | Warmer lavender, distinct from travel's periwinkle |

### Colors — canvas + hub

| Token | Value | Usage |
|---|---|---|
| `--canvas-bg` | `#1a1a2e` | `body.canvas-mode` background |
| `--hub-bg` | `rgba(255,255,255,0.08)` | Hub node fill |
| `--hub-border` | `rgba(255,255,255,0.15)` | Hub node border |
| `--hub-accent` | `#a78bfa` | "IN 5 YEARS…" label |
| `--hub-text` | `#e2e8f0` | Hub body text |
| `--hub-sub` | `rgba(255,255,255,0.35)` | Hub category subtitle |

### Typography

| Token | Value | Usage |
|---|---|---|
| `--cn-font-base` | `13px` | `.canvas-node` base size |
| `--cn-lh-base` | `1.4` | `.canvas-node` line-height |
| `--cn-font-label` | `0.62em` | `.cn-label` |
| `--cn-font-header` | `0.8em` | `.cn-header` |
| `--cn-font-goals` | `0.7em` | `.cn-goals` |
| `--cn-lh-goals` | `1.55` | `.cn-goals` line-height |

`font-size: 13px` on `.canvas-node` provides a stable em base. Current code has no base
set on the node — it inherits from body which is a system-ui font at browser default
(16px). Setting 13px gives more control over the em scale.

### Spacing

| Token | Value | Usage |
|---|---|---|
| `--cn-pad-x` | `16px` | Node horizontal padding |
| `--cn-pad-y` | `14px` | Node vertical padding |
| `--cn-radius` | `16px` | Rect shape border-radius |
| `--cn-gap` | `6px` | Gap between label / header / goals |

### Arrow

| Token | Value | Usage |
|---|---|---|
| `--arrow-stroke` | `#2d2d2d` | SVG stroke color |
| `--arrow-opacity` | `0.65` | SVG opacity (used as float in JS) |
| `--arrow-width` | `1.5` | SVG stroke-width (used as float in JS) |

Arrow tokens are defined in CSS for documentation/reference but consumed by JS string
literals in `renderArrows()` since SVG attributes cannot directly reference CSS vars.

---

## Figma Reference Frame Design

A single frame "Design System / S-002" added to Page 1, placed to the right of existing
content at approximately x=10000, y=0.

Sections:
1. **Colors** — 14 swatches (bg+fg pair per category) + 4 semantic swatches (canvas, hub-bg, hub-accent, hub-text). Each swatch: 120×80px rounded rect, hex label below, token name above.

2. **Typography** — Text specimens showing: category label (uppercase, small), header (bold), goals item at correct em sizes. Dark background behind the specimens to show legibility in context.

3. **Node Specimens** — 7 artboards, one per node, showing the standardized design: shape background + text layout + correct colors. Each artboard sized to match the node's CSS dimensions.

---

## Rejected Options

**Global Sass/CSS variables file**: Would require a build step. Out of scope for this project (vanilla, no build).

**CSS-in-JS or design token JSON**: Same — no build step.

**Changing font stack**: Not in scope. Current system-ui stack is fine. Token work is about size/weight/spacing, not typeface.
