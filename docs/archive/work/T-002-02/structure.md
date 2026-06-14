# Structure: T-002-02 node-component-refinement

## Files Changed

| File | Change |
|---|---|
| `mindshift.html` | Modified — CSS only, ~120 lines changed/added |

---

## CSS Changes

### A — New wizard tokens in `:root` (~16 lines)

Added after existing tokens, before closing `}`:
```css
/* Wizard Pages */
--page-body-from: #1a1a2e;
--page-body-to:   #312e81;
--card-bg:        rgba(255, 255, 255, 0.06);
--card-border:    rgba(255, 255, 255, 0.12);
--card-radius:    20px;
--input-bg:       rgba(255, 255, 255, 0.08);
--input-border:   rgba(255, 255, 255, 0.18);
--input-text:     #f1f5f9;
--btn-from:       #667eea;
--btn-to:         #a78bfa;
--text-primary:   #f1f5f9;
--text-secondary: rgba(255, 255, 255, 0.65);
--text-muted:     rgba(255, 255, 255, 0.4);
```

### B — Body background update

`linear-gradient(135deg, #667eea 0%, #764ba2 100%)` → `linear-gradient(135deg, var(--page-body-from) 0%, var(--page-body-to) 100%)`

### C — `.container` card dark glass

```css
background: var(--card-bg);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border: 1px solid var(--card-border);
border-radius: var(--card-radius);
box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4);
```
Remove `background: white` and old box-shadow.

### D — Typography updates

- `h1, h2`: `color` → `var(--text-primary)`
- `h3`: `color: #667eea` → `color: var(--hub-accent)`
- `p`: `color: #4a5568` → `color: var(--text-secondary)`
- `label`: `color: #2d3748` → `color: var(--text-primary)`

### E — Button updates

```css
button {
    background: linear-gradient(135deg, var(--btn-from) 0%, var(--btn-to) 100%);
    color: white;
}
button:hover {
    filter: brightness(1.1);
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(167, 139, 250, 0.4);
}
```

### F — Input/textarea/select dark style

```css
input[type="text"], textarea, select {
    background: var(--input-bg);
    border: 1.5px solid var(--input-border);
    color: var(--input-text);
    border-radius: 10px;
}
:focus {
    border-color: var(--hub-accent);
    background: rgba(255, 255, 255, 0.12);
}
```

### G — Persona card dark glass

```css
.persona-card {
    background: var(--card-bg);
    border: 1.5px solid var(--card-border);
    color: var(--text-primary);
}
.persona-card:hover {
    border-color: var(--hub-accent);
}
```

### H — `.back-button` dark ghost style

```css
.back-button {
    background: transparent;
    border: 1.5px solid var(--card-border);
    color: var(--text-secondary);
}
.back-button:hover {
    background: var(--card-bg);
    border-color: var(--hub-accent);
    color: var(--text-primary);
}
```

### I — Step indicator dots

`.step-indicator .step.active`: `background: var(--hub-accent)` replacing hardcoded purple.
`.step-indicator .step`: muted `var(--text-muted)` inactive state.

### J — Canvas node shape fix (~30 lines replacing ~20)

1. Add `background: transparent` to `.canvas-node` base
2. Add `.canvas-node::before { content:''; position:absolute; inset:0; z-index:0; border-radius:inherit; }`
3. Add `.canvas-node > * { position: relative; z-index: 1; }`
4. Color classes: remove `background:` from `.cn-{id}`, add `.cn-{id}::before { background: var(--cn-{id}-bg); }`
5. Shape classes: move `clip-path` from `.cn-shape-*` to `.cn-shape-*::before` (except rect shapes)
6. Remove `padding-top: 30%` from `.cn-shape-triangle` (no longer needed since text isn't clipped)
7. Add `.cn-expanded::before { clip-path: none !important; }` to expanded state

---

## Ordering

1. Add wizard tokens to `:root`
2. Apply dark theme to body, container, typography
3. Update buttons and inputs
4. Update persona cards and back button
5. Apply canvas node shape fix (::before refactor)
6. Commit
