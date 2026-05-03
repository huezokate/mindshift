# Plan — T-013-01

## Step 1: Read current file state
- Read V100.html to locate exact line numbers for overlay-theme, goToLenses, welcome button, THEME_COPY, CSS sections

## Step 2: Remove overlay-theme (HTML + CSS + JS)
- Delete `#overlay-theme` HTML block
- Delete CSS: `#overlay-theme`, `#overlay-theme.open`, `.theme-modal-card`, `.theme-modal-name`, `.theme-modal-tagline`, `.theme-modal-desc`, `.theme-modal-choose`, `.theme-modal-nav`, `.theme-modal-nav-label`, `.theme-modal-arrow`
- Delete JS: `openThemeModal`, `updateThemeModalContent`, `cycleThemeModal`, `chooseTheme`, `themeModalIndex`, `THEME_ORDER`
- Remove `openThemeModal()` call from `goToLenses()`

## Step 3: Add CSS for `#screen-ui-select`
Insert new CSS section after existing screen CSS:
- `#screen-ui-select` — flex column, no padding (track goes edge-to-edge)
- `.ui-select-track` — flex row, overflow-x auto, scroll-snap-type x mandatory, scrollbar hidden, height calc(100% - nav height)
- `.ui-select-card` — flex-shrink 0, width calc(100% - 32px), scroll-snap-align center, flex column, align-items center, gap, padding
- Per `[data-theme-id]` card colors (hardcoded)
- `.ui-select-card-name`, `.ui-select-card-tagline`, `.ui-select-card-desc`, `.ui-select-card-btn`
- `.ui-select-nav` — flex row, justify-content center, gap, padding
- `.ui-select-dot` — small circle, opacity transition
- `.ui-select-dot.active` — full opacity, scaled up
- `.ui-select-arrows` — flex row, absolute or pinned, prev/next buttons

## Step 4: Add `#screen-ui-select` HTML
Insert between `</div><!-- /screen-welcome -->` and `<!-- SCREEN: LANDING -->`:

```html
<!-- SCREEN: UI SELECTION -->
<div class="screen" id="screen-ui-select">
  <div class="ui-select-header">
    <button class="btn btn-ghost ui-select-back" onclick="showScreen('screen-welcome')">← Back</button>
    <span class="ui-select-label">CHOOSE YOUR STYLE</span>
  </div>
  <div class="ui-select-track" id="uiSelectTrack">
    <!-- Cyberpunk card -->
    <div class="ui-select-card" data-theme-id="cyberpunk">
      <div class="ui-select-card-name">CYBERPUNK</div>
      <div class="ui-select-card-tagline">Neon edges.<br>Dark depths.<br>Maximum signal.</div>
      <p class="ui-select-card-desc">Hack your mind in a high-contrast terminal aesthetic built for focus and intensity. For the ones who think in code and dream in electric light.</p>
      <button class="ui-select-card-btn" onclick="chooseUITheme('cyberpunk')">CHOOSE</button>
    </div>
    <!-- Kawaii card -->
    <div class="ui-select-card" data-theme-id="kawaii">
      <div class="ui-select-card-name">KAWAII</div>
      <div class="ui-select-card-tagline">Soft edges.<br>Bright energy.<br>Good vibes only.</div>
      <p class="ui-select-card-desc">A playful, candy-colored skin that makes self-growth feel like a treat. For the ones who know joy is the best motivator.</p>
      <button class="ui-select-card-btn" onclick="chooseUITheme('kawaii')">CHOOSE</button>
    </div>
    <!-- Notepad card -->
    <div class="ui-select-card" data-theme-id="notepad">
      <div class="ui-select-card-name">NOTEPAD</div>
      <div class="ui-select-card-tagline">Clean lines.<br>Clear thinking.<br>No noise.</div>
      <p class="ui-select-card-desc">A distraction-free, paper-light interface that gets out of your way. For the ones who believe clarity is the sharpest tool.</p>
      <button class="ui-select-card-btn" onclick="chooseUITheme('notepad')">CHOOSE</button>
    </div>
  </div>
  <div class="ui-select-footer">
    <button class="ui-select-arrow" onclick="scrollUISelect(-1)" aria-label="Previous">&#8249;</button>
    <div class="ui-select-dots">
      <span class="ui-select-dot active" data-dot="0"></span>
      <span class="ui-select-dot" data-dot="1"></span>
      <span class="ui-select-dot" data-dot="2"></span>
    </div>
    <button class="ui-select-arrow" onclick="scrollUISelect(1)" aria-label="Next">&#8250;</button>
  </div>
</div>
```

## Step 5: Update JS
- Change welcome button handler: `showScreen('screen-ui-select')` + `initUISelect()`
- Add `initUISelect()` — scrolls track to card matching `currentTheme`, sets active dot
- Add `chooseUITheme(themeId)` — calls `switchTheme(themeId)`, then `showScreen('screen-landing')`
- Add `scrollUISelect(direction)` — finds current centered card index, scrolls to index+direction
- Add scroll listener on `#uiSelectTrack` — debounced 80ms, detects centered card, calls `switchTheme()`, updates dots
- Remove `openThemeModal()` from `goToLenses()`

## Step 6: Verify
- Grep for any remaining `overlay-theme`, `themeModal`, `openThemeModal` references
- Verify no broken function calls

## Step 7: Commit and push
