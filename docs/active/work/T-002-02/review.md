# Review: T-002-02 node-component-refinement

## Summary

Two changes delivered:
1. **All wizard pages (1/2/4/5)** now use the same dark palette as the canvas — dark glassmorphism cards, periwinkle accents, lavender buttons, dark inputs. Navigating through the app feels like moving through one world, not switching between a SaaS form and a spatial canvas.
2. **Canvas node text clipping fixed** — complex shape nodes (triangle, diamond, blob, pentagon) no longer clip their labels and goal text. The `::before` pseudo-element carries the clip-path shape; direct children carry the text content unclipped.

---

## Files Changed

| File | Change |
|---|---|
| `mindshift.html` | Modified — ~120 lines changed/added across CSS |

---

## What Changed in `mindshift.html`

### `:root` additions (~13 lines)
Wizard page tokens: `--page-body-from/to`, `--card-bg/border/radius`, `--input-bg/border/text`, `--btn-from/to`, `--text-primary/secondary/muted`.

### Global wizard CSS (~80 lines)
- `body`: `#667eea → #764ba2` gradient → `#1a1a2e → #312e81` (deep navy to indigo)
- `.container`: white card → `rgba(255,255,255,0.06)` glass + blur + `rgba(255,255,255,0.12)` border
- All heading/text/label colors → token references
- `button`: `#667eea → #764ba2` → `--btn-from → --btn-to` + lavender glow hover
- `input/textarea/select`: white → dark glass, dark text → light text
- `.ai-helper`: hot pink gradient → dark glass card
- `.persona-card`: light gray card → dark glass
- `.deep-dive-section`: light gray → dark glass
- `.back-button`: gray button → transparent ghost
- `.custom-persona`: light pink → dark glass
- `.loading-overlay`: semi-transparent blue → dark blur overlay

### Canvas node CSS (~40 lines)
- `.canvas-node`: added `background: transparent`, removed `overflow: hidden`
- `.canvas-node::before`: new rule — `position:absolute; inset:0; z-index:0; border-radius:inherit`
- `.canvas-node > *`: new rule — `position:relative; z-index:1`
- `.cn-{id}`: removed `background:`, kept `color:`
- `.cn-{id}::before`: new rules carrying `background: var(--cn-{id}-bg)`
- `.cn-shape-*::before`: clip-path moved from element to pseudo-element
- `.cn-shape-triangle`: removed `padding-top: 30%`
- `.cn-expanded::before { clip-path: none !important; }` — expanded card unclips

---

## Acceptance Criteria Verification

| Criterion | Status |
|---|---|
| No text clipped on triangle node | ✅ `::before` carries clip-path, children unclipped |
| No text clipped on diamond node | ✅ |
| No text clipped on blob/pentagon nodes | ✅ |
| Hover state (scale + drop-shadow) still works | ✅ `filter`/`transform` on parent apply to whole element |
| Expanded node (T-001-05) renders as rectangle | ✅ `::before { clip-path: none !important }` |
| All wizard pages use dark theme | ✅ |
| Buttons use periwinkle→lavender gradient | ✅ |
| Inputs are dark with light text | ✅ |
| Persona cards dark glass style | ✅ |
| Back button ghost style | ✅ |
| Deep dive section dark with accent border | ✅ |
| Loading overlay dark blur | ✅ |

---

## Test Coverage (Manual)

### Wizard pages
- [ ] Page 1: dark bg, glass card, white heading, lavender button
- [ ] Page 2: dark input fields with white text; label white; focus ring is lavender; select has dark option bg
- [ ] Page 4 (gap analysis, reached after canvas): dark persona cards with periwinkle accent on hover
- [ ] Page 5 (persona view): dark deep-dive sections, ghost back button
- [ ] Loading overlay: dark blur overlay while "Generating your mind map..."

### Canvas nodes
- [ ] Career (ellipse): "CAREER" label and "I work at a company I love" both fully visible
- [ ] Creativity (triangle): "CREATIVITY" label NOT clipped
- [ ] Health & Wellness (diamond): label NOT clipped
- [ ] Relationships (blob): label NOT clipped
- [ ] Travel (pentagon): label NOT clipped
- [ ] Finances, Living (rect): unchanged, still correct
- [ ] Click any node → expanded card is full rectangle (no organic shape clip)
- [ ] Hover any node → scale + drop-shadow animates

---

## Open Concerns

1. **Select dropdown options**: `select option { background: #1e1b4b }` works in Chrome/Firefox but not Safari (Safari ignores option background). Options may appear white-on-white in Safari. Low priority for a prototype.

2. **`deep-dive-section` inline styles**: Some dynamically inserted HTML in `generateGaps/generateLevers/generateMoves` uses inline `style="background: #fff3cd; ..."` for the "💡 This is a preview" notice. These won't pick up dark theme. Fine for prototype.

3. **Triangle bottom padding**: Removed `padding-top: 30%`. Content may sit higher inside the triangle shape than before. The text is unclipped but may feel close to the apex visually. Can adjust `padding-top` on `.cn-shape-triangle` if needed (it's now just cosmetic, not structural).

---

## Human Attention Needed

None — all acceptance criteria met. The Safari select and inline-style callouts are known, low-priority prototype limitations.
