// Provider-agnostic text generation.
//
// BANDAID (2026-06-14): Google restricted Kate's account to `AQ.`-prefix keys,
// which do not work against the Generative Language API (`API_KEY_SERVICE_BLOCKED`).
// Until a real `AIza` key (or Vertex service account) is restored, we route
// through Groq — free, fast, OpenAI-compatible, no SDK needed. Flip the env var
// `AI_PROVIDER` back to `gemini` to return to Google with zero other code changes.
//
// BANDAID #2 (2026-09-03): Groq is down for us too, so `anthropic` is now the
// default provider — Claude, via the official SDK (already a dependency). Same
// deal as above: `AI_PROVIDER` picks the branch, nothing else changes.
//
// Keep this module client-safe: no server-only top-level imports. The Gemini SDK
// stays behind a dynamic import so client components that (indirectly) import this
// don't pull it into the bundle. All provider keys are read at call time.

// A prior conversation turn, for multi-turn calls (Chat with the Lens, T-020-02).
// `lens` is mapped to the provider's assistant role. Single-shot callers omit this.
export type ChatTurn = { role: 'user' | 'lens'; content: string }

export type GenerateArgs = {
  system: string
  prompt: string
  // Optional conversation history preceding `prompt`. When present, the call is
  // multi-turn: history + the final user `prompt` are sent as a message sequence
  // so voice/context persist across turns. When absent, behavior is the original
  // single-shot system+prompt (all existing callers).
  messages?: ChatTurn[]
  temperature?: number
  maxTokens?: number
  timeoutMs?: number
  // When true, ask the provider for a strict JSON object back (Groq
  // `response_format: json_object`, Gemini `responseMimeType`). The prompt must
  // still describe the desired shape and contain the word "json" (Groq requires
  // it). Callers parse the returned string themselves.
  json?: boolean
}

const DEFAULT_TIMEOUT_MS = 20_000

// Single entry point. Throws on provider error / timeout — callers decide whether
// to surface (generate-response: fail loud) or fall back (title: first-words).
export async function generateText(args: GenerateArgs): Promise<string> {
  const provider = process.env.AI_PROVIDER ?? 'anthropic'
  if (provider === 'gemini') return generateWithGemini(args)
  if (provider === 'groq') return generateWithGroq(args)
  return generateWithAnthropic(args)
}

async function generateWithGroq({
  system,
  prompt,
  messages,
  temperature = 0.9,
  maxTokens = 400,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  json = false,
}: GenerateArgs): Promise<string> {
  const key = process.env.GROQ_API_KEY
  if (!key) throw new Error('GROQ_API_KEY is not set')
  // 2026-08-19: Groq decommissioned `llama-3.3-70b-versatile` (404 model_not_found),
  // which is why the Lens stopped coming back. `openai/gpt-oss-120b` is the closest
  // replacement on Groq: json_mode + structured_outputs, and unlike qwen3.6 it keeps
  // its chain-of-thought in a separate `reasoning` field instead of leaking <think>
  // blocks into `content`.
  const model = process.env.GROQ_MODEL ?? 'openai/gpt-oss-120b'

  // gpt-oss is a reasoning model and its reasoning tokens are billed against
  // `max_tokens`. At default effort a short reframe burned 129 of 179 completion
  // tokens on reasoning, which risks truncating the Lens mid-sentence. 'low' drops
  // that to ~7 and leaves the budget for the actual answer.
  const isReasoningModel = model.startsWith('openai/gpt-oss')

  // Groq is OpenAI-compatible: history maps 1:1 into the messages array
  // (lens → assistant). The final user `prompt` is always the last message.
  const history = (messages ?? []).map(m => ({
    role: m.role === 'lens' ? ('assistant' as const) : ('user' as const),
    content: m.content,
  }))

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
        ...(isReasoningModel ? { reasoning_effort: 'low' } : {}),
        ...(json ? { response_format: { type: 'json_object' } } : {}),
        messages: [
          { role: 'system', content: system },
          ...history,
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
    const choice = data?.choices?.[0]
    const text = choice?.message?.content
    // An empty completion is the "Lens never comes back" symptom. Name the cause
    // instead of returning '' and rendering a blank reframe.
    if (typeof text !== 'string' || text.trim() === '') {
      const reason = choice?.finish_reason ?? 'unknown'
      throw new Error(
        `Groq returned an empty completion (model=${model}, finish_reason=${reason})` +
          (reason === 'length' ? ' — max_tokens exhausted, likely by reasoning tokens' : '')
      )
    }
    return text
  } finally {
    clearTimeout(timer)
  }
}

async function generateWithAnthropic({
  system,
  prompt,
  messages,
  maxTokens = 400,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  json = false,
}: GenerateArgs): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error('ANTHROPIC_API_KEY is not set')
  // Dynamic import so the SDK never lands in a client bundle (see module header).
  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  const client = new Anthropic({ apiKey: key })
  const model = process.env.ANTHROPIC_MODEL ?? 'claude-opus-5'

  // Claude has no `response_format: json_object`. Ask for bare JSON in the system
  // prompt and strip anything the model wraps around it (see extractJson).
  const systemPrompt = json
    ? `${system}\n\nRespond with a single valid JSON object and nothing else — no prose, no markdown code fences.`
    : system

  const history = (messages ?? []).map(m => ({
    role: m.role === 'lens' ? ('assistant' as const) : ('user' as const),
    content: m.content,
  }))

  const res = await client.messages.create(
    {
      model,
      // Thinking tokens are billed against max_tokens, same trap as gpt-oss above.
      // Effort 'low' keeps them small; the floor keeps a 400-token reframe from
      // being truncated by whatever thinking does happen.
      max_tokens: Math.max(maxTokens, 2000),
      system: systemPrompt,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'low' },
      // NOTE: `temperature` is deliberately dropped — Claude Opus 5 rejects
      // sampling params with a 400. Voice is controlled by the system prompt.
      messages: [...history, { role: 'user' as const, content: prompt }],
    },
    { timeout: timeoutMs }
  )

  // A safety refusal returns HTTP 200 with empty content — name it rather than
  // rendering a blank reframe. Venting copy makes this more likely than usual.
  if (res.stop_reason === 'refusal') {
    throw new Error(
      `Anthropic declined this request (model=${model}, category=${res.stop_details?.type ?? 'unknown'})`
    )
  }

  const text = res.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('')
    .trim()
  if (text === '') {
    throw new Error(
      `Anthropic returned an empty completion (model=${model}, stop_reason=${res.stop_reason})` +
        (res.stop_reason === 'max_tokens' ? ' — max_tokens exhausted' : '')
    )
  }
  return json ? extractJson(text) : text
}

// Callers with `json: true` parse the string themselves, so hand them bare JSON
// even if the model adds a fence or a sentence around it.
function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const body = (fenced ? fenced[1] : text).trim()
  if (body.startsWith('{') || body.startsWith('[')) return body
  const start = body.search(/[{[]/)
  const end = Math.max(body.lastIndexOf('}'), body.lastIndexOf(']'))
  return start !== -1 && end > start ? body.slice(start, end + 1) : body
}

async function generateWithGemini({
  system,
  prompt,
  messages,
  temperature = 0.9,
  maxTokens = 400,
  json = false,
}: GenerateArgs): Promise<string> {
  const key = process.env.GOOGLE_GEMINI_API_KEY
  if (!key) throw new Error('GOOGLE_GEMINI_API_KEY is not set')
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(key)
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL ?? 'gemini-2.0-flash',
    systemInstruction: system,
    generationConfig: {
      temperature,
      topP: 0.95,
      maxOutputTokens: maxTokens,
      ...(json ? { responseMimeType: 'application/json' } : {}),
    },
  })

  // Multi-turn: replay history through a chat session (lens → model role), then
  // send the final user prompt. Single-shot when no history is supplied.
  if (messages && messages.length > 0) {
    const chat = model.startChat({
      history: messages.map(m => ({
        role: m.role === 'lens' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    })
    const result = await chat.sendMessage(prompt)
    return result.response.text()
  }

  const result = await model.generateContent(prompt)
  return result.response.text()
}
