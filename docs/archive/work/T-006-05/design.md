# T-006-05 Design: WCAG + Engagement Implementation Plan

## WCAG Fixes — Priority Order

### P0: Critical (blocks accessibility)

1. **`--white-3` contrast** → change hex from `#505077` to `#6565A8` in token block
2. **`:focus-visible` system** → add global rule:
   ```css
   :focus-visible {
     outline: 2px solid var(--cyan);
     outline-offset: 2px;
   }
   /* Remove for mouse-only interactions */
   :focus:not(:focus-visible) { outline: none; }
   ```
3. **Figure cards keyboard** → `tabindex="0"`, `role="radio"`, `aria-checked`, `onkeydown` Enter/Space
4. **Example pills keyboard** → `tabindex="0"`, `role="button"`, `onkeydown` Enter/Space
5. **Textarea label** → wrap in `<label>` or use `aria-label`
6. **prefers-reduced-motion** → add to token block (see T-006-04)

### P1: High (significant UX impact)

7. **Touch targets** → `@media (pointer: coarse)` for 34px buttons → 44px
8. **Skip nav link** → hidden visually, visible on focus:
   ```html
   <a href="#main-content" class="skip-link">Skip to main content</a>
   ```
   ```css
   .skip-link { position: absolute; left: -9999px; }
   .skip-link:focus { left: 0; top: 0; ... }
   ```
9. **Char counter aria-live** → `aria-live="polite"` on `.char-counter`
10. **Loading state aria** → `aria-busy="true"` on terminal box during load, `aria-live="polite"` on response

### P2: Medium (audit compliance)

11. **Mindmap nodes focusable** → SVG node wrappers: `tabindex="0"`, `role="button"`, `aria-label`
12. **Figure grid role** → wrap in `<div role="radiogroup" aria-label="Choose a perspective lens">`
13. **Scanline opacity** → reduce from 0.04 to 0.02 (less visual noise, less motion concern)
14. **Border contrast** → strengthen (already in token block)

## Engagement System Implementation

### Guide Character (Screen 1, first-visit only)

```html
<!-- Inject if localStorage 'ms-visited' not set -->
<div class="guide-character" aria-label="Guide tip" role="status">
  <div class="guide-avatar">◈</div>
  <div class="guide-bubble">What's weighing on you? I'll help find perspective.</div>
</div>
```

```css
.guide-character {
  display: flex; align-items: flex-start; gap: var(--space-3);
  animation: guide-float 4s ease-in-out infinite;
}
.guide-avatar {
  font-size: var(--text-2xl); color: var(--mint);
  filter: drop-shadow(0 0 8px var(--mint));
}
.guide-bubble {
  font-family: var(--font-kawaii); font-size: var(--text-sm);
  color: var(--mint); background: var(--bg-2);
  border: 1px solid rgba(174, 255, 234, 0.3);
  border-radius: var(--radius-kawaii);
  padding: var(--space-3) var(--space-4);
}
@keyframes guide-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
```

JS: `if (!localStorage.getItem('ms-visited')) { showGuide(); } else { hideGuide(); }`

### Progress Step Dots

```html
<div class="step-dots" role="progressbar" aria-valuenow="2" aria-valuemin="1" aria-valuemax="5" aria-label="Step 2 of 5">
  <span class="dot done" aria-hidden="true"></span>
  <span class="dot active" aria-hidden="true"></span>
  <span class="dot" aria-hidden="true"></span>
  <span class="dot" aria-hidden="true"></span>
  <span class="dot" aria-hidden="true"></span>
</div>
```

```css
.step-dots { display: flex; gap: var(--space-2); align-items: center; }
.dot {
  width: 6px; height: 6px; border-radius: var(--radius-full);
  background: var(--white-3);
  transition: background var(--dur-kawaii) var(--ease-kawaii),
              transform var(--dur-kawaii) var(--ease-kawaii);
}
.dot.done { background: var(--cyan); opacity: 0.5; }
.dot.active {
  background: var(--cyan);
  transform: scale(1.4);
  box-shadow: 0 0 8px rgba(0,255,200,0.6);
}
```

### Confetti Celebration (Screen 5)

12 particles, pure CSS:
```css
.confetti-particle {
  position: fixed; pointer-events: none;
  width: 8px; height: 8px;
  border-radius: 50%;
  animation: confetti-fall var(--dur-celebrate) ease-out forwards;
}
@keyframes confetti-fall {
  0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) rotate(720deg); opacity: 0; }
}
```

JS creates 12 particles with randomized `--tx`, `--ty`, colors rotating through `--cyan, --pink, --lavender, --star-gold`.

### Typewriter Reveal (Screen 3)

```js
function typewriterReveal(element, text, msPerChar = 30) {
  element.textContent = '';
  // Screen readers get full text immediately
  element.setAttribute('aria-label', text);
  let i = 0;
  const tick = () => {
    if (i < text.length) {
      element.textContent += text[i++];
      setTimeout(tick, msPerChar);
    }
  };
  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    element.textContent = text;
  } else {
    tick();
  }
}
```

## Sidebar Structure (Desktop)

```html
<aside class="sidebar" aria-label="Navigation and progress">
  <div class="sidebar-logo">MIND<span>SHIFT</span></div>
  <nav class="sidebar-nav">
    <button class="sidebar-tab active">Shift</button>
    <button class="sidebar-tab">Mind Map</button>
    <button class="sidebar-tab">Archive</button>
  </nav>
  <div class="sidebar-progress">
    <div class="step-dots">...</div>
    <span class="sidebar-step-label">Step 2 of 5</span>
  </div>
  <div class="sidebar-figure" id="sidebar-figure">
    <!-- Populated by JS when figure selected -->
  </div>
</aside>
```

CSS: hidden by default via `display: none`, shown at desktop breakpoint via `@media (min-width: 1024px)`.
