# T-006-05 Research: WCAG Compliance + Engagement Patterns

## 1. WCAG 2.1 AA Baseline

Target: WCAG 2.1 Level AA. This is the legal standard in most jurisdictions and the practical minimum for a public-facing app.

Key success criteria relevant to MindShift:

| WCAG SC | Criterion | Level |
|---------|-----------|-------|
| 1.1.1 | Non-text content has alt text | A |
| 1.3.1 | Info and relationships conveyed in structure | A |
| 1.4.1 | Color not used as sole means of conveying information | A |
| 1.4.3 | Contrast ratio ≥ 4.5:1 for normal text | AA |
| 1.4.4 | Text resizable to 200% without loss of function | AA |
| 1.4.10 | Reflow: no horizontal scroll at 320px width | AA |
| 1.4.11 | Non-text contrast (UI components) ≥ 3:1 | AA |
| 2.1.1 | Keyboard accessible | A |
| 2.4.3 | Focus order | A |
| 2.4.7 | Focus visible | AA |
| 2.5.3 | Label in name | A |
| 2.5.5 | Target size ≥ 44×44px (touch) | AAA (target) |
| 3.3.1 | Error identification | A |

## 2. Contrast Ratio Audit

### Text on backgrounds (need ≥ 4.5:1 for normal text, 3:1 for large text ≥18px/14px bold)

| Foreground | Background | Ratio | Pass/Fail | Notes |
|---|---|---|---|---|
| #E8E8FF (--white) | #07070F (--bg) | ~19:1 | ✅ AA | Primary text |
| #A0A0CC (--white-2) | #07070F (--bg) | ~9:1 | ✅ AA | Muted text |
| #505077 (--white-3) | #07070F (--bg) | ~4.2:1 | ⚠️ FAIL | Disabled/subtlest text — below 4.5 |
| #00FFC8 (--cyan) | #07070F (--bg) | ~14:1 | ✅ AA | Accent text, labels |
| #00FFC8 (--cyan) | #0D0D1C (--bg-2) | ~13:1 | ✅ AA | Labels on cards |
| #FF2D6B (--pink) | #07070F (--bg) | ~5.2:1 | ✅ AA | Pink text on main bg |
| #FF2D6B (--pink) | #0D0D1C (--bg-2) | ~4.9:1 | ✅ AA | Pink on card |
| #C8AEFF (--lavender) | #07070F (--bg) | ~10:1 | ✅ AA | Kawaii accent |
| #AEFFEA (--mint) | #07070F (--bg) | ~15:1 | ✅ AA | Guide character |
| #FFE87C (--star-gold) | #07070F (--bg) | ~13:1 | ✅ AA | Achievement |
| #A0A0CC (--white-2) | #0D0D1C (--bg-2) | ~8:1 | ✅ AA | Subtitle on card |
| #505077 (--white-3) | #0D0D1C (--bg-2) | ~3.8:1 | ⚠️ FAIL | Figure description text — fail |
| #6BC8FF (ice-blue) | #07070F (--bg) | ~10:1 | ✅ AA | Scandinavia category |

### Issues to fix

1. **`--white-3` (#505077) is used for body-level text** (figure descriptions, usage notes, subtitles) on dark bg — contrast is only 4.2:1 on `--bg` and 3.8:1 on `--bg-2`. These texts are 9-11px which makes it worse (small text needs 4.5:1).
   - Fix: Lighten `--white-3` to `#6060AA` (contrast ≈ 5.5:1) or change these specific elements to `--white-2`.
   - Recommendation: Change `--white-3` to `#6565A8` and audit all usages.

2. **Focus indicator:** Current focus rings are not explicitly styled — browsers apply default blue rings which are invisible on the dark bg.
   - Fix: Add explicit `:focus-visible` styles using `outline: 2px solid var(--cyan); outline-offset: 2px;` on all interactive elements.

### UI Component Contrast (need ≥ 3:1)
| UI Element | Border/Indicator | Background | Ratio | Pass |
|---|---|---|---|---|
| Input field border | rgba(cyan, 0.25) | #07070F | ~2:1 | ⚠️ FAIL |
| Input field border (focus) | #00FFC8 | #07070F | 14:1 | ✅ |
| Button border | #00FFC8 | #07070F | 14:1 | ✅ |
| Card border | rgba(cyan, 0.08) | #07070F | ~1.2:1 | ⚠️ FAIL |

Default card border (`--border-2`) and input border (`--border`) are below 3:1. They are decorative/structural rather than informative, so the SC may not strictly apply — but strengthening them improves perceived quality.
- Fix: `--border` = `rgba(0, 255, 200, 0.35)` (up from 0.25), `--border-2` = `rgba(0, 255, 200, 0.14)` (up from 0.08).

## 3. Touch Target Audit

Current interactive elements:
| Element | Current size | 44px target? |
|---------|-------------|-------------|
| `.nav-icon-btn` | 34×34px | ⚠️ Below |
| `.back-btn` | 34×34px | ⚠️ Below |
| `.icon-btn` | 34×34px | ⚠️ Below |
| `.nav-tab` | ~34×28px | ⚠️ Below |
| `.cta-btn` | 100%×48px | ✅ |
| `.figure-card` | ~80×100px | ✅ |
| `.example-pill` | ~auto×34px | ⚠️ Borderline |

Fix strategy: Add `@media (pointer: coarse)` enlargements for the 34px square buttons:
```css
@media (pointer: coarse) {
  .nav-icon-btn, .back-btn, .icon-btn {
    min-width: 44px;
    min-height: 44px;
  }
}
```

## 4. Keyboard Navigation

Current state: No explicit tab order management. Default tab order follows DOM order — likely workable for linear wizard.

Gaps:
- The mindmap canvas (Screen 5) is SVG — SVG nodes are not natively focusable
- The figure grid cards are `<div>` — not natively focusable or keyboard activatable
- The example pills are `<div>` — same issue

Fixes:
- Figure grid cards: add `tabindex="0"`, `role="radio"`, `aria-checked`, keyboard `Enter`/`Space` activation
- Example pills: add `tabindex="0"`, `role="button"`, keyboard activation
- Mindmap nodes: add `tabindex="0"`, `role="button"` or `role="listitem"` on wrapper elements
- Add skip link: `<a href="#main-content" class="skip-link">Skip to main content</a>` as first focusable element

## 5. ARIA / Semantic HTML Audit

### Screen 1 — Question
- `<textarea>`: needs `<label for>` connection (currently uses visual `.input-label` div)
- Add `aria-describedby` pointing to char counter and helper text
- Char counter: `aria-live="polite"` for screen reader updates

### Screen 2 — Figures
- Figure grid: `role="radiogroup"` with `aria-label="Choose a perspective lens"`
- Each card: `role="radio"`, `aria-checked`, `aria-label="[Figure name], [era/domain]"`
- "Get perspective" button: `aria-disabled` when no selection

### Screen 3 — AI Response
- Terminal box: `role="region"` with `aria-label="AI Response"`
- Loading state: `aria-live="polite"` + `aria-busy="true"` during load
- Typewriter reveal: `aria-live="assertive"` or deliver full text immediately to screen readers (typewriter = decorative)

### Screen 5 — Mindmap
- Canvas: `role="region"` with `aria-label="Your 5-year mind map"`
- Each node: `role="button"` or `role="region"`, `aria-label="[Category]: [goals summary]"`
- Connections (arrows): `aria-hidden="true"` (decorative SVG)

## 6. Motion / Animation Accessibility

Current: No `prefers-reduced-motion` handling.

Required wrapping:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Exceptions: Progress indicators that communicate state (loading dots) should remain as static indicators (show ellipsis "..." instead of animated dots).

## 7. Engagement Pattern Catalogue

### Onboarding Delight
| Pattern | Trigger | Screen | Implementation |
|---------|---------|--------|----------------|
| Guide character | App first open (localStorage flag) | S1 | Mint-colored bot SVG appears in textarea empty state with speech bubble |
| Guide speech | First visit | S1 | "What's on your mind? I'll help you find perspective." |
| Guide dismiss | User starts typing | S1 | Fade out in 300ms |

### Progress Feedback
| Pattern | Trigger | Screen | Implementation |
|---------|---------|--------|----------------|
| Step dots | All screens | Nav | 5 dots (●●○○○), current = cyan filled, done = cyan dim, future = white-3 |
| Step label | All screens | Nav | "Step 2 of 5" (sr-only on mobile, visible on desktop sidebar) |
| Progress advance | Screen transition | Nav | Dot fills with spring animation (bounce ease, 350ms) |
| AI loading | "Get perspective" tap | S3 | Current loading dots → keep, add "CONNECTING TO [FIGURE NAME]..." label |

### Micro-interactions
| Pattern | Trigger | Element | Implementation |
|---------|---------|---------|----------------|
| Press down | Button press | CTA btn | `scale(0.97)` on `active`, spring back on release |
| Glow pulse | Button hover (desktop) | CTA btn | Already implemented |
| Border draw | Card select | Figure card | SVG border stroke-dashoffset 0→100% animation, 300ms |
| Portrait glow | Card select | Portrait | `box-shadow` cycles cyan → lavender → cyan, 2× |
| Pill sparkle | Pill hover | Example pills | 4 tiny `✦` particles, CSS keyframe |
| Char count warn | 280+ chars | Char counter | Color transition white-3 → pink, number shake |

### Celebration Moments
| Pattern | Trigger | Screen | Implementation |
|---------|---------|--------|----------------|
| Goal star | Goal item added | S4 | Single ✦ particle from + button, star-gold, 300ms float up + fade |
| Mindmap complete | All 7 nodes have goals | S5 | 12 particle confetti burst: cyan + pink + lavender + star-gold, 600ms |
| Save pulse | Save CTA tap | S5 | Hub node pulses cyan glow 2×, then holds |
| Perspective reveal | AI text finishes | S3 | Subtle cyan border sweep on terminal box (linear, 500ms) |

### Retention Hooks
| Pattern | Trigger | Screen | Implementation |
|---------|---------|--------|----------------|
| Save prompt | 3s after mindmap complete | S5 | Sticky bottom bar fades in: "Save your mindmap ✦ Share your vision" |
| Native share | Share tap (mobile) | S5 | `navigator.share()` with mindmap summary text |
| Clipboard share | Share tap (desktop) | S5 | Copy formatted summary to clipboard, show "Copied!" toast |
| Session restore | Return visit with saved data | S1 | Subtle "Welcome back — your mindmap is ready" chip in nav |

## 8. Summary Issues Table

| Issue | Priority | Fix |
|-------|---------|-----|
| `--white-3` contrast fail | Critical | Lighten to #6565A8 |
| Input border below 3:1 | High | Strengthen rgba opacity |
| Focus rings absent | High | Add `:focus-visible` to all interactive |
| Figure cards not keyboard accessible | High | `tabindex`, `role="radio"`, key handlers |
| Example pills not keyboard accessible | High | `tabindex`, `role="button"`, key handlers |
| Textarea missing `<label>` | High | Connect via `for`/`id` |
| No `prefers-reduced-motion` | High | Wrap all animations |
| SVG mindmap nodes not focusable | Medium | `tabindex`, `role`, `aria-label` |
| Touch targets 34px on mobile | Medium | `@media (pointer: coarse)` enlargement |
| No skip link | Medium | Add first-child skip nav |
| Char counter not `aria-live` | Low | `aria-live="polite"` |
| Scanlines can cause visual noise | Low | Reduce opacity, disable on `prefers-reduced-motion` |
