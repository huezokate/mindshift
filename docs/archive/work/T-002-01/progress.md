# Progress: T-002-01 design-tokens-and-figma

## Status: Complete

## Steps Completed

### Step 1+2 — `:root` block + canvas/hub tokens
Commit `788fcd8`: Added 40-line `:root {}` block as first CSS rule. Updated `body.canvas-mode`, `#hub-node`, `.hub-label`, `.hub-body`, `.hub-body.placeholder`, `.hub-subtitle` to use token references.

### Step 3+4 — Node base + palette tokens
Commit `4f6434a`: Updated `.canvas-node` to use `--cn-font-base`, `--cn-lh-base`, `--cn-pad-x/y`, `--cn-gap`. Updated `.cn-label`, `.cn-header`, `.cn-goals` typography to token references. Replaced all 7 hardcoded color class values with `var(--cn-*-bg/fg)` references. Updated rect shape border-radius to `var(--cn-radius)`.

### Step 5 — Figma design system frame
Created "Design System / S-002" frame (id: 31:99) at x=18200, y=0 on Page 1 of Figma file `Mubv0Ghdm2SPxF42JVsX8M`. Frame contains:
- Color Palette section: 7 paired node swatches with bg + fg chips and token names
- Semantic Colors section: 5 canvas/hub swatches
- Typography Scale section: label / header / goals specimens on dark bg + spacing callout
- Node Component Specimens: 7 styled card artboards (one per category) with label, header, goals, shape badge
- Complete Token Reference table: 24 rows covering all tokens

## Deviations
None. All steps as planned.
