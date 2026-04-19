# Structure — T-005-02: claude-api-lens-integration

## Files Modified

### mindshift.html (sole file)

#### 1. FIGURES array — add `systemPrompt` field to each entry
Each FIGURES entry gains a `systemPrompt` string. The prompt encodes the character's voice and instructs JSON output with 3 sections.

#### 2. New function: `getMindshiftApiKey()`
Returns `localStorage.getItem('mindshift_api_key') || null`.

#### 3. New function: `setMindshiftApiKey(key)`
Writes to localStorage.

#### 4. New HTML: API key modal
A `<div id="apiKeyModal">` overlay — shown when no key is stored. Contains:
- Brief explanation ("To get real responses, add your Anthropic API key")
- `<input type="password" id="apiKeyInput">`
- Submit button + cancel button
- Link to console.anthropic.com (user-provided context)

Styling: same glass-morphism dark overlay pattern as `.loading-overlay`.

#### 5. New function: `showApiKeyModal(onSuccess)`
Displays the modal. On submit, stores key and calls `onSuccess()`. On cancel, returns to figure pick.

#### 6. Modified function: `ventToFigure(fig, cardEl)`
- After marking selected card and starting loading overlay: check for API key
- If no key → `showApiKeyModal(() => ventToFigure(fig, cardEl))`
- If key present → call `callClaudeAPI(fig, userData.vent, apiKey)`
- Replace the `setTimeout(..., 2000)` block with an `async`/`await` pattern (or `.then()` chain)
- On success: render sections into `deepDiveContent`, call `hideLoading()` + `navigateToPage(5)` + `revealDeepDiveSections()`
- On error: call `hideLoading()`, show error state in `deepDiveContent`, navigate to page 5

#### 7. New function: `callClaudeAPI(fig, ventText, apiKey)`
Returns a Promise resolving to an array of `{ title, body }` objects (3 sections).

Implementation:
```
POST https://api.anthropic.com/v1/messages
Headers: x-api-key, anthropic-version: 2023-06-01, content-type: application/json, anthropic-dangerous-direct-browser-access: true
Body: { model, max_tokens, system: fig.systemPrompt, messages: [{ role: 'user', content: ventText }] }
```

Parse response: `response.content[0].text` → `JSON.parse()` → `.sections[]`.
Fallback on parse error: return `[{ title: "Their Perspective", body: rawText }]`.

#### 8. New CSS: `#apiKeyModal` styles
Same structural pattern as `.loading-overlay` but smaller, centred card.
Add a subtle `#settingsBtn` — small gear/key icon fixed to bottom-right of page 5, to allow re-entering or clearing the API key.

## Files Created

None.

## Ordering

1. Add `systemPrompt` to FIGURES entries
2. Add API key modal HTML
3. Add API key modal CSS
4. Add `getMindshiftApiKey`, `setMindshiftApiKey`, `showApiKeyModal`, `callClaudeAPI`
5. Modify `ventToFigure`
6. Add settings button HTML + handler
