// Entry-title logic for journal vents (T-018-07).
//
// Single source of truth for the header shown on feed cards + the detail view.
// `generateVentTitle` asks Gemini for a short "<synonym> on <topic>" summary;
// `deriveTitleFallback` is the deterministic first-words label used whenever
// Gemini is unavailable, slow, or a row predates the title column.
//
// IMPORTANT: keep this module client-safe. `deriveTitleFallback` is imported by
// client components (JournalPreviewCard / EntryDetail), so the Gemini SDK and
// process.env access MUST stay inside `generateVentTitle` via a dynamic import —
// nothing server-only at module top level.

const MAX_VENT_CHARS = 800 // matches the vent input MAX_CHARS
const MAX_TITLE_CHARS = 60
const TITLE_TIMEOUT_MS = 4000

// Contemplation vocabulary the design uses (mirrors lens/page.tsx PREFIXES).
const TITLE_SYSTEM_PROMPT = [
  'You write a very short title that summarizes what a journal entry is about.',
  'Begin with a present-participle contemplation verb such as: Contemplating,',
  'Ruminating on, Reflecting on, Thinking about, Wrestling with, Processing,',
  'Untangling, Sitting with.',
  'Then name the topic in a few words.',
  'Rules: 3 to 6 words total. No quotation marks. No trailing punctuation.',
  'No first person ("I", "my"). Title case is not required; plain case is fine.',
  'Output only the title, nothing else.',
  'Example: "Reflecting on a career change". Example: "Wrestling with a hard conversation".',
].join(' ')

// Deterministic, synchronous, never throws. First 6 words of the vent.
// (Both journal surfaces render this UPPERCASE via CSS.)
export function deriveTitleFallback(ventText: string): string {
  return ventText.split(/\s+/).filter(Boolean).slice(0, 6).join(' ')
}

// Trim, strip wrapping quotes, collapse whitespace, drop trailing punctuation,
// cap length. Returns '' if nothing usable is left (caller falls back).
function cleanTitle(raw: string): string {
  let t = raw.trim()
  // Strip a single pair of wrapping quotes (straight or curly).
  t = t.replace(/^["'“”‘’]+/, '').replace(/["'“”‘’]+$/, '').trim()
  // Collapse internal whitespace/newlines.
  t = t.replace(/\s+/g, ' ')
  // Drop trailing sentence punctuation.
  t = t.replace(/[.!?,;:]+$/, '').trim()
  if (t.length > MAX_TITLE_CHARS) {
    t = t.slice(0, MAX_TITLE_CHARS).trim()
  }
  return t
}

// Async. Calls Gemini for a title; on ANY error, timeout, or empty result
// returns deriveTitleFallback(ventText). Never throws.
export async function generateVentTitle(ventText: string): Promise<string> {
  const fallback = deriveTitleFallback(ventText)
  const trimmed = ventText.trim()
  if (!trimmed) return fallback
  if (!process.env.GOOGLE_GEMINI_API_KEY) return fallback

  try {
    // Dynamic import keeps the Gemini SDK out of the client bundle for callers
    // that only need deriveTitleFallback.
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: TITLE_SYSTEM_PROMPT,
    })

    const prompt = trimmed.slice(0, MAX_VENT_CHARS)
    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('title-timeout')), TITLE_TIMEOUT_MS)
      ),
    ])

    const cleaned = cleanTitle(result.response.text())
    return cleaned || fallback
  } catch {
    return fallback
  }
}
