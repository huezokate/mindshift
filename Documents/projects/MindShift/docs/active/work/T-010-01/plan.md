# Plan — T-010-01: V100 UX Improvements

## Implementation order (single session, one file)

Each step is atomic and can be verified before the next. All edits to `V100/V100.html`.

---

### Step 1 — New state variables + THEME_COPY constant

Add above the `switchTheme` function:

```js
let lensUseCount    = 0;
let pendingFigure   = null;
let selectedFigureId = null;

const THEME_COPY = {
  cyberpunk: {
    h1: 'WHAT\'S ON YOUR MIND?',
    ventLabel: 'VENT IT OUT > _',
    ventPlaceholder: 'No filter. No judgement. Dump it all here.',
    cta: 'SELECT THE LENS',
    pickLens: 'CHOOSE YOUR LENS',
    charMax: 450
  },
  kawaii: {
    h1: 'What\'s on your mind? ✨',
    ventLabel: 'share it here 💕',
    ventPlaceholder: 'pour out whatever you\'re feeling — this is a safe space ✨',
    cta: 'Pick your lens ✨',
    pickLens: 'who do you want to hear from?',
    charMax: 450
  },
  notepad: {
    h1: 'Something on your mind?',
    ventLabel: 'Write it out...',
    ventPlaceholder: 'Don\'t edit — just write. The more honest, the better.',
    cta: 'Choose a perspective',
    pickLens: 'Choose a lens',
    charMax: 450
  }
};
```

**Verify:** `console.log(THEME_COPY.kawaii.h1)` in console.

---

### Step 2 — `applyThemeCopy(theme)` + `triggerHaptic(pattern)`

```js
function applyThemeCopy(theme) {
  const c = THEME_COPY[theme];
  if (!c) return;
  const h1 = document.querySelector('#screen-landing .t-h1');
  if (h1) h1.textContent = c.h1;
  const lbl = document.querySelector('.vent-label');
  if (lbl) lbl.textContent = c.ventLabel;
  const ta = document.getElementById('ventText');
  if (ta) ta.placeholder = c.ventPlaceholder;
  const cta = document.querySelector('#screen-landing .btn-primary');
  if (cta) cta.textContent = c.cta;
  const pick = document.querySelector('#screen-lenses .section-title');
  if (pick) pick.textContent = c.pickLens;
  // update char counter max
  const counter = document.getElementById('charCounter');
  if (ta) ta.maxLength = c.charMax;
  if (counter) counter.textContent = ta ? ta.value.length + '/' + c.charMax : '0/' + c.charMax;
}

function triggerHaptic(pattern) {
  if (typeof navigator.vibrate === 'function') navigator.vibrate(pattern);
}
```

---

### Step 3 — Theme transition animation CSS

Add to `<style>` block (after existing loading overlay styles):

```css
/* Theme transition */
#app.theme-out {
  filter: blur(3px);
  opacity: 0.5;
  transform: scale(0.985);
  transition: filter 0.16s ease, opacity 0.16s ease, transform 0.16s ease !important;
}
#app.theme-in {
  filter: none;
  opacity: 1;
  transform: none;
  transition: filter 0.18s ease, opacity 0.18s ease, transform 0.18s ease !important;
}
@media (prefers-reduced-motion: reduce) {
  #app.theme-out, #app.theme-in { transition: none !important; filter: none; opacity: 1; transform: none; }
}
```

---

### Step 4 — `runThemeTransition()` + update `switchTheme()`

```js
function runThemeTransition(newTheme, cb) {
  const app = document.getElementById('app');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) { cb(); return; }
  app.classList.add('theme-out');
  setTimeout(() => {
    cb();  // apply theme at midpoint
    app.classList.remove('theme-out');
    app.classList.add('theme-in');
    setTimeout(() => app.classList.remove('theme-in'), 200);
  }, 160);
}
```

Update `switchTheme`:
```js
function switchTheme(theme) {
  if (theme === currentTheme) return;
  triggerHaptic(10);
  runThemeTransition(theme, () => {
    currentTheme = theme;
    document.getElementById('app').setAttribute('data-theme', theme);
    document.querySelectorAll('.theme-tab').forEach(tab => {
      tab.setAttribute('aria-selected', tab.dataset.themeTarget === theme ? 'true' : 'false');
    });
    document.querySelectorAll('[data-portrait-id]').forEach(img => {
      const fig = FIGURES.find(f => f.id === img.dataset.portraitId);
      if (fig) img.src = fig.portraits[theme];
    });
    if (previewFigure) document.getElementById('previewPortrait').src = previewFigure.portraits[theme];
    if (currentFigure) document.getElementById('respPortrait').src = currentFigure.portraits[theme];
    applyThemeCopy(theme);
  });
}
```

---

### Step 5 — Loading dot personality CSS

Replace existing `.ldot` rule section with theme-aware variants:

```css
/* Cyberpunk: terminal cursor blink */
[data-theme="cyberpunk"] .ldot { border-radius: 0; width: 2px; height: 14px; background: var(--c1); animation: cyberCursor 0.9s infinite step-end; }
[data-theme="cyberpunk"] .ldot:nth-child(2) { animation-delay: 0.3s; }
[data-theme="cyberpunk"] .ldot:nth-child(3) { animation-delay: 0.6s; }
@keyframes cyberCursor { 0%,49%{opacity:1;} 50%,100%{opacity:0;} }

/* Kawaii: bouncy color-cycle */
[data-theme="kawaii"] .ldot { background: var(--c1); animation: kawaiiBounce 0.8s infinite ease-in-out; }
[data-theme="kawaii"] .ldot:nth-child(1) { animation-delay: 0s;    background: #ff2d78; }
[data-theme="kawaii"] .ldot:nth-child(2) { animation-delay: 0.15s; background: #8b5cf6; }
[data-theme="kawaii"] .ldot:nth-child(3) { animation-delay: 0.3s;  background: #5b8dee; }
@keyframes kawaiiBounce { 0%,100%{transform:translateY(0);} 40%{transform:translateY(-10px);} }

/* Notepad: gentle fade */
[data-theme="notepad"] .ldot { background: var(--text-m); animation: notepadFade 1.4s infinite ease-in-out; transform: none; }
[data-theme="notepad"] .ldot:nth-child(2) { animation-delay: 0.25s; }
[data-theme="notepad"] .ldot:nth-child(3) { animation-delay: 0.5s; }
@keyframes notepadFade { 0%,100%{opacity:0.2;} 50%{opacity:0.8;} }
```

---

### Step 6 — Portrait fallback

In `renderGrid()`, after setting `img.src`, add:

```js
img.onerror = function() {
  this.style.display = 'none';
  const fb = document.createElement('div');
  fb.className = 'portrait-fallback';
  fb.textContent = (fig.name.match(/\b\w/g) || []).slice(0,2).join('').toUpperCase();
  this.parentNode.replaceChild(fb, this);
};
```

CSS:
```css
.portrait-fallback {
  width: 64px; height: 64px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-card2); color: var(--c1);
  font-size: 16px; font-weight: 700; letter-spacing: 1px;
  border: 1px solid var(--c1);
}
[data-theme="cyberpunk"] .portrait-fallback { border-radius: 32px; }
[data-theme="kawaii"]    .portrait-fallback { border-radius: 14px; }
[data-theme="notepad"]   .portrait-fallback { border-radius: 50%; }
```

---

### Step 7 — Selected card persistence + lens count badge

Update state in `openPreview`: `selectedFigureId = fig.id;`
Update `renderGrid()`: after creating card, add `if (fig.id === selectedFigureId) card.classList.add('selected');`
Update `goToLanding()`: add `selectedFigureId = null;`

HTML: in `screen-lenses` after the `section-title`, add:
```html
<div class="lens-count-badge" id="lensCountBadge" style="display:none;"></div>
```

Function to update badge:
```js
function updateLensBadge() {
  const badge = document.getElementById('lensCountBadge');
  if (!badge) return;
  if (lensUseCount === 0) { badge.style.display = 'none'; return; }
  badge.style.display = '';
  const free = Math.max(0, 3 - lensUseCount);
  badge.textContent = sessionStorage.getItem('gateSkipped') ? 'Unlimited ✓' : free + ' of 3 free';
}
```

CSS:
```css
.lens-count-badge {
  font-size: 11px; font-weight: 700; letter-spacing: 0.5px;
  color: var(--text-m); text-align: center;
  padding: 4px 12px; border-radius: 20px;
  background: var(--bg-card); border: 1px solid var(--text-m);
  align-self: center;
}
[data-theme="cyberpunk"] .lens-count-badge { font-family: var(--font-h); color: var(--c1); border-color: var(--c1); }
[data-theme="kawaii"]    .lens-count-badge { color: var(--c1); border-color: var(--c1); }
```

---

### Step 8 — Account gate + response actions + bottom nav

Account gate in `confirmLens()`:
```js
function confirmLens() {
  if (!previewFigure) return;
  document.getElementById('overlay-preview').classList.remove('open');
  lensUseCount++;
  updateLensBadge();
  if (lensUseCount >= 4 && !sessionStorage.getItem('gateSkipped')) {
    pendingFigure = previewFigure;
    showAccountGate();
  } else {
    callLens(previewFigure);
  }
}
function showAccountGate() { showScreen('screen-account'); }
function skipAccountGate() {
  sessionStorage.setItem('gateSkipped', '1');
  updateLensBadge();
  if (pendingFigure) { callLens(pendingFigure); pendingFigure = null; }
  else showScreen('screen-lenses');
}
```

HTML account screen: add skip button after "← Back":
```html
<button class="btn btn-ghost" style="align-self:center;" onclick="skipAccountGate()">Skip for now →</button>
```

Bottom nav labels (screen-response):
- "⊙ New Lens" → "⊙ Try another"  (or "Try another Lens" but short for mobile)
- "⌂ Home" stays, but `onclick` calls `goToLanding()`
- "✦ Decorate" → "→ Continue" with stub alert

Response action row: replace with:
```html
<div class="action-icon-row">
  <button class="action-btn btn-ghost" onclick="goToAccount()">
    <span class="action-icon">📖</span><span>Save</span>
  </button>
  <button class="action-btn btn-ghost" onclick="goToAccount()">
    <span class="action-icon">🎨</span><span>Decorate</span>
  </button>
  <button class="action-btn btn-ghost" onclick="shareResponse()">
    <span class="action-icon">↗</span><span>Socials</span>
  </button>
</div>
```

CSS:
```css
.action-icon-row { display:flex; gap:8px; justify-content:center; }
.action-btn {
  flex:1; min-height:52px; flex-direction:column; gap:2px;
  font-size:10px; letter-spacing:0.5px;
}
.action-icon { font-size:18px; }
```

---

### Step 9 — Haptics on key interactions

- `goToLenses()`: add `triggerHaptic(20)` after validation passes
- `confirmLens()`: `triggerHaptic(20)` at start
- `renderResponse()`: `triggerHaptic([10,50,10])` after sections revealed
- Theme tab click: already handled in `switchTheme()` (Step 4)

---

### Step 10 — Bug fixes + tap target

- `btn-ghost` CSS: add `min-height: 44px;`
- `#screen-lenses`: add `padding-bottom: 32px;`
- `figure-tag` font-size: bump from 9px to 10px globally; notepad 11px
- Call `applyThemeCopy('cyberpunk')` at bottom of script (initial apply on load)

---

## Verification

After all steps:
1. Open V100.html in browser
2. Type a vent, go to lens selection — check "Pick a Lens" vs per-theme heading
3. Switch theme — confirm blur transition + portrait swap + copy change
4. Tap a figure card — confirm selected state
5. Open preview → close → return to grid — confirm card stays selected
6. Confirm lens 4 times — confirm account gate appears
7. "Skip for now" → confirm proceeds to lens
8. On phone: confirm vibrate on theme switch + CTA tap
9. Check loading dots per theme

## Commit

`feat: V100 UX/UI improvements — theme transition, copy, gate, grid polish`
