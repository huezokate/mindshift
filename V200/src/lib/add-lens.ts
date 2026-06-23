import { FIGURES } from './figures'
import type { LensResponseV2 } from './journal-types'

/**
 * Apply a new lens to an existing journal entry: generate the figure's response
 * for the entry's vent (tier-enforced server-side), then append it to the entry.
 * Returns the new lens (shaped for optimistic insert) plus the session id.
 *
 * Throws on limit (429), generation, or save failure — callers surface the message.
 */
export async function applyLensToEntry(opts: {
  sessionId: string
  ventText: string
  figureId: string
  theme: string
}): Promise<{ sessionId: string; lens: LensResponseV2 }> {
  const figure = FIGURES.find(f => f.id === opts.figureId)
  if (!figure) throw new Error('Unknown lens.')

  const gen = await fetch('/api/generate-response', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // isNewQuote:false — adding a lens to an existing entry counts against the
    // per-vent lens limit, not a new daily quote.
    body: JSON.stringify({
      prompt: opts.ventText,
      figureId: figure.id,
      systemPrompt: figure.systemPrompt,
      isNewQuote: false,
    }),
  })
  if (gen.status === 429) {
    const d = await gen.json().catch(() => ({}))
    throw new Error(d.error === 'lenses' ? 'Lens limit reached for this entry.' : 'Daily limit reached.')
  }
  if (!gen.ok) {
    const d = await gen.json().catch(() => ({}))
    throw new Error(d.error ?? 'The lens could not respond right now.')
  }
  const text = ((await gen.json()).response ?? '').trim()
  if (!text) throw new Error('The lens came back empty. Please try again.')

  const save = await fetch('/api/save-response', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: opts.sessionId,
      ventText: opts.ventText,
      figureId: figure.id,
      responseText: text,
      theme: opts.theme,
    }),
  })
  if (!save.ok) throw new Error('Saved the lens but the journal failed to update.')
  const { sessionId, responseId } = await save.json()

  return {
    sessionId,
    lens: {
      id: responseId,
      figure_id: figure.id,
      response_text: text,
      is_favorite: false,
      created_at: new Date().toISOString(),
      shares: [],
    },
  }
}
