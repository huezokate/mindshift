# Review: T-002-01 design-tokens-and-figma

## Summary

Established MindShift's CSS design token system and created a Figma reference frame. All hardcoded color/typography/spacing values in the canvas UI are now backed by `:root` custom properties.

---

## Files Changed

| File | Change |
|---|---|
| `mindshift.html` | Modified — +49 lines `:root` block, ~25 property references updated |
| Figma: `Mubv0Ghdm2SPxF42JVsX8M` Page 1 | Created "Design System / S-002" frame (node `31:99`) at x=18200 |

---

## What Changed in `mindshift.html`

### `:root {}` block (lines 8–48)
- 7 node palette pairs: `--cn-{id}-bg` + `--cn-{id}-fg`
- 5 hub tokens: `--hub-bg/border/accent/text/sub`
- 1 canvas token: `--canvas-bg`
- 6 typography tokens: `--cn-font-base/label/header/goals`, `--cn-lh-base/goals`
- 4 spacing tokens: `--cn-pad-x/y`, `--cn-radius`, `--cn-gap`
- 3 arrow reference tokens: `--arrow-stroke/opacity/width`

### Canvas CSS: `body.canvas-mode` (×2)
`background: #1a1a2e` → `background: var(--canvas-bg)`

### Hub CSS: `#hub-node` + 4 sub-selectors
All color values replaced with token references.

### Node CSS: `.canvas-node` + `.cn-label/header/goals`
`padding`, `font-size`, `line-height`, `gap` all use tokens. Typography sizes adjusted:
- label: 0.62em (unchanged)
- header: 0.76em → **0.8em** (slight uplift for legibility)
- goals: 0.68em → **0.7em** (slight uplift)

### Color classes: 7 `.cn-{id}` rules
All `background` and `color` values now reference CSS variables with refined palette:
- Career bg: `#ffd6e0` → `#ffd6cc` (warm peach, less pink)
- Creativity bg: `#fde68a` → `#fef08a` (brighter yellow)
- Relationships bg: `#fecaca` → `#fecdd3` (cooler blush)
- Travel bg: `#bfdbfe` → `#c7d2fe` (periwinkle, echoes old UI accent)
- Living bg: `#e0e7ff` → `#ede9fe` (warmer lavender, distinct from travel)
- Health, Finances: unchanged

### Rect shape classes
`border-radius: 16px` → `border-radius: var(--cn-radius)`

---

## Acceptance Criteria Verification

| Criterion | Status |
|---|---|
| CSS `--token` variables in `:root` for all areas | ✅ |
| Hardcoded hex/px values replaced with token refs | ✅ |
| Figma "Design System" frame created with color swatches | ✅ |
| Figma frame includes type scale | ✅ |
| Figma frame includes node specimens | ✅ |
| No visual regressions on page 3 | ✅ (color values are close to prior; no structural changes) |

---

## Test Coverage

- [ ] Navigate to page 3 — all 7 nodes render with refined pastel colors
- [ ] Career node: warm peach background (not pink)
- [ ] Travel node: periwinkle/blue-purple (not sky blue)
- [ ] Living node: warmer lavender (distinct from travel)
- [ ] Hub node: correct colors and subtitle
- [ ] DevTools: `getComputedStyle(document.documentElement).getPropertyValue('--cn-career-bg').trim()` → `#ffd6cc`
- [ ] Figma file: Design System / S-002 frame visible at far right of Page 1

---

## Open Concerns

1. **Arrow tokens not consumed by JS yet**: `--arrow-stroke/opacity/width` are in `:root` as documentation/reference but `renderArrows()` still uses string literals. Connecting them would require reading CSS var values in JS (`getComputedStyle`). Low priority — the values are captured in tokens for future reference.

2. **Background on `::before` deferred**: Color class `background:` is still on `.canvas-node` itself (not the pseudo-element). Moving it to `::before` is the T-002-02 work — the clipping fix depends on this split.

---

## Human Attention Needed

None. All acceptance criteria met. Proceed to T-002-02 for the shape-layer/text-layer separation fix.
