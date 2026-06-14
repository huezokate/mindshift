# Progress: T-002-02 node-component-refinement

## Status: Complete

## Steps Completed

### Step 1 — Wizard tokens
Added 13 new CSS custom properties to `:root`: `--page-body-from/to`, `--card-bg/border/radius`, `--input-bg/border/text`, `--btn-from/to`, `--text-primary/secondary/muted`.

### Steps 2–4 — Dark theme: all wizard pages (commit `a5fd09a`)
- `body`: gradient uses `--page-body-from/to` (deep navy → indigo)
- `.container`: dark glassmorphism (`--card-bg`, `backdrop-filter: blur(20px)`, `--card-border`)
- `h1, h2, p, label`: use text tokens
- `h3`: uses `--hub-accent` (periwinkle)
- `button`: `--btn-from/to` gradient + lavender glow on hover
- `input/textarea/select`: dark bg, light text, accent focus ring, placeholder muted
- `.ai-helper`: dark glass card instead of hot pink gradient
- `.persona-card`: dark glass, accent border on hover
- `.deep-dive-section`: dark glass, accent left border, light text
- `.back-button`: transparent ghost style, accent on hover
- `.custom-persona`: dark glass + dashed lavender border
- `.loading-overlay`: dark blurred overlay

### Step 5 — Canvas node shape fix (commit `a51fb63`)
- Added `background: transparent` to `.canvas-node`
- Added `.canvas-node::before { content:''; position:absolute; inset:0; border-radius:inherit; z-index:0; }`
- Added `.canvas-node > * { position:relative; z-index:1; }`
- Color classes: `background:` removed, moved to `::before` rules
- Shape classes: `clip-path` moved to `::before` rules
- Removed `padding-top: 30%` from triangle (no longer needed)
- Removed `overflow: hidden` from base (no longer clips content)
- `.cn-expanded::before { clip-path: none !important; border-radius: 18px; }` — expanded state renders as full rectangle
- Removed `clip-path: polygon(0%...) !important` override from `.cn-expanded` (now unnecessary)

## Deviations
Scope expanded mid-flight to include all wizard pages (user requested cohesion across app).
