// Expo push sender — the ONLY module that knows Expo's push HTTP API.
// Plain fetch against exp.host (no SDK dependency); messages are chunked at
// Expo's documented 100-per-request limit. Tickets whose immediate error is
// DeviceNotRegistered identify dead tokens for pruning; delayed receipts are
// deliberately not polled in v1 (see T-030-05 design D2).

export type ExpoPushMessage = {
  to: string
  title: string
  body: string
  data?: Record<string, unknown>
}

export type ExpoPushTicket = {
  status: 'ok' | 'error'
  id?: string
  message?: string
  details?: { error?: string }
}

export const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'
const CHUNK_SIZE = 100

export function chunkMessages<T>(messages: T[], size: number = CHUNK_SIZE): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < messages.length; i += size) chunks.push(messages.slice(i, i + size))
  return chunks
}

/**
 * Send push messages; returns one ticket per message, in order. A failed
 * chunk (network / non-2xx) yields error tickets for its messages instead of
 * throwing — the cron must keep emailing regardless of push health.
 */
export async function sendExpoPush(messages: ExpoPushMessage[]): Promise<ExpoPushTicket[]> {
  const tickets: ExpoPushTicket[] = []
  for (const chunk of chunkMessages(messages)) {
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(chunk),
      })
      const json = await res.json().catch(() => null)
      const data = (json as { data?: ExpoPushTicket[] } | null)?.data
      if (!res.ok || !Array.isArray(data) || data.length !== chunk.length) {
        tickets.push(...chunk.map(() => ({ status: 'error' as const, message: `HTTP ${res.status}` })))
        continue
      }
      tickets.push(...data)
    } catch (e) {
      tickets.push(
        ...chunk.map(() => ({
          status: 'error' as const,
          message: e instanceof Error ? e.message : 'network error',
        })),
      )
    }
  }
  return tickets
}

/** Tokens whose ticket says the device is gone — delete these rows. */
export function deadTokensFromTickets(
  messages: ExpoPushMessage[],
  tickets: ExpoPushTicket[],
): string[] {
  const dead: string[] = []
  tickets.forEach((t, i) => {
    if (t.status === 'error' && t.details?.error === 'DeviceNotRegistered' && messages[i]) {
      dead.push(messages[i].to)
    }
  })
  return dead
}
