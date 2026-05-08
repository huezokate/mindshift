# Design — T-013-01

## Decision: Dedicated screen with CSS scroll-snap carousel

### Option A (chosen): Full-screen `#screen-ui-select` with horizontal scroll-snap
- A new screen in the normal screen stack
- `.ui-select-track` is a flex row with `scroll-snap-type: x mandatory`
- Each `.ui-select-card` is `width: calc(100% - 32px)` (peek effect), `scroll-snap-align: center`
- Track has `padding: 0 16px` so first/last cards can center
- Cards are self-styled via `[data-theme-id="X"]` — immune to `data-theme` on `#app`
- Scroll listener previews the centered theme on `#app` as user swipes
- Arrow buttons + dot indicators for non-touch navigation
- CHOOSE button per card applies theme + goes to landing

**Why chosen:** Consistent with existing scroll-snap pattern (preview popup), works with current `showScreen()` architecture, no library needed, cards look correct regardless of current theme.

### Option B (rejected): CSS transforms / translateX slider
- Would need manual position math and gesture recognition
- More complex, no benefit over scroll-snap for this use case

### Option C (rejected): Reuse `#overlay-theme` on `#screen-ui-select`
- The overlay was always a workaround — converting it to a full screen is cleaner
- Overlay code is tangled with lens screen flow; removal is lower risk than repurposing

## Card self-styling approach

Cards hardcode their colors via `[data-theme-id]` attribute selectors. This is the right pattern because:
- User starts at welcome with `data-theme="cyberpunk"` on `#app`
- If kawaii/notepad cards relied on `data-theme`, they'd look wrong until the user scrolls past the first card and triggers the preview
- Hardcoded colors make the initial render correct immediately

Color values per card (from Figma + existing THEME_COPY):
- Cyberpunk: bg `#0D0D1A`, border `rgba(176,76,255,0.6)`, name `#39FF14`, tagline `#00F5FF`, desc `#7ECFDF`, btn green neon
- Kawaii: bg `#ffffff`, border `2px solid #222`, border-radius 20px, name `#ff2d78`, tagline `#ff2d78`, desc `#3a3560`, btn pink
- Notepad: bg `#fdfdfb`, border `1.5px solid #c8bfb4`, border-left `4px solid #4a8855`, name `#3a6fa8`, tagline `#4a8855`, desc `#5a4e47`, btn green

## Theme preview on scroll

As the user swipes, the scroll listener (80ms debounce) calls `switchTheme(themeId)` on the centered card. This means:
- `#app` re-skins live while scrolling
- Landing screen, lens screen etc. already look right when the user arrives
- No "surprise" theme change after landing

`switchTheme()` already runs `runThemeTransition()` which is a brief opacity fade — fine for scroll preview since it only fires after the 80ms debounce, not on every pixel.

## Navigation UI
- Arrow buttons (`.ui-select-prev`, `.ui-select-next`) call `scrollUISelect(direction)` which finds the adjacent card and scrolls to it
- Dot indicators (3 dots, one per theme) — active dot uses `var(--c1)` of the currently previewed theme? No — since dot colors would need to follow the card, not the global theme. Use a fixed white/semi-transparent dot approach; active = fully opaque.
- Back button: "← Back" → `showScreen('screen-welcome')`

## Flow wiring changes
- Welcome "ENTER THE SPACE" → `showScreen('screen-ui-select')`; also call `initUISelect()` to reset scroll position
- `goToLenses()` — remove `openThemeModal()` call
- `#overlay-theme` HTML + CSS + JS — fully deleted

## What is NOT changing
- `switchTheme()` function — unchanged
- `goToLanding()` — unchanged  
- All screens after landing — unchanged
- THEME_COPY themeModalName/Tagline/Desc fields can stay or be removed; they're only referenced by the deleted modal code
