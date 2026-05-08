# Progress — T-010-01 (covers all T-010-02 through T-010-06)

## Completed

- [x] State: `lensUseCount`, `pendingFigure`, `selectedFigureId` added
- [x] `THEME_COPY` constant with per-theme h1, ventLabel, placeholder, cta, pickLens, charMax
- [x] `applyThemeCopy(theme)` — updates 5 DOM text nodes + maxLength
- [x] `triggerHaptic(pattern)` — guarded navigator.vibrate wrapper
- [x] `runThemeTransition(cb)` — blur+scale+opacity morph, respects prefers-reduced-motion
- [x] `switchTheme()` — now calls transition + applyThemeCopy, haptic on switch
- [x] CSS: `.theme-out` / `.theme-in` transition classes on `#app`
- [x] CSS: per-theme loading dot personalities (cyberpunk cursor / kawaii bounce / notepad fade)
- [x] CSS: `.portrait-fallback` initials circle with per-theme border-radius
- [x] CSS: `.lens-count-badge` pill, themed
- [x] CSS: `.action-icon-row` + `.action-btn` (stacked icon+label, min 52px)
- [x] CSS: `btn-ghost` min-height 44px tap target fix
- [x] CSS: `figure-tag` bumped 9px → 10px (notepad 11px italic)
- [x] CSS: `#screen-lenses` padding-bottom: 32px
- [x] HTML: lens screen — `pickLensHeading` + `lensCountBadge` elements
- [x] HTML: response screen — `action-icon-row` with Save/Decorate/Socials
- [x] HTML: bottom nav — Try another / New / Continue labels
- [x] HTML: account screen — `skipGateBtn` (hidden by default)
- [x] `renderGrid()` — portrait fallback onerror, selected card restored, haptic on tap
- [x] `openPreview()` — sets `selectedFigureId`
- [x] `goToLanding()` — resets `selectedFigureId`
- [x] `confirmLens()` — increments `lensUseCount`, account gate on 4th
- [x] `showAccountGate()` / `skipAccountGate()` / `updateLensBadge()` / `continueConversation()`
- [x] `renderResponse()` — haptic [10,50,10] after last section reveals
- [x] `updateCharCount()` — reads maxLength dynamically (450)
- [x] `applyThemeCopy('cyberpunk')` called on load

## Deviations from plan

None significant. `loadingPortrait` theme-swap deferred (still works via currentFigure.portraits on load).
