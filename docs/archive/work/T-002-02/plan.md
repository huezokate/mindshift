# Plan: T-002-02 node-component-refinement

## Steps

### Step 1 — Add wizard tokens to `:root`

Append ~13 new tokens to the existing `:root {}` block (wizard page variables).

Commit: `T-002-02: add wizard page design tokens`

---

### Step 2 — Dark theme: body, container, typography

- `body`: gradient → `var(--page-body-from/to)`
- `.container`: white card → dark glassmorphism
- `h1, h2, h3, p, label`: update color references

Commit: `T-002-02: apply dark theme to body, container, typography`

---

### Step 3 — Dark theme: buttons and inputs

- `button` + `button:hover`: updated gradient and glow
- `input[type="text"], textarea, select`: dark bg, light text, accent focus
- Placeholder text color (via `::placeholder`)

Commit: `T-002-02: apply dark theme to buttons and form inputs`

---

### Step 4 — Dark theme: persona cards, back button, misc

- `.persona-card` + hover: dark glass
- `.back-button` + hover: ghost style
- `.step-indicator` dots: accent color
- `.ai-helper`: dark glass
- `.deep-dive-section` / `.deep-dive`: dark text on dark bg check
- `.loading-overlay` / `.loading-content`: if applicable

Commit: `T-002-02: apply dark theme to cards and secondary elements`

---

### Step 5 — Canvas node `::before` shape fix

- Add `background: transparent` to `.canvas-node`
- Add `.canvas-node::before { content:''; position:absolute; inset:0; z-index:0; border-radius:inherit; }`
- Add `.canvas-node > * { position: relative; z-index: 1; }`
- Move `background:` from color classes to `::before` rules
- Move `clip-path` from shape classes to `::before` shape rules
- Remove triangle `padding-top: 30%`
- Add `.cn-expanded::before { clip-path: none !important; }`

Commit: `T-002-02: fix node shape clipping via ::before pseudo-element`

---

## Verification

- [ ] Page 1 (welcome) — dark background, glass card, white text, purple button
- [ ] Page 2 (form) — dark inputs visible, white label text, accent focus border
- [ ] Page 3 (canvas) — all 7 nodes visible, text NOT clipped on triangle/diamond/blob/pentagon
- [ ] Page 4 (gap analysis) — dark glassmorphism, persona cards dark style
- [ ] Page 5 (persona) — dark persona view, back button ghost style
- [ ] Triangle node: "CREATIVITY" label fully visible
- [ ] Diamond node: "HEALTH & WELLNESS" label fully visible
- [ ] Expanded node (click any node): rectangle shape, full content, no clip-path on ::before
- [ ] All hover states work (nodes scale, buttons elevate)
