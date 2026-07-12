import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  chunkMessages,
  deadTokensFromTickets,
  sendExpoPush,
  EXPO_PUSH_URL,
  type ExpoPushMessage,
} from '../push-send'

const msg = (to: string): ExpoPushMessage => ({ to, title: 'T', body: 'B' })

afterEach(() => vi.unstubAllGlobals())

describe('chunkMessages', () => {
  it('splits at the chunk size, preserving order', () => {
    const chunks = chunkMessages([1, 2, 3, 4, 5], 2)
    expect(chunks).toEqual([[1, 2], [3, 4], [5]])
  })

  it('empty input → no chunks', () => {
    expect(chunkMessages([], 100)).toEqual([])
  })
})

describe('sendExpoPush', () => {
  it('POSTs to exp.host and returns the tickets in order', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({ data: [{ status: 'ok', id: '1' }, { status: 'ok', id: '2' }] }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const tickets = await sendExpoPush([msg('ExponentPushToken[a]'), msg('ExponentPushToken[b]')])

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][0]).toBe(EXPO_PUSH_URL)
    expect(tickets.map((t) => t.status)).toEqual(['ok', 'ok'])
  })

  it('chunks 150 messages into two requests', async () => {
    const fetchMock = vi.fn().mockImplementation((_url, init) => {
      const batch = JSON.parse((init as { body: string }).body) as unknown[]
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: batch.map(() => ({ status: 'ok' })) }),
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    const tickets = await sendExpoPush(
      Array.from({ length: 150 }, (_, i) => msg(`ExponentPushToken[${i}]`)),
    )

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(tickets).toHaveLength(150)
  })

  it('a failed chunk becomes error tickets, never a throw', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    const tickets = await sendExpoPush([msg('ExponentPushToken[a]')])
    expect(tickets).toEqual([{ status: 'error', message: 'offline' }])
  })

  it('a malformed 200 body becomes error tickets', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({}) }),
    )
    const tickets = await sendExpoPush([msg('ExponentPushToken[a]')])
    expect(tickets[0].status).toBe('error')
  })
})

describe('deadTokensFromTickets', () => {
  it('collects only DeviceNotRegistered tokens, by position', () => {
    const messages = [msg('tok-a'), msg('tok-b'), msg('tok-c')]
    const dead = deadTokensFromTickets(messages, [
      { status: 'ok' },
      { status: 'error', details: { error: 'DeviceNotRegistered' } },
      { status: 'error', details: { error: 'MessageTooBig' } },
    ])
    expect(dead).toEqual(['tok-b'])
  })
})
