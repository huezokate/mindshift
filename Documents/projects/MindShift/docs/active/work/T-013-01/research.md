# Research — T-013-01

## File under change
`V100/V100.html` — single file, ~2700 lines. Vanilla HTML/CSS/JS, no build step.

## Current screen order
1. `#screen-welcome` — active on load (class="screen active"), dark splash
2. `#screen-landing` — vent input, hero card, CTA
3. `#screen-lenses` — figure grid
4. `#screen-response` — AI response
5. `#screen-account` — gate / account form
6. `#screen-share` — share preview

## Current theme-switching mechanism
- `data-theme` attribute on `#app` div drives all CSS via `[data-theme="X"] .component` selectors
- `switchTheme(theme)` JS function sets `data-theme` and calls `applyThemeCopy(theme)`
- `currentTheme` JS variable tracks active theme (default: 'cyberpunk')
- `THEME_COPY` object holds per-theme copy strings

## Current overlay-theme (to be removed)
- `#overlay-theme` — position: absolute, z-index 150, opens over lens screen
- JS: `openThemeModal()`, `cycleThemeModal(direction)`, `chooseTheme()`, `themeModalIndex`, `THEME_ORDER`
- Called from `goToLenses()` → `openThemeModal()` after navigating to lens screen
- CSS: `#overlay-theme`, `.theme-modal-card`, `.theme-modal-name/tagline/desc/choose/nav/arrow`

## Welcome screen
- `#screen-welcome` exists, has `class="screen active"` in HTML
- "ENTER THE SPACE" button calls `goToLanding()` — needs to change to `goToUISelect()`
- Hardcoded dark cyberpunk aesthetic, not theme-sensitive
- Random tagline injection via JS `WELCOME_TAGLINES` array into `#welcomeTagline`

## goToLanding()
- Clears ventText, resets char counter, calls `showScreen('screen-landing')`
- Called from many screens as the "home" function
- Must NOT be changed to point at welcome or ui-select — it's the landing screen function

## showScreen()
- Takes screen id string, removes 'active' from all screens, adds 'active' to target
- Simple, no animation beyond CSS fadeUp

## THEME_COPY structure
Currently has: h1, heroBody, ventLabel, ventPlaceholder, cta, pickLens, charMax, themeModalName, themeModalTagline, themeModalDesc
- themeModalName/Tagline/Desc can stay for UI select card content (or be reused)

## CSS architecture
- `.screen { position: absolute; inset: 0; overflow-y: auto; }` — all screens absolute, only active one shown
- CSS custom properties per theme via `[data-theme="X"] { --var: value }` on `:root` override
- No CSS framework, all custom

## Key constraint: card self-styling
The UI select carousel must show cards in their own theme colors REGARDLESS of `data-theme` on `#app` (since the user hasn't chosen yet, `#app` starts as cyberpunk). Cards must use hardcoded colors via `[data-theme-id="X"]` selectors, not `[data-theme="X"]` selectors.

## Scroll snap pattern (already in use)
`.preview-card-track` uses: `display: flex; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch;`
`.preview-card-item`: `flex-shrink: 0; scroll-snap-align: center;`
Same pattern applies to `.ui-select-track` / `.ui-select-card`.

## Touch swipe
The existing swipe detection in `attachSwiperListener()` (used in preview popup) uses debounced scroll event + `offsetLeft + offsetWidth/2` centering logic. Same pattern will work for UI select.
