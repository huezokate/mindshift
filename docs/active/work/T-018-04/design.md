# T-018-04 — Design

Decide how to satisfy: (1) lens-picker arrows = shared circular arrow component, inside
the popup; (2) lens card audited against Figma, look-alikes replaced. Grounded in
Research.

## Decision summary

1. **Extract a shared `<CircularArrow>` primitive** (`components/ui/CircularArrow.tsx`)
   — a token-driven circular button that renders a **Material Symbols** chevron via the
   existing `<Icon>` (not a literal `‹`/`›` glyph). This is "the shared circular arrow
   component."
2. **Move the two arrows inside the popup card** — render them within the detail
   `motion.div` (flanking the portrait, in-flow) instead of `position: absolute` against
   the overlay edges.
3. **Audit + tidy the detail card** against conventions: Material Symbols for the Back
   button's arrow too, ≥44px tap targets, no hardcoded glyph icons, tokens only.

## Problem 1 — the shared circular arrow component

### Options

- **A. Restyle the two inline buttons in place.** Lowest churn. Rejected: leaves two
  near-duplicate blocks and the literal glyphs; "shared component" is unmet; the next
  screen (theme-select) can't reuse it.
- **B. Extract `<CircularArrow direction onClick>` into `components/ui/`.** One source of
  truth, reused by left+right here and available to theme-select later. Renders an
  `<Icon name="chevron_left|chevron_right">`. ✅ **Chosen** — matches the T-018-01
  "shared, Material-Symbols-only" direction and the AC's literal wording ("the shared
  circular arrow component").
- **C. Add it to the `<Icon>` primitive as a variant.** Rejected: `<Icon>` is a pure
  glyph primitive; a bordered, sized, clickable button is a different concern
  (composition over overloading).

### Chosen shape

```tsx
<CircularArrow
  direction="prev" | "next"
  onClick={...}
  size={44}                 // ≥44px tap target
  ariaLabel="Previous figure" | "Next figure"
/>
```

Renders a circular `<button>`: `border: 2px solid var(--cyan)`, `background:
var(--card-bg)`, `color: var(--cyan)`, `borderRadius: 50%`, centered
`<Icon name={direction === 'prev' ? 'chevron_left' : 'chevron_right'} size={size*0.6}>`.
`type="button"`. Caller owns `stopPropagation` semantics (passed via `onClick`). Glyph
choice `chevron_left/right` mirrors the existing `‹/›` visual while moving onto Material
Symbols. Token-driven → automatically correct across all 3 themes (cyan/card-bg resolve
per theme). **No `Date.now()`/random/per-theme hex** — pure tokens.

## Problem 2 — arrows inside the popup

### Options

- **A. Keep `position: absolute` but relative to the card** (move the buttons into the
  card with `absolute left/right`, `top: 50%`). Visually "inside" but still overlaps the
  portrait/quote and fights the card padding. Rejected: fragile overlap, poor on small
  cards.
- **B. In-flow row flanking the portrait.** Wrap the portrait in a centered row:
  `[CircularArrow prev] [portrait] [CircularArrow next]`. Arrows are genuinely inside the
  popup, never overlap text, and the navigation reads as "swap the figure." ✅ **Chosen.**
- **C. Arrows in the button footer row.** Rejected: conflates navigation (prev/next
  figure) with commit actions (Back/Select); crowds the footer.

### Chosen layout (detail card)

```
┌───────────── popup card (maxWidth 320) ─────────────┐
│   ( ‹ )      ◯ portrait 120px      ( › )            │  ← row, items-center, gap
│                  NAME                                │
│                  Era                                 │
│                 "quote"                              │
│                  bio…                                │
│        [ ← Back ]        [ Select ]                  │
└─────────────────────────────────────────────────────┘
```

The portrait row uses `display:flex; align-items:center; justify-content:space-between`
(or center with `gap`) so the two arrows sit at the card's left/right inset, vertically
centered on the portrait. The overlay-edge absolute arrows (lines 285–293, 393–401) are
removed.

## Problem 3 — lens-card audit (get_design_context)

The detail card already reads the real `Figure` fields (name/era/quote/bio) and uses
`--card-*`/`--fig-*` tokens — it is **not** a hardcoded look-alike for content. The audit
items that are actionable from convention without a pinned Figma node:

- **Back button arrow** (line 366: literal `←`) → replace with `<Icon name="arrow_back"
  size={16}>` so the footer matches the Material-Symbols rule (consistency with the new
  arrows; closes the "look-alike frame" concern for the card's own iconography).
- **Tap targets**: arrows ≥44px; Back/Select already pad to ≥44px — keep.
- **Tokens only**: confirm no stray hex introduced.

Items that genuinely need the live Figma node (exact arrow diameter, border weight,
icon weight/optical size, portrait↔arrow gap, whether arrows are cyan vs violet per
theme) are **flagged in review.md** as a fidelity follow-up. We converge on the current
cyan/2px/48→44px treatment (already in the code) rather than invent new numbers.

## Why this is the right altitude

- Reuses `<Icon>` (T-018-01) instead of new glyph code — one icon source, as mandated.
- One new small primitive (`CircularArrow`) is justified: it's used twice immediately and
  is the named deliverable ("shared … component"); theme-select can adopt it next.
- Purely additive + token-driven → safe across 3 themes, no migration risk, tsc-checkable.
- Scope stays inside `/app/lens/page.tsx` + the new file — no collision with the
  uncommitted sibling-ticket edits.

## Rejected globally

- Touching `theme-select` in this ticket (adopting `CircularArrow` there) — out of scope;
  left as a noted future reuse so the DAG/sibling work stays clean.
- Animating arrow transitions / swipe gestures — not in the AC; avoid scope creep.
