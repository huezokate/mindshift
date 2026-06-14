# Structure: T-002-01 design-tokens-and-figma

## File Changes

| File | Change |
|---|---|
| `mindshift.html` | Modified — add `:root {}` token block, update references in Canvas/Hub/Node CSS |
| Figma file (MindShift) | Add "Design System / S-002" frame to Page 1 |

---

## `mindshift.html` CSS Changes

### A — New `:root {}` block (~45 lines)

Inserted as the **very first rule** inside `<style>`, before all other CSS.

```css
/* === Design Tokens (S-002) === */
:root {
  /* Canvas */
  --canvas-bg: #1a1a2e;

  /* Hub */
  --hub-bg: rgba(255, 255, 255, 0.08);
  --hub-border: rgba(255, 255, 255, 0.15);
  --hub-accent: #a78bfa;
  --hub-text: #e2e8f0;
  --hub-sub: rgba(255, 255, 255, 0.35);

  /* Node palette */
  --cn-career-bg: #ffd6cc;        --cn-career-fg: #7c2d12;
  --cn-creativity-bg: #fef08a;    --cn-creativity-fg: #713f12;
  --cn-health-bg: #bbf7d0;        --cn-health-fg: #14532d;
  --cn-relationships-bg: #fecdd3; --cn-relationships-fg: #881337;
  --cn-travel-bg: #c7d2fe;        --cn-travel-fg: #312e81;
  --cn-finances-bg: #d1fae5;      --cn-finances-fg: #065f46;
  --cn-living-bg: #ede9fe;        --cn-living-fg: #4c1d95;

  /* Node typography */
  --cn-font-base: 13px;
  --cn-lh-base: 1.4;
  --cn-font-label: 0.62em;
  --cn-font-header: 0.8em;
  --cn-font-goals: 0.7em;
  --cn-lh-goals: 1.55;

  /* Node spacing */
  --cn-pad-x: 16px;
  --cn-pad-y: 14px;
  --cn-radius: 16px;
  --cn-gap: 6px;

  /* Arrows (reference — consumed by JS) */
  --arrow-stroke: #2d2d2d;
  --arrow-opacity: 0.65;
  --arrow-width: 1.5;
}
```

### B — Canvas background update (~1 line)

```css
/* before: */
body.canvas-mode { background: #1a1a2e; }
/* after: */
body.canvas-mode { background: var(--canvas-bg); }
```

### C — Hub node CSS updates (~5 lines)

Replace hardcoded values in `#hub-node`, `.hub-label`, `.hub-body.placeholder`, `.hub-subtitle`:
```css
#hub-node { background: var(--hub-bg); border-color: var(--hub-border); }
.hub-label { color: var(--hub-accent); }
.hub-body  { color: var(--hub-text); }
.hub-subtitle { color: var(--hub-sub); }
```

### D — Node base CSS updates (~5 lines)

```css
.canvas-node {
    font-size: var(--cn-font-base);
    line-height: var(--cn-lh-base);
    padding: var(--cn-pad-y) var(--cn-pad-x);
    gap: var(--cn-gap);
}
.canvas-node .cn-label  { font-size: var(--cn-font-label); }
.canvas-node .cn-header { font-size: var(--cn-font-header); }
.canvas-node .cn-goals  { font-size: var(--cn-font-goals); line-height: var(--cn-lh-goals); }
```

### E — Color class updates (~14 lines)

```css
.cn-career       { color: var(--cn-career-fg);       }
.cn-creativity   { color: var(--cn-creativity-fg);   }
.cn-health       { color: var(--cn-health-fg);        }
.cn-relationships{ color: var(--cn-relationships-fg);}
.cn-travel       { color: var(--cn-travel-fg);        }
.cn-finances     { color: var(--cn-finances-fg);      }
.cn-living       { color: var(--cn-living-fg);        }
```

Note: background colors move to T-002-02 (the `::before` pseudo-element refactor). In
T-002-01, color classes still carry `background:` — the refactor is deferred to T-002-02.

---

## Figma Changes

### New frame: "Design System / S-002"

Created via Figma Plugin API (`use_figma`). Placed at coordinates clear of existing content
(approx x=18000, y=0 on Page 1).

Sections created with Auto Layout:
1. **Color Palette** — labeled swatches for all 14 node tokens + 5 semantic tokens
2. **Typography Scale** — specimens on dark background showing label / header / goals
3. **Node Specimens** — 7 artboards, one per category, showing final node design

---

## Ordering

1. Add `:root {}` block to HTML
2. Update canvas bg, hub, node CSS to use tokens
3. Update color classes to use fg tokens (bg stays on element for now — T-002-02 moves it)
4. Commit HTML changes
5. Create Figma frame via use_figma
6. Commit artifact files
