'use client'
// Chat with the Lens — bottom-sheet thread UI (T-020-02).
//
// A bounded, arc-shaped conversation with one figure, seeded by the entry's vent
// + first reframe. User bubbles right, lens bubbles left (with avatar). The lens
// closes gracefully around ~5 exchanges (Approach B, model-signaled) and never
// past 20 user messages — at close the composer is replaced by a warm footer,
// never an error. Signed-in threads persist + revisit; anon threads are ephemeral
// (sessionStorage). Themed entirely via tokens.
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { FIGURES, portraitFor } from '@/lib/figures'
import { useTheme } from '@/lib/theme'
import Icon from '@/components/ui/Icon'
import { sendChatTurn, loadAnonThread, saveAnonThread } from '@/lib/chat-client'
import type { ChatMessage } from '@/lib/chat-types'

type Props = {
  open: boolean
  figureId: string
  sessionId: string | null // null for anon / unsaved
  ventText: string
  seedReply: string // the original reframe (context + the first lens bubble)
  onClose: () => void
}

export default function ChatSheet({
  open, figureId, sessionId, ventText, seedReply, onClose,
}: Props) {
  const { theme } = useTheme()
  const { isSignedIn } = useUser()
  const fig = FIGURES.find(f => f.id === figureId)
  const portrait = fig ? portraitFor(fig, theme) : null

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [closed, setClosed] = useState(false)
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Load the thread when the sheet opens: signed-in → persisted history route;
  // anon → ephemeral sessionStorage. The seed reframe is rendered separately as
  // the opening lens bubble, so it is never part of `messages`.
  useEffect(() => {
    if (!open) return
    let cancelled = false
    // All state updates happen in callbacks (never synchronously in the effect
    // body) so a fresh open loads the thread without cascading renders.
    const apply = (msgs: ChatMessage[], isClosed: boolean) => {
      if (cancelled) return
      setMessages(msgs)
      setClosed(isClosed)
      setError(null)
    }
    if (isSignedIn && sessionId) {
      fetch(`/api/chat-with-lens/history?sessionId=${sessionId}&figureId=${figureId}`)
        .then(r => (r.ok ? r.json() : { messages: [], closed: false }))
        .then(d => apply(d.messages ?? [], !!d.closed))
        .catch(() => apply([], false))
    } else {
      const anon = loadAnonThread(figureId)
      Promise.resolve().then(() => apply(anon, anon.some(m => m.done)))
    }
    return () => { cancelled = true }
  }, [open, isSignedIn, sessionId, figureId])

  // Keep the thread scrolled to the latest message.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, pending, open])

  async function send() {
    const text = draft.trim()
    if (!text || pending || closed) return
    setError(null)
    setPending(true)
    const userMsg: ChatMessage = { role: 'user', content: text, turn_index: messages.length }
    const history = messages // history BEFORE this turn (excludes the seed)
    setMessages(prev => [...prev, userMsg])
    setDraft('')
    try {
      const { reply, done } = await sendChatTurn({
        sessionId: isSignedIn ? sessionId : null,
        figureId, ventText, seedReply, userMessage: text, history,
      })
      const lensMsg: ChatMessage = { role: 'lens', content: reply, turn_index: messages.length + 1, done }
      setMessages(prev => {
        const next = [...prev, lensMsg]
        if (!isSignedIn) saveAnonThread(figureId, next)
        return next
      })
      if (done) setClosed(true)
    } catch (err) {
      // Roll back the optimistic user bubble and surface the error.
      setMessages(prev => prev.filter(m => m !== userMsg))
      setDraft(text)
      setError(err instanceof Error ? err.message : 'The lens could not respond.')
    } finally {
      setPending(false)
    }
  }

  const isKawaii = theme === 'kawaii'

  const bubble = (m: ChatMessage, key: string | number) => {
    const mine = m.role === 'user'
    return (
      <div key={key} style={{
        display: 'flex', gap: 8, alignItems: 'flex-end',
        flexDirection: mine ? 'row-reverse' : 'row',
      }}>
        {!mine && (
          <div style={{
            width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
            border: 'var(--fig-avatar-border)', background: 'var(--fig-avatar-grad)',
          }}>
            {portrait && <img src={portrait} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
        )}
        <div style={{
          maxWidth: '78%',
          background: mine ? 'var(--btn-secondary-bg)' : 'var(--card-bg)',
          border: mine ? '1px solid var(--cyan)' : '1px solid var(--violet)',
          borderRadius: 12, padding: '8px 12px',
          fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px',
          letterSpacing: isKawaii ? '0.4px' : '0.3px',
          color: mine ? 'var(--text-body)' : 'var(--cyan)',
        }}>
          {m.content}
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence>
      {open && fig && (
        <motion.div
          key="chat-overlay"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.22 }}
            onClick={e => e.stopPropagation()}
            className="w-full flex flex-col"
            style={{
              maxWidth: 440, height: '85dvh',
              background: 'var(--bg)',
              borderTop: '1px solid var(--violet)',
              borderRadius: '16px 16px 0 0',
            }}
          >
            {/* Header: figure + close */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px', borderBottom: '1px solid var(--input-divider)',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                border: 'var(--fig-avatar-border)', background: 'var(--fig-avatar-grad)',
              }}>
                {portrait && <img src={portrait} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <span style={{
                flex: 1, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
                letterSpacing: 1, textTransform: 'uppercase', color: 'var(--violet)',
              }}>{fig.name}</span>
              <button onClick={onClose} aria-label="Close conversation" style={{
                background: 'none', border: 'none', color: 'var(--text-sub)', cursor: 'pointer', padding: 4,
              }}>
                <Icon name="close" size={22} />
              </button>
            </div>

            {/* Thread */}
            <div ref={scrollRef} style={{
              flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10,
              padding: 16,
            }}>
              {/* Seed reframe = the opening lens bubble */}
              {bubble({ role: 'lens', content: seedReply, turn_index: -1 }, 'seed')}
              {messages.map((m, i) => bubble(m, m.id ?? i))}
              {pending && (
                <div style={{
                  alignSelf: 'flex-start', fontFamily: 'var(--font-body)', fontSize: 13,
                  color: 'var(--text-sub)', fontStyle: 'italic', padding: '4px 8px',
                }}>{fig.name} is thinking…</div>
              )}
              {error && (
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--pink)',
                  textAlign: 'center', margin: 0,
                }}>{error}</p>
              )}
            </div>

            {/* Composer OR closed footer */}
            {closed ? (
              <div style={{
                padding: '16px', borderTop: '1px solid var(--input-divider)',
                fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.4px',
                color: 'var(--text-sub)', textAlign: 'center',
              }}>
                This conversation has found its close. The shift is yours to carry.
              </div>
            ) : (
              <div style={{
                display: 'flex', gap: 8, alignItems: 'flex-end',
                padding: '12px 16px', borderTop: '1px solid var(--input-divider)',
              }}>
                <textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
                  }}
                  placeholder={`Say something to ${fig.name}…`}
                  rows={1}
                  disabled={pending}
                  style={{
                    flex: 1, resize: 'none', maxHeight: 120,
                    background: 'var(--input-bg)', color: 'var(--text-body)',
                    border: '1px solid var(--input-divider)', borderRadius: 10,
                    padding: '10px 12px', fontFamily: 'var(--font-body)', fontSize: 14,
                    lineHeight: '20px', outline: 'none',
                  }}
                />
                <button
                  onClick={send}
                  disabled={pending || !draft.trim()}
                  aria-label="Send message"
                  style={{
                    flexShrink: 0, width: 44, height: 44, borderRadius: 10,
                    background: 'var(--green)', color: 'var(--bg)', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: pending || !draft.trim() ? 'not-allowed' : 'pointer',
                    opacity: pending || !draft.trim() ? 0.5 : 1,
                  }}
                >
                  <Icon name="arrow_upward" size={22} />
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
