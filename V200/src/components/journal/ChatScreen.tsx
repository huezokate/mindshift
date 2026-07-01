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
import { Fragment, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { FIGURES, portraitFor } from '@/lib/figures'
import { useTheme } from '@/lib/theme'
import Icon from '@/components/ui/Icon'
import { sendChatTurn, loadAnonThread, saveAnonThread } from '@/lib/chat-client'
import { CHAT_HARD_CAP, type ChatMessage } from '@/lib/chat-types'

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
  // `locked` removes the composer — set ONLY by the hard cap (a safety rail). A
  // model-signaled soft close is a resting point (per-message `done`), not a lock.
  const [locked, setLocked] = useState(false)
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
    const apply = (msgs: ChatMessage[], isLocked: boolean) => {
      if (cancelled) return
      setMessages(msgs)
      setLocked(isLocked)
    }
    if (isSignedIn && sessionId) {
      fetch(`/api/chat-with-lens/history?sessionId=${sessionId}&figureId=${figureId}`)
        .then(r => (r.ok ? r.json() : { messages: [], locked: false }))
        .then(d => apply(d.messages ?? [], !!d.locked))
        .catch(() => apply([], false))
    } else {
      // Anon locks only at the hard cap too — a soft close keeps the input alive.
      const anon = loadAnonThread(figureId)
      const anonUserTurns = anon.filter(m => m.role === 'user').length
      Promise.resolve().then(() => apply(anon, anonUserTurns >= CHAT_HARD_CAP))
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
    if (locked) return
    const t = setTimeout(() => taRef.current?.focus(), 120)
    return () => clearTimeout(t)
  }, [locked])

  function autoGrow() {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`
  }

  async function send() {
    const text = draft.trim()
    if (!text || pending || locked || !isLoaded) return
    setError(null)
    setPending(true)
    const userMsg: ChatMessage = { role: 'user', content: text, turn_index: messages.length }
    const history = messages
    setMessages(prev => [...prev, userMsg])
    setDraft('')
    if (taRef.current) taRef.current.style.height = 'auto'
    try {
      const { reply, done, capped } = await sendChatTurn({
        // Always send the session id — the server decides persistence from auth.
        sessionId, figureId, ventText, seedReply, userMessage: text, history,
      })
      const lensMsg: ChatMessage = { role: 'lens', content: reply, turn_index: messages.length + 1, done }
      setMessages(prev => {
        const next = [...prev, lensMsg]
        if (!isSignedIn) saveAnonThread(figureId, next)
        return next
      })
      // A soft close (`done`) is a resting point — the composer stays. Only the
      // hard cap (`capped`) locks the thread.
      if (capped) setLocked(true)
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

  // Soft-close marker: a subtle in-thread wind-down after the lens offers its
  // closing thought. Purely tonal — it does NOT remove the composer. Structural
  // tokens only, so it reads correctly across all three themes.
  const softCloseDivider = (key: string | number) => (
    <div key={key} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      padding: '4px 8px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
        <span style={{ flex: 1, height: 1, background: 'var(--input-divider)' }} />
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.6px',
          textTransform: 'uppercase', color: 'var(--text-sub)', whiteSpace: 'nowrap',
        }}>The shift is yours to carry</span>
        <span style={{ flex: 1, height: 1, background: 'var(--input-divider)' }} />
      </div>
      <span style={{
        fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.2px',
        color: 'var(--text-sub)', opacity: 0.75,
      }}>Sit with this — or keep going.</span>
    </div>
  )

  if (!fig) return null

  const lastMsg = messages[messages.length - 1]
  // "Resting" = the lens has offered a closing thought and we're not capped. The
  // input stays; we just soften the invitation and show an explicit way to leave.
  const resting = !locked && !!lastMsg && lastMsg.role === 'lens' && !!lastMsg.done
  const placeholder = resting ? 'Still here if you need more…' : `Say something to ${fig.name}…`

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
        {messages.map((m, i) => (
          <Fragment key={m.id ?? i}>
            {bubble(m, m.id ?? i)}
            {/* A resting-point divider follows any lens message that soft-closed,
                unless the cap already turned this into the final locked footer. */}
            {m.role === 'lens' && m.done && !(locked && i === messages.length - 1) &&
              softCloseDivider(`sc-${m.id ?? i}`)}
          </Fragment>
        ))}
        {pending && typingDots}
        {error && (
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--btn-secondary-color)',
            textAlign: 'center', margin: 0,
          }}>{error}</p>
        )}
      </div>

      {/* Locked footer (hard cap only) OR the always-available composer. A soft
          close never lands here — it keeps the composer and adds the resting rail. */}
      {locked ? (
        <div style={{
          flexShrink: 0, padding: 16, borderTop: '1px solid var(--input-divider)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        }}>
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.4px',
            color: 'var(--text-sub)', textAlign: 'center',
          }}>
            This conversation has found its close. The shift is yours to carry.
          </span>
          <button
            onClick={() => router.back()}
            style={{
              background: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-color)',
              border: '1px solid var(--input-divider)', borderRadius: 'var(--btn-radius)',
              padding: '8px 18px', fontFamily: 'var(--font-body)', fontSize: 13,
              letterSpacing: '0.3px', cursor: 'pointer',
            }}
          >
            Return to journal
          </button>
        </div>
      ) : (
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0,
          padding: '12px 16px', borderTop: '1px solid var(--input-divider)',
        }}>
          {/* Resting rail: an explicit, user-initiated way to leave once the lens
              has offered its closing thought. Optional — the input stays live. */}
          {resting && (
            <button
              onClick={() => router.back()}
              style={{
                alignSelf: 'center', background: 'none', border: 'none',
                color: 'var(--text-sub)', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.4px',
                textDecoration: 'underline', textUnderlineOffset: 3, padding: 2,
              }}
            >
              I’m good — carry the shift
            </button>
          )}
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea
              ref={taRef}
              value={draft}
              onChange={e => { setDraft(e.target.value); autoGrow() }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault(); send()
                }
              }}
              placeholder={placeholder}
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
        </div>
      )}
    </div>
  )
}
