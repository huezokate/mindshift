// --- S-005: Claude API integration (T-005-02) ---

function getMindshiftApiKey() {
    return localStorage.getItem('mindshift_api_key') || null;
}
function setMindshiftApiKey(key) {
    localStorage.setItem('mindshift_api_key', key.trim());
}
function clearMindshiftApiKey() {
    localStorage.removeItem('mindshift_api_key');
}

var _apiKeyOnSuccess = null;

function showApiKeyModal(onSuccess) {
    _apiKeyOnSuccess = onSuccess;
    var modal = document.getElementById('apiKeyModal');
    var input = document.getElementById('apiKeyInput');
    var err   = document.getElementById('apiKeyError');
    input.value = '';
    err.style.display = 'none';
    modal.classList.add('active');
    setTimeout(function() { input.focus(); }, 100);
}

function submitApiKey() {
    var input = document.getElementById('apiKeyInput');
    var err   = document.getElementById('apiKeyError');
    var key   = input.value.trim();
    if (!key || !key.startsWith('sk-')) {
        err.textContent = 'Please enter a valid Anthropic API key (starts with sk-).';
        err.style.display = 'block';
        return;
    }
    setMindshiftApiKey(key);
    document.getElementById('apiKeyModal').classList.remove('active');
    if (_apiKeyOnSuccess) { _apiKeyOnSuccess(); _apiKeyOnSuccess = null; }
}

function cancelApiKeyModal() {
    document.getElementById('apiKeyModal').classList.remove('active');
    _apiKeyOnSuccess = null;
}

function openApiKeySettings() {
    showApiKeyModal(function() {});
    var input = document.getElementById('apiKeyInput');
    var stored = getMindshiftApiKey();
    if (stored) input.value = stored;
}

// Allow Enter key in API key modal input
document.addEventListener('DOMContentLoaded', function() {
    var inp = document.getElementById('apiKeyInput');
    if (inp) inp.addEventListener('keydown', function(e) { if (e.key === 'Enter') submitApiKey(); });
});

async function callClaudeAPI(systemPrompt, userPrompt) {
  try {
    const response = await fetch('/functions/generate-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemPrompt, userPrompt })
    });

    const data = await response.json();

    if (data.content && data.content[0] && data.content[0].text) {
      return data.content[0].text;
    }
    return null;
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
}
