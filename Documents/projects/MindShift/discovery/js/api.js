async function callClaudeAPI(systemPrompt, userPrompt) {
  console.log('🚀 Calling API with:', { systemPrompt, userPrompt });

  try {
    const response = await fetch('/functions/generate-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemPrompt, userPrompt })
    });

    console.log('📡 Response status:', response.status);
    const data = await response.json();
    console.log('📦 Response data:', data);

    if (data.content && data.content[0] && data.content[0].text) {
      return data.content[0].text;
    }
    return null;
  } catch (error) {
    console.error('❌ API Error:', error);
    return null;
  }
}
