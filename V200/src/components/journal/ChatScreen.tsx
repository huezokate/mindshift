'use client'
// Chat with the Lens — full-screen conversation (T-020-02).
//
// A dedicated screen (not a popup): the original vent and the lens's first reframe
// open the thread as real chat bubbles, the composer is pinned at the bottom, and
// the conversation continues from there. Bounded + arc-shaped — the lens closes
// gracefully around ~5 exchanges (Approach B) and never past 20 user messages.
//
// STYLING: uses ONLY the structural token families (--card-*, --input-*, --btn-*,
// --text-*) — never the raw --cyan/--pink/--green accent slots, which collapse to
// one magenta in kawaii (the exact bug this screen was corrected for). So it reads
// correctly in cyberpunk, kawaii, and notepad.
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { FIGURES, portraitFor } from '@/lib/figures'
import { useTheme } from '@/lib/theme'
import Icon from '@/components/ui/Icon'
import { sendChatTurn, loadAnonThread, saveAnonThread } from '@/lib/chat-client'
import type { ChatMessage } from '@/lib/chat-types'

const MAX_MSG_CHARS = 800 // matches the vent input cap

type Props = {
  figureId: string
  sessionId: string | null // null for anon / unsaved
  ventText: string
  seedReply: string // the lens's first reframe (opens the thread as a lens bubble)
}

export default function ChatScreen({ figureId, sessionId, ventText, seedReply }: Props) {
  const router = useRouter()
  const { theme } = useTheme()
  const { isSignedIn, isLoaded } = useUser()
  const fig = FIGURES.find(f => f.id === figureId)
  const portrait = fig ? portraitFor(fig, theme) : null

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [closed, setClosed] = useState(false)
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)

  // Load the follow-up thread: signed-in → persisted history route; anon →
  // ephemeral sessionStorage. The vent + seed reframe are rendered separately as
  // the two opening bubbles, so they're never part of `messages`. Wait for Clerk
  // (isLoaded) so a signed-in user doesn't briefly hit the anon path.
  useEffect(() => {
    if (!isLoaded) return
    let cancelled = false
    const apply = (msgs: ChatMessage[], isClosed: boolean) => {
      if (cancelled) return
      setMessages(msgs)
      setClosed(isClosed)
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
  }, [isLoaded, isSignedIn, sessionId, figureId])

  // Keep pinned to the latest message / typing indicator.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, pending])

  // Focus the composer on mount so the user can type immediately.
  useEffect(() => {
    if (closed) return
    const t = setTimeout(() => taRef.current?.focus(), 120)
    return () => clearTimeout(t)
  }, [closed])

  function autoGrow() {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`
  }

  async function send() {
    const text = draft.trim()
    if (!text || pending || closed || !isLoaded) return
    setError(null)
    setPending(true)
    const userMsg: ChatMessage = { role: 'user', content: text, turn_index: messages.length }
    const history = messages
    setMessages(prev => [...prev, userMsg])
    setDraft('')
    if (taRef.current) taRef.current.style.height = 'auto'
    try {
      const { reply, done } = await sendChatTurn({
        // Always send the session id — the server decides persistence from auth.
        sessionId, figureId, ventText, seedReply, userMessage: text, history,
      })
      const lensMsg: ChatMessage = { role: 'lens', content: reply, turn_index: messages.length + 1, done }
      setMessages(prev => {
        const next = [...prev, lensMsg]
        if (!isSignedIn) saveAnonThread(figureId, next)
        return next
      })
      if (done) setClosed(true)
    } catch (err) {
      setMessages(prev => prev.filter(m => m !== userMsg))
      setDraft(text)
      setError(err instanceof Error ? err.message : 'The lens could not respond.')
    } finally {
      setPending(false)
    }
  }

  const avatar = (size: number) => (
    <div style={{
      width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
      border: 'var(--fig-avatar-border)', background: 'var(--fig-avatar-grad)',
    }}>
      {portrait && <img src={portrait} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
    </div>
  )

  // Bubbles use structural tokens only (theme-safe). Outgoing = the secondary
  // surface; incoming = the card surface; both carry the divider border + body text.
  const bubble = (m: ChatMessage, key: string | number) => {
    const mine = m.role === 'user'
    return (
      <div key={key} style={{
        display: 'flex', gap: 8, alignItems: 'flex-end',
        flexDirection: mine ? 'row-reverse' : 'row',
      }}>
        {!mine && avatar(30)}
        <div style={{
          maxWidth: '76%',
          background: mine ? 'var(--btn-secondary-bg)' : 'var(--card-bg)',
          border: '1px solid var(--input-divider)',
          borderRadius: 'var(--input-radius)',
          padding: '10px 14px',
          fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px',
          letterSpacing: '0.2px', color: 'var(--text-body)',
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}>
          {m.content}
        </div>
      </div>
    )
  }

  const typingDots = (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
      {avatar(30)}
      <div style={{
        background: 'var(--card-bg)', border: '1px solid var(--input-divider)',
        borderRadius: 'var(--input-radius)', padding: '12px 16px', display: 'inline-flex', gap: 4,
      }}>
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-sub)' }}
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
          />
        ))}
      </div>
    </div>
  )

  if (!fig) return null

  return (
    <div className="flex flex-col" style={{ height: '100dvh', background: 'var(--bg)' }}>
      {/* Header: back + figure */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
        padding: '12px 16px', borderBottom: '1px solid var(--input-divider)',
      }}>
        <button
          onClick={() => router.back()}
          aria-label="Back"
          style={{ background: 'none', border: 'none', color: 'var(--text-body)', cursor: 'pointer', padding: 4, display: 'flex' }}
        >
          <Icon name="arrow_back" size={24} />
        </button>
        {avatar(34)}
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
            letterSpacing: 1, textTransform: 'uppercase', color: 'var(--violet)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{fig.name}</span>
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.6px',
            textTransform: 'uppercase', color: 'var(--text-sub)',
          }}>{fig.era}</span>
        </div>
      </div>

      {/* Thread — vent + seed reframe open it, then the follow-up turns */}
      <div ref={scrollRef} style={{
        flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12,
        padding: 16,
      }}>
        {bubble({ role: 'user', content: ventText, turn_index: -2 }, 'vent')}
        {bubble({ role: 'lens', content: seedReply, turn_index: -1 }, 'seed')}
        {messages.map((m, i) => bubble(m, m.id ?? i))}
        {pending && typingDots}
        {error && (
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--btn-secondary-color)',
            textAlign: 'center', margin: 0,
          }}>{error}</p>
        )}
      </div>

      {/* Composer OR closed footer */}
      {closed ? (
        <div style={{
          flexShrink: 0, padding: 16, borderTop: '1px solid var(--input-divider)',
          fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.4px',
          color: 'var(--text-sub)', textAlign: 'center',
        }}>
          This conversation has found its close. The shift is yours to carry.
        </div>
      ) : (
        <div style={{
          display: 'flex', gap: 8, alignItems: 'flex-end', flexShrink: 0,
          padding: '12px 16px', borderTop: '1px solid var(--input-divider)',
        }}>
          <textarea
            ref={taRef}
            value={draft}
            onChange={e => { setDraft(e.target.value); autoGrow() }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault(); send()
              }
            }}
            placeholder={`Say something to ${fig.name}…`}
            rows={1}
            maxLength={MAX_MSG_CHARS}
            disabled={pending}
            style={{
              flex: 1, resize: 'none', maxHeight: 120, overflowY: 'auto',
              background: 'var(--input-bg)', color: 'var(--text-body)',
              border: '1px solid var(--input-divider)', borderRadius: 'var(--input-radius)',
              padding: '10px 14px', fontFamily: 'var(--font-body)', fontSize: 14,
              lineHeight: '20px', outline: 'none',
            }}
          />
          <button
            onClick={send}
            disabled={pending || !draft.trim() || !isLoaded}
            aria-label="Send message"
            style={{
              flexShrink: 0, width: 46, height: 46,
              background: 'var(--btn-bg)', color: 'var(--btn-color)',
              borderTop: 'var(--btn-bt)', borderLeft: 'var(--btn-bl)',
              borderRight: 'var(--btn-br)', borderBottom: 'var(--btn-bb)',
              borderRadius: 'var(--btn-radius)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: pending || !draft.trim() ? 'not-allowed' : 'pointer',
              opacity: pending || !draft.trim() ? 0.5 : 1,
            }}
          >
            <Icon name="arrow_upward" size={22} />
          </button>
        </div>
      )}
    </div>
  )
}
