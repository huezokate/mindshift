# Plan — T-005-02: claude-api-lens-integration

## Step 1 — Add systemPrompt to each FIGURES entry
Modify the 9 FIGURES objects to include a `systemPrompt` field with the character-specific voice prompt.

**Verify:** Each entry has a non-empty `systemPrompt` string.

## Step 2 — Add API key modal HTML
Insert `<div id="apiKeyModal">` before the loading-overlay div. Include input, buttons, and a note about key storage.

**Verify:** Modal div exists in DOM, hidden by default.

## Step 3 — Add API key modal CSS
Add `#apiKeyModal` styles to the `<style>` block. Card centred over a dark backdrop, consistent with dark theme.

**Verify:** Modal looks correct when `display: flex` is applied temporarily.

## Step 4 — Add utility functions
Add `getMindshiftApiKey()`, `setMindshiftApiKey(key)`, `clearMindshiftApiKey()` — localStorage wrappers.

**Verify:** `localStorage.setItem/getItem` with key `'mindshift_api_key'`.

## Step 5 — Add `showApiKeyModal(onSuccess)`
Shows the modal. On valid submit → store key → call `onSuccess()`. On cancel → hide modal.

**Verify:** Calling `showApiKeyModal(() => console.log('ok'))` shows modal; submit stores key; cancel hides modal.

## Step 6 — Add `callClaudeAPI(fig, ventText, apiKey)`
Async function. Builds request, calls fetch, parses JSON response. Returns `[{ title, body }]` array.

**Verify:** With a valid key, the function resolves with 3 sections. With bad key, rejects with an error message.

## Step 7 — Modify `ventToFigure`
Replace the 2s `setTimeout` block with async flow:
1. Show loading
2. Check key → prompt if missing
3. Call `callClaudeAPI`
4. On success → populate `deepDiveContent` from sections, `hideLoading`, `navigateToPage(5)`, `revealDeepDiveSections`
5. On error → `hideLoading`, populate `deepDiveContent` with error message, `navigateToPage(5)`

**Verify:** End-to-end with a valid key produces real in-character response on page 5.

## Step 8 — Add settings button
Small `🔑` button fixed to bottom-right of page 5. Clicking it shows the modal, which on submit updates the stored key.

**Verify:** Button visible on page 5; clicking re-opens modal.

## Testing Strategy

- Manual: Enter a vent, pick Dolly Parton, verify response feels in-character
- Manual: Enter a vent, pick Socrates, verify response asks questions not gives answers
- Manual: Enter wrong API key, verify error state
- Manual: Clear API key, pick a figure, verify modal appears
- Manual: Canvas flow (page 3 → lens button) still works (viewPersona unchanged)
- Regression: Page 4 generic persona cards still work
