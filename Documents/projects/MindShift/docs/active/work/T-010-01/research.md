# Research — T-010-01: V100 UX Audit

## File

`V100/V100.html` — 1782 lines, self-contained. No external JS except Google Fonts and the optional `callClaudeAPI` fallback. Portraits served from `../portraits/{theme}/`.

---

## Screens

### screen-landing
- Headline `t-h1` (gradient on cyberpunk, solid on kawaii/notepad)
- 3 body lines of copy → same text across all themes
- `vent-field`: label "Vent it out…", textarea 7 rows, char counter 0/800
- Placeholder: "No filter needed — pour it all out." — identical across themes
- CTA button: "Select the Lens" — identical across themes
- `add-card`: "Coming Soon / Mind-Mapping Tool" — identical across themes

### screen-lenses
- `quote-field`: read-only display of vent text with guessed topic label
- `t-h2` heading: "Pick a Lens" — identical across themes
- `figure-grid`: 3-column CSS grid, 15 cards rendered by `renderGrid()`
- Each card: `figure-portrait` img (64×64) + `figure-name` + `figure-tag`
- Tap → `openPreview(fig, cardEl)` → overlay popup

### screen-response
- `quote-field`: read-only vent
- `response-card`: portrait (36×36) + figure name + 3 `response-section` divs
- Response row: "← Try another" (btn-secondary) + "↗ Share" + "✦ Save" (btn-ghost)
- `bottom-nav`: "⊙ New Lens" (btn-primary) + "⌂ Home" (btn-secondary) + "✦ Decorate" (btn-primary)
- Bottom nav labels differ from Figma spec (see Gaps below)

### screen-account
- Headline "Create Account"
- 4 compact-input fields: nickname, email, phone, password
- "Create Account" btn-primary
- add-card with subscribe CTA
- "← Back" btn-ghost

---

## Overlays

### overlay-preview (lens preview popup)
- Portrait (88×88) + fullName + quote + bio
- Actions: "Back to selection" btn-secondary + "Select the Lens" btn-primary
- Closes on backdrop click or Escape

### overlay-loading
- Portrait (72×72) + title "{fullName}'s Perspective" + 3 dots + subtitle (fig.loadingLine)
- Min 1800ms delay regardless of API speed
- Dots styled with `background: var(--c1)` — same color for all themes

---

## State

| Variable | Type | Purpose |
|---|---|---|
| `currentTheme` | string | Active theme key |
| `currentVent` | string | User's vent text |
| `previewFigure` | object | Figure in preview popup |
| `currentFigure` | object | Figure whose response is showing |
| `previousScreen` | string | For back-navigation from account |

**Missing state:**
- No `lensUseCount` — Figma specifies account gate at 4th lens attempt
- No `sessionStorage` flag for gate bypass ("skip for now")
- No `localStorage` for theme persistence across sessions

---

## Theme Switching — `switchTheme(theme)`

1. Sets `data-theme` on `#app` — instant CSS variable swap
2. Updates tab `aria-selected`
3. Updates `[data-portrait-id]` img srcs
4. Updates preview portrait if open
5. Updates response portrait if showing

**No transition animation.** Theme snap is immediate. All CSS properties have a shared `transition: 0.28s` but this fires on *every* element simultaneously and causes a global reflow flash rather than a smooth morph.

**No copy swap.** Landing headline, vent placeholder, button labels, section heading — all static strings unchanged by `switchTheme`.

---

## Gaps / Issues by Severity

### Critical (breaks prototype test)

1. **No account gate logic.** `lensUseCount` doesn't exist. The 4th lens use should trigger the account screen (per Figma sticky: "Trigger Account Creation When: User tries to use 4th lens"). Currently unlimited.

2. **Selected card loses state after preview.** `openPreview()` adds `.selected` to the card. `closePreview()` nulls `previewFigure` but doesn't clear `.selected`. When `confirmLens()` is called, it transitions away. If user returns to lenses via "Try another", the grid re-renders via `renderGrid()` which wipes innerHTML — so no card is highlighted. User can't see which figure they already tried.

### High (degrades feel on phone)

3. **No haptics.** `navigator.vibrate()` not called anywhere. Theme switch, figure tap, and CTA taps are all silent/feedback-free on mobile.

4. **Ghost buttons too small.** `btn-ghost` has `padding: 8px 14px` = ~28–30px hit height. WCAG and Apple HIG both require 44px minimum. Affects Share and Save in response action row.

5. **Bottom nav labels wrong.** Figma response footer: "Try another Lens" / "New" (home icon) / "Continue conversation". V100 has: "New Lens" / "Home" / "Decorate". Decorate belongs on the action row, not the nav.

6. **No per-theme copy.** Every theme sounds the same. This is the main thing being tested — three distinct aesthetic experiences. Same copy undermines the test.

7. **Theme transition is instant.** CSS vars snap simultaneously. The flash of transitioning borders + background + text at once reads as a glitch, not a switch. Needs a brief fade-out/in or overlay morph.

### Medium (polish gaps)

8. **Figure tag too small.** `figure-tag` is 9px on cyberpunk (`.figure-tag { font-size: 9px }`). Figma shows it readable at 12px. On 2× phone screens it's ~4.5pt — unreadable.

9. **No portrait fallback.** If portrait img 404s (notepad filenames have spaces — could cause issues on some CDNs), `<img>` shows broken icon. Needs `onerror` fallback showing initials.

10. **Loading dots are monochrome per theme.** Cyberpunk dots are cyan — good. Kawaii dots should be multicolor/bouncy. Notepad dots should be muted/calm. Currently all use `var(--c1)` uniformly with the same animation.

11. **Lens count / "X of 3 free" missing.** Figma shows awareness of the 3-lens limit. No indicator in V100.

12. **"Che Guevara" card has no overlay suffix** — already clean, confirmed in code (fullName: 'Ernesto "Che" Guevara', name: 'Che Guevara'). Not an issue.

### Low (minor polish)

13. **All CSS transitions fire simultaneously on theme switch**, including layout properties. Should restrict transition to color/background/border-color only during theme switch, not layout/transform.

14. **Response sections stagger-reveal uses `opacity + translateY`.** Clean, but no per-theme personality. Cyberpunk should feel like a terminal print; notepad like ink appearing; kawaii like a pop-in.

15. **Preview portrait is 88×88.** Figma specifies 92×98 in the popup. Minor discrepancy.

16. **Char counter says "0/800"** — Figma shows "0/450 characters". Counter cap should match design (450).

---

## Figma Sticky Notes (key constraints)

- **"it could get up to 90 sec to load: between the screens need animation typing starts → UI"** — loading state needs animated typing/typing-starts effect, not just dots. The typing animation signals that processing is happening.
- **"Trigger Account Creation When: User tries to use 4th lens"** — gate logic defined.
- **"this button set should be the ui of the brands?"** — social login buttons (Google/Apple/Instagram) should match brand UI, noted for account screen.

---

## Portrait File Paths (risk)

Notepad portraits all have a space in the filename: `socrates_ notepad.png`. On GitHub Pages these are served correctly (URL-encodes to `%20`). Confirmed working. Low risk.

---

## Summary of What to Build (T-010-02 → T-010-06)

| Ticket | Core work |
|---|---|
| T-010-02 | Animated theme transition (fade overlay morph) |
| T-010-03 | Per-theme copy + loading animation personality |
| T-010-04 | Account gate (4th lens), corrected bottom nav labels, action row icons |
| T-010-05 | Haptics, ghost button tap target fix, char counter cap to 450 |
| T-010-06 | Selected card persistence, figure-tag size, portrait fallback, lens count badge |
