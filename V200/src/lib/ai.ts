// Provider-agnostic text generation.
//
// BANDAID (2026-06-14): Google restricted Kate's account to `AQ.`-prefix keys,
// which do not work against the Generative Language API (`API_KEY_SERVICE_BLOCKED`).
// Until a real `AIza` key (or Vertex service account) is restored, we route
// through Groq — free, fast, OpenAI-compatible, no SDK needed. Flip the env var
// `AI_PROVIDER` back to `gemini` to return to Google with zero other code changes.
//
// Keep this module client-safe: no server-only top-level imports. The Gemini SDK
// stays behind a dynamic import so client components that (indirectly) import this
// don't pull it into the bundle. All provider keys are read at call time.

export type GenerateArgs = {
  system: string
  prompt: string
  temperature?: number
  maxTokens?: number
  timeoutMs?: number
}

const DEFAULT_TIMEOUT_MS = 20_000

// Single entry point. Throws on provider error / timeout — callers decide whether
// to surface (generate-response: fail loud) or fall back (title: first-words).
export async function generateText(args: GenerateArgs): Promise<string> {
  const provider = process.env.AI_PROVIDER ?? 'groq'
  if (provider === 'gemini') return generateWithGemini(args)
  return generateWithGroq(args)
}

async function generateWithGroq({
  system,
  prompt,
  temperature = 0.9,
  maxTokens = 400,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: GenerateArgs): Promise<string> {
  const key = process.env.GROQ_API_KEY
  if (!key) throw new Error('GROQ_API_KEY is not set')
  const model = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile'

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature,
        max_tokens: maxTokens,
        top_p: 0.95,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
      }),
      signal: controller.signal,
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`Groq ${res.status}: ${body.slice(0, 300)}`)
    }
    const data = await res.json()
    const text = data?.choices?.[0]?.message?.content
    return typeof text === 'string' ? text : ''
  } finally {
    clearTimeout(timer)
  }
}

async function generateWithGemini({
  system,
  prompt,
  temperature = 0.9,
  maxTokens = 400,
}: GenerateArgs): Promise<string> {
  const key = process.env.GOOGLE_GEMINI_API_KEY
  if (!key) throw new Error('GOOGLE_GEMINI_API_KEY is not set')
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(key)
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL ?? 'gemini-2.0-flash',
    systemInstruction: system,
    generationConfig: { temperature, topP: 0.95, maxOutputTokens: maxTokens },
  })
  const result = await model.generateContent(prompt)
  return result.response.text()
}
