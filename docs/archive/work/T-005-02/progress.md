# Progress — T-005-02: claude-api-lens-integration

## Completed

1. Added `systemPrompt` field to all 9 FIGURES entries — character-specific voice prompts with JSON output instruction
2. Added API key modal HTML (`#apiKeyModal`) before loading overlay
3. Added `#apiKeySettingsBtn` fixed button (bottom-right, page5-active body class shows it)
4. Added CSS for modal card, settings button, error text
5. Added `page5-active` body class toggle in `navigateToPage()`
6. Added utility functions: `getMindshiftApiKey`, `setMindshiftApiKey`, `clearMindshiftApiKey`
7. Added `showApiKeyModal(onSuccess)`, `submitApiKey()`, `cancelApiKeyModal()`, `openApiKeySettings()`
8. Added Enter-key listener for apiKeyInput (via DOMContentLoaded)
9. Added `callClaudeAPI(fig, ventText, apiKey)` — async fetch to Anthropic API, JSON parse with fallback
10. Added `buildDeepDiveHTML(sections)` — renders section array to deep-dive-section divs
11. Modified `ventToFigure` — replaced 2s setTimeout placeholder with API key check + callClaudeAPI + error handling

## Deviations

- Added a `buildDeepDiveHTML` helper not in the original structure plan (cleaner than inline template building)
- `openApiKeySettings` pre-fills input with existing stored key for convenience
