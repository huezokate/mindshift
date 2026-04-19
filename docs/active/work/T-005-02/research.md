# Research — T-005-02: claude-api-lens-integration

## Entry Point

`ventToFigure(fig, cardEl)` — lines ~2173–2231. Called when a user taps a figure card in the vent flow (page 6 → figure grid). Also the path from the canvas per-node lens (page 3 → page 4 → page 5).

### Current flow inside ventToFigure

1. Marks selected card
2. Shows loading overlay with figure icon + accent colour
3. Rotates loading lines from `fig.loadingLines[]` every 1200ms
4. `setTimeout(..., 2000)` — after 2s:
   - Clears interval
   - Sets page5 accent colour
   - Sets context bar icon + quote
   - Shows vent context strip if `userData.vent`
   - Populates `personaTitle` and `personaIntro`
   - Sets `deepDiveContent.innerHTML` with **hardcoded placeholder** (3 `.deep-dive-section` divs, last one is a yellow "💡 This is a preview" banner)
   - `hideLoading()` + `navigateToPage(5)` + `revealDeepDiveSections()`

## deepDiveContent Structure

`<div class="deep-dive" id="deepDiveContent">` — page 5. Expects children of class `deep-dive-section reveal-ready`. The `revealDeepDiveSections()` function stagger-animates them in.

`.deep-dive-section` CSS: `border-left: 4px solid var(--active-figure-accent)` — accent auto-applies.

Expected content shape:
```html
<div class="deep-dive-section reveal-ready">
  <h4>Section Title</h4>
  <p>Section content...</p>
</div>
```

## userData Object

Populated in `createMindMap()` and vent flow:
- `userData.now` — current situation (Flow 1)
- `userData.future` — 5-year vision (Flow 1)
- `userData.stuck` — what's blocking them (Flow 1)
- `userData.area` — life area of focus (Flow 1)
- `userData.vent` — free-text from Flow 2 textarea (set in `showFigurePick()`)
- `userData.lensContext` — `'vent'` | category id string
- `userData.figure` — the selected FIGURES entry

## FIGURES Data Model

9 entries after T-005-01. Each has: `name`, `icon`, `tag`, `accentColor`, `quote`, `loadingLines`.
No system prompt field currently — needs to be added.

## API Integration Constraints

- **No build step.** Vanilla JS in a single HTML file. Fetch API is available.
- **CORS.** Anthropic API supports browser-side CORS requests with `x-api-key` header.
- **API key.** Must come from the user. Options: localStorage, runtime input. Cannot be baked in.
- **Model.** User specified Claude API calls. `claude-haiku-4-5-20251001` is appropriate (fast, cheap for a demo).
- **Response format.** Need structured content for the 3 deep-dive sections. JSON tool use or prompted JSON is most reliable for client-side parsing.
- **Error handling.** Network errors, invalid key, rate limit. Must not leave the user on page 5 with broken content.

## Consumers to Preserve

- `viewPersona(persona)` — canvas flow, uses hardcoded `getPersonaContent()`. Not changed in this ticket.
- `revealDeepDiveSections()` — must still be called after `deepDiveContent.innerHTML` is set.
- Loading overlay mechanics — `showLoading()` / `hideLoading()` — must remain.

## API Key Storage

`localStorage.getItem('mindshift_api_key')` — write/read pattern. User can clear it.
