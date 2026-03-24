# Design: T-002-02 node-component-refinement

## Scope Expansion

User request: "make sure all the app pages have cohesive components."

T-002-02 covers two areas:
1. **Canvas node shape fix** — `::before` pseudo-element separates shape from text
2. **Wizard page cohesion** — pages 1/2/4/5 get the same design language as the canvas

---

## Area 1: Node Shape Fix

### Approach: `::before` pseudo-element

- `.canvas-node` becomes a transparent container (no `background`)
- `.canvas-node::before` is absolutely positioned (inset: 0), gets background + clip-path
- All direct children get `position: relative; z-index: 1` so they render above the pseudo
- `.cn-{id}::before` rules carry background colors (moved from `.cn-{id}`)
- `.cn-shape-*::before` rules carry clip-path (moved from `.cn-shape-*`)
- `.cn-shape-rect/rect-tall` keep `border-radius` on the container; `::before` inherits via `border-radius: inherit`
- `.cn-expanded::before { clip-path: none !important; }` — removes shape clip in expanded state

No JS changes needed.

---

## Area 2: Wizard Page Cohesion

### Current wizard state

Pages 1, 2, 4, 5 use:
- `body`: purple gradient background (`#667eea` → `#764ba2`)
- `.container`: white card, 800px max-width, heavy padding, drop shadow
- `button`: purple gradient, pill shape
- `input/textarea/select`: white background, blue focus border
- `h1/h2`: dark gray text
- `p`: medium gray text

This creates a visual split: wizard pages look like a generic SaaS form, canvas looks like MindShift.

### Design direction

Apply the old UI's deep palette to the wizard pages. Key moves:
- **Body background**: keep gradient but shift to the MindShift dark purple: `#1a1a2e` → `#312e81` diagonal (echoes old UI `#4a0e6b`)
- **Cards/containers**: dark glassmorphism instead of stark white — `rgba(255,255,255,0.06)` with blur, border `rgba(255,255,255,0.12)`, off-white text
- **Buttons**: periwinkle/violet gradient (`#667eea` → `#a78bfa`) — matches hub accent color
- **Inputs**: dark background `rgba(255,255,255,0.08)`, white text, `#a78bfa` focus border
- **Typography**: `h1/h2` → white/near-white; `p/label` → `rgba(255,255,255,0.75)`
- **Progress dots** (if present): use `--hub-accent` purple
- **Persona cards**: dark glassmorphism with subtle border

### Tokens to add

New tokens in `:root` for wizard pages:
```css
--page-body-from:   #1a1a2e;
--page-body-to:     #312e81;
--card-bg:          rgba(255, 255, 255, 0.06);
--card-border:      rgba(255, 255, 255, 0.12);
--card-radius:      20px;
--input-bg:         rgba(255, 255, 255, 0.08);
--input-border:     rgba(255, 255, 255, 0.18);
--input-text:       #f1f5f9;
--btn-from:         #667eea;
--btn-to:           #a78bfa;
--text-primary:     #f1f5f9;
--text-secondary:   rgba(255, 255, 255, 0.65);
--text-muted:       rgba(255, 255, 255, 0.4);
```

### Elements to update

| Element | Current | New |
|---|---|---|
| `body` | `linear-gradient(135deg, #667eea, #764ba2)` | `linear-gradient(135deg, var(--page-body-from), var(--page-body-to))` |
| `.container` | white card | dark glass card |
| `h1, h2` | dark gray | `var(--text-primary)` |
| `h3` | `#667eea` | `var(--hub-accent)` |
| `p, label` | medium gray | `var(--text-secondary)` |
| `button` | purple gradient | `--btn-from` → `--btn-to` gradient |
| `button:hover` | no change | slightly brightened, same gradient |
| `input, textarea, select` | white bg | dark bg, light text |
| `.persona-card` | white border card | dark glass |
| `.back-button` | light style | ghost/outline dark style |
| `.step-indicator` dots | blue/gray | `--hub-accent` active, muted inactive |
| `.ai-helper` | light card | dark glass |

---

## Visual Continuity

The goal is that navigating from wizard → canvas feels like moving *deeper into* the same world, not switching apps. The wizard is dark/ethereal, the canvas is darker/spacial — same palette family.

Pages 4 and 5 (gap analysis + persona) should also feel cohesive: dark base, colored text for section titles, subtle card borders.
