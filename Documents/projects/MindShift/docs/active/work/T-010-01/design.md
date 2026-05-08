# Design — T-010-01: V100 UX Audit

## Decision: Single-file, incremental upgrades

All improvements land in `V100/V100.html`. No split into multiple files — the prototype must remain self-contained for GitHub Pages and device sharing. Each ticket adds a bounded block of CSS and a bounded block of JS. No rearchitecting — the existing screen/overlay/state model is sound.

---

## T-010-02: Theme Transition Animation

### Options considered

**A — CSS transition on all properties (current):** All CSS vars update at once, transitions fire simultaneously. Reads as a global flash. Rejected.

**B — Full-screen flash overlay:** Inject a `<div class="theme-flash">` at body level, fade to white/black, swap theme, fade out. Simple but feels clunky — like a page reload, not a UI morph.

**C — Blur + fade morph (chosen):** On switch, add `.theme-transitioning` class to `#app`. This class applies `filter: blur(4px); opacity: 0.6; transform: scale(0.99)` to the app shell, transitions over 180ms, triggers theme swap at the midpoint, then reverses. Total round-trip: ~360ms. Feels like a shimmer/morph rather than a flash.

**Why C:** It uses a single transform on the shell container (GPU-composited), not per-element transitions. The blur masks the simultaneous color pop. 360ms is long enough to feel intentional but short enough to not interrupt flow.

**Reduced motion:** If `prefers-reduced-motion: reduce`, skip the animation entirely (instant swap, current behavior).

### Per-theme personality

Each theme gets a slightly different morph:
- **Cyberpunk → anything:** flash of pink static (brief `::before` overlay with scan lines, 80ms)
- **Kawaii → anything:** sparkle burst (CSS keyframe star particles on `::after`, 200ms)
- **Notepad → anything:** paper curl (brief `skewX(-1deg)` + opacity, 200ms)

These run on the outgoing theme's `#app` before the data-theme swaps.

---

## T-010-03: Per-Theme Copy + Loading

### Copy strategy

A `THEME_COPY` object maps theme → all variant strings. `switchTheme()` calls `applyThemeCopy(theme)` which updates DOM text nodes directly. Strings are short — no performance concern.

```
THEME_COPY = {
  cyberpunk: {
    landingH1: 'WHAT\'S ON YOUR MIND?',
    ventLabel: 'VENT IT OUT > _',
    ventPlaceholder: 'No filter. No judgement. Dump it all here.',
    ventCTA: 'SELECT THE LENS',
    pickLens: 'CHOOSE YOUR LENS',
    charMax: 450
  },
  kawaii: {
    landingH1: 'What\'s on your mind?',
    ventLabel: 'share it here ✨',
    ventPlaceholder: 'pour out whatever you\'re feeling — this is a safe space 💕',
    ventCTA: 'Pick your lens ✨',
    pickLens: 'who do you want to hear from?',
    charMax: 450
  },
  notepad: {
    landingH1: 'Something on your mind?',
    ventLabel: 'Write it out...',
    ventPlaceholder: 'Don\'t edit — just write. The more honest, the better.',
    ventCTA: 'Choose a perspective',
    pickLens: 'Choose a lens',
    charMax: 450
  }
}
```

Char counter cap: 800 → 450 (Figma spec). All themes use 450.

### Loading animation personality

Three distinct styles, keyed by theme:

| Theme | Dot animation | Title style |
|---|---|---|
| cyberpunk | `_` cursor blink (single blinking underscore, not 3 dots) | UPPERCASE, monospace, typing feel |
| kawaii | 3 dots that bounce with offset + color cycle (pink/violet/blue) | Mixed case, rounded font |
| notepad | 3 dots that fade in and out gently (no scale) | Sentence case, serif |

Implemented by adding a `data-theme` on `#overlay-loading` (auto-mirrors `#app`'s data-theme) and theme-specific `@keyframes` on `.ldot`.

---

## T-010-04: Response Actions + Account Gate

### Account gate

State: `lensUseCount` (session integer, starts 0). Incremented in `confirmLens()` before calling `callLens()`. When count reaches 4:
- Show `screen-account` before proceeding
- Store `pendingFigure` temporarily
- Account screen shows "Skip for now →" button that sets `sessionStorage.gateSkipped = '1'` and proceeds
- Gate fires only if `!sessionStorage.getItem('gateSkipped')` — one dismissal per session

### Bottom nav labels (per Figma)

Current → Correct:
- "⊙ New Lens" → "⊙ Try another Lens"
- "⌂ Home" → "⌂ New" (triggers landing, clears vent)
- "✦ Decorate" → "→ Continue" (stub for continue conversation)

### Response action row (per Figma)

Replace current `btn-ghost Share/Save` row with a 3-button icon+label row:

```
[ 📖 Save ] [ 🎨 Decorate ] [ ↗ Socials ]
```

Each button is styled with `btn-ghost` but with a stacked layout (icon above label, 52px tall minimum). "Save" stubs to account gate, "Decorate" stubs to account screen, "Socials" calls `shareResponse()`.

---

## T-010-05: Mobile Haptics + Tap Targets

### Haptics

Wrap `navigator.vibrate()` in a guard (`typeof navigator.vibrate === 'function'`). Three patterns:
- Light (10ms): theme tab tap, figure card tap
- Medium (20ms): CTA button tap, "Select the Lens" confirm
- Bounce (10,50,10ms): response reveal complete (one small double-tap feel)

### Tap target fixes

`btn-ghost` in response action row: add `min-height: 44px; min-width: 44px`.
Preview action buttons: already adequate (~42px). Bump padding to ensure 44px.
Char counter cap: 800→450 (also in T-010-03).

### Scroll

Lens screen: `#screen-lenses` overflow is already `overflow-y: auto`. Add `-webkit-overflow-scrolling: touch` (belt-and-suspenders for older iOS). Add `padding-bottom: 32px` so last row isn't clipped by viewport edge.

---

## T-010-06: Lens Grid UX

### Selected card persistence

Problem: `renderGrid()` wipes innerHTML, clearing `.selected`. Solution: track `selectedFigureId` in state. In `renderGrid()`, if `fig.id === selectedFigureId`, add `.selected` to the card immediately on render. `openPreview` sets `selectedFigureId = fig.id`. `goToLanding()` resets it.

### Figure tag legibility

Set `figure-tag` to `font-size: 10px` globally (was 9px). On notepad, bump to `font-size: 11px; font-style: italic`.

### Portrait fallback

```js
img.onerror = function() {
  this.style.display = 'none';
  const fallback = document.createElement('div');
  fallback.className = 'portrait-fallback';
  fallback.textContent = fig.name.slice(0, 2).toUpperCase();
  this.parentNode.appendChild(fallback);
};
```

`.portrait-fallback`: same size as portrait, centered initials, bg = `var(--bg-card2)`, color = `var(--c1)`, border = 1px solid `var(--c1)`.

### Lens count badge

Add `lensUseCount` display near "Pick a Lens" heading: `"2 of 3 free"` shown when `lensUseCount >= 1`. Hidden at 0. After gate fires, shows "Unlimited ✓".

---

## Implementation Order

Tickets can all implement in parallel once T-010-01 research + design is done. Suggested order within a single session:

1. T-010-06 (grid fixes — safest, most testable)
2. T-010-05 (haptics + tap targets — quick wins)
3. T-010-03 (copy + loading — high visual impact)
4. T-010-04 (account gate + actions — logic-heavy)
5. T-010-02 (transition animation — last, most delicate)

All land in a single commit: `feat: V100 UX/UI improvements batch 1`.
