# Review — T-005-02: claude-api-lens-integration

## Changes

### mindshift.html

**CSS added:**
- `#apiKeyModal` — full-screen backdrop + centred card (glass-morphism, consistent with dark theme)
- `.api-key-card` and children — modal card styles
- `#apiKeySettingsBtn` — fixed bottom-right gear/key button, only shown on page 5 via `body.page5-active`

**HTML added:**
- `<div id="apiKeyModal">` — API key entry modal with password input, save + cancel buttons, error paragraph
- `<button id="apiKeySettingsBtn">` — 🔑 button to re-open the modal from page 5

**JS added:**
- `getMindshiftApiKey()` / `setMindshiftApiKey(key)` / `clearMindshiftApiKey()` — localStorage wrappers
- `showApiKeyModal(onSuccess)` — shows modal, stores callback
- `submitApiKey()` — validates key format (sk- prefix), stores, calls callback
- `cancelApiKeyModal()` — hides modal, clears callback
- `openApiKeySettings()` — opens modal pre-filled with existing key
- `callClaudeAPI(fig, ventText, apiKey)` — async fetch to Anthropic v1/messages, parses JSON sections, falls back gracefully
- `buildDeepDiveHTML(sections)` — maps `[{title, body}]` to `.deep-dive-section.reveal-ready` HTML
- DOMContentLoaded listener for Enter key in `#apiKeyInput`

**JS modified:**
- `navigateToPage(pageNum)` — added `body.classList.toggle('page5-active', pageNum === 5)`
- `ventToFigure(fig, cardEl)` — replaced setTimeout placeholder with: API key check → modal prompt if missing → `callClaudeAPI` → `finishAndNavigate` on success / error HTML on failure

## Acceptance Criteria Check

- ✓ API key input (stored in localStorage, clearable via `clearMindshiftApiKey()`)
- ✓ Each of the 9 figures has a distinct system prompt
- ✓ `ventToFigure` calls Claude API and renders response in deepDiveContent
- ✓ Loading overlay stays visible during API call (no `hideLoading()` until resolve/reject)
- ✓ Graceful error state if API call fails (error section rendered, 🔑 hint shown)
- ✓ No regression to non-vent flow (`viewPersona` / `getPersonaContent` unchanged)

## Open Concerns

- **CORS / browser fetch:** Anthropic API requires `anthropic-dangerous-direct-browser-access: true` header for browser-side calls. Added. If Anthropic changes this policy, a proxy would be needed.
- **API key exposure:** Key lives in localStorage — visible in DevTools. Acceptable for a personal demo; not for production multi-user deployment.
- **Model availability:** `claude-haiku-4-5-20251001` used. If the model ID changes, update the string in `callClaudeAPI`.
- **Rate limiting:** No retry logic. If the user hits a rate limit, they see the error state and can retry manually.
- **Canvas flow (page 4 generic lenses):** These still use `viewPersona()` → `getPersonaContent()` — static content, no API call. This is intentional (those lenses are generic, not figure-specific). Could be wired to API in a future ticket.
