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
