# Structure — T-010-01: V100 UX Audit

## Files changed

| File | Change type | Scope |
|---|---|---|
| `V100/V100.html` | modify | All improvements land here |

No new files. No extracted scripts. Single-file constraint is maintained.

---

## CSS additions (in `<style>`)

### Theme transition (T-010-02)
- `.theme-transitioning` class on `#app` — blur + scale + opacity
- `@keyframes themeFlash` — cyberpunk outgoing flash
- `@keyframes themeSpark` — kawaii outgoing sparkle (via `::after`)
- `@keyframes themeCurl` — notepad outgoing skew
- Reduced-motion: all animations skipped

### Per-theme loading dots (T-010-03)
- `[data-theme="cyberpunk"] .ldot` — blinking cursor single underscore
- `[data-theme="kawaii"] .ldot` — bouncing + color-cycle
- `[data-theme="notepad"] .ldot` — gentle fade, no scale
- `.loading-cursor` — blinking underscore for cyberpunk mode

### Portrait fallback (T-010-06)
- `.portrait-fallback` — initials circle, same dimensions as portrait, themed

### Lens count badge (T-010-06)
- `.lens-count-badge` — small pill near "Pick a Lens" heading

### Response action row (T-010-04)
- `.action-icon-row` — flex row for Save/Decorate/Socials
- `.action-btn` — stacked icon+label, min 44px height

### Tap target fixes (T-010-05)
- `btn-ghost` min-height: 44px
- `#screen-lenses` padding-bottom: 32px

---

## JS additions / modifications (in `<script>`)

### New state variables
```js
let lensUseCount   = 0;
let pendingFigure  = null;
let selectedFigureId = null;
```

### New constants
```js
const THEME_COPY = { cyberpunk: {...}, kawaii: {...}, notepad: {...} }
```

### Modified functions
- `switchTheme(theme)` — add transition animation + `applyThemeCopy(theme)` call + haptic
- `renderGrid()` — restore `.selected` on `selectedFigureId` card
- `openPreview(fig, cardEl)` — set `selectedFigureId = fig.id`
- `confirmLens()` — increment `lensUseCount`, check gate condition
- `goToLanding()` — reset `selectedFigureId`
- `callLens(fig)` — haptic on start
- `renderResponse(fig, apiText)` — haptic on complete

### New functions
```js
function applyThemeCopy(theme)     // updates DOM text nodes from THEME_COPY
function triggerHaptic(pattern)    // wraps navigator.vibrate with guard
function runThemeTransition(from, to, cb)  // animation + swap + callback
function showAccountGate(fig)      // shows account screen with pending figure
function skipAccountGate()         // sets sessionStorage flag, proceeds
function addPortraitFallback(img, fig)  // onerror handler
```

### HTML modifications
- Loading overlay: replace `.ldot` × 3 with theme-aware variant
- Bottom nav labels: "Try another Lens" / "New" / "Continue"
- Response action row: replace current two-button row with 3-icon row
- Lens screen: add `.lens-count-badge` element near "Pick a Lens" heading
- Account screen: add "Skip for now →" button

---

## DOM element IDs added

| ID | Purpose |
|---|---|
| `lensCountBadge` | "X of 3 free" badge |
| `skipGateBtn` | "Skip for now" in account gate |

---

## No regressions

- `callClaudeAPI` fallback script at bottom unchanged
- FIGURES array unchanged
- All existing screen IDs unchanged
- `escapeHTML`, `guessTopic`, `updateCharCount`, `shareResponse`, `createAccount` unchanged
