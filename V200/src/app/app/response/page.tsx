'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { FIGURES, getFigureImg } from '@/lib/figures'
import { useTheme } from '@/lib/theme'

const MAX_CHARS = 800
const DEMO_FIGURE = FIGURES[0]
const DEMO_VENT =
  "I keep second-guessing my career choice. Everyone around me seems so sure about what they're doing, but I'm constantly wondering if I chose the right path."
const DEMO_RESPONSE =
  'The unexamined life is not worth living — and you, my friend, are doing the examining. Every doubt you feel is a sign of an active mind. Most who seem certain have simply stopped asking questions. Your hesitation is not weakness; it is wisdom in its earliest form.'

function IconBookmark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
    </svg>
  )
}
function IconShare() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}
function IconPalette() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="6.5" cy="12.5" r="1" fill="currentColor" stroke="none" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.477-1.125-.29-.289-.47-.684-.47-1.125a1.64 1.64 0 011.648-1.688h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  )
}
function IconRefresh() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
    </svg>
  )
}
function IconNote() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
    </svg>
  )
}
function IconChat() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  )
}
function IconCamera() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

export default function ResponsePage() {
  const router = useRouter()
  const { theme } = useTheme()
  const { isSignedIn } = useUser()
  const [figure, setFigure] = useState(DEMO_FIGURE)
  const [vent, setVent] = useState(DEMO_VENT)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [response, setResponse] = useState('')
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    const figureId = sessionStorage.getItem('ms_figure_id')
    const resp = sessionStorage.getItem('ms_response') ?? ''
    const ventText = sessionStorage.getItem('ms_vent') ?? ''
    const found = figureId ? FIGURES.find(f => f.id === figureId) : null
    if (found) setFigure(found)
    if (ventText) setVent(ventText)
    setResponse(resp || DEMO_RESPONSE)
  }, [])

  useEffect(() => {
    if (!response) return
    setDisplayed('')
    setDone(false)
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(response.slice(0, i))
      if (i >= response.length) { clearInterval(interval); setDone(true) }
    }, 18)
    return () => clearInterval(interval)
  }, [response])

  const avatarSrc = getFigureImg(figure, theme)

  async function handleSave() {
    if (!isSignedIn) {
      router.push('/sign-in?reason=save&redirect_url=' + encodeURIComponent('/app/response'))
      return
    }
    if (saveState === 'saving' || saveState === 'saved') return
    setSaveState('saving')
    try {
      const existingSessionId = sessionStorage.getItem('ms_session_id')
      const res = await fetch('/api/save-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(existingSessionId ? { sessionId: existingSessionId } : {}),
          ventText: vent,
          figureId: figure.id,
          responseText: response,
          theme,
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      sessionStorage.setItem('ms_session_id', data.sessionId)
      setSaveState('saved')
    } catch {
      setSaveState('error')
    }
  }

  async function handleShare() {
    const text = `${figure.name}: "${response}"`
    if (navigator.share) {
      await navigator.share({ text })
    } else {
      await navigator.clipboard.writeText(text)
    }
  }

  function handleNew() {
    sessionStorage.removeItem('ms_session_id')
    router.push('/app/vent')
  }

  const iconBtn = (active = false): React.CSSProperties => ({
    width: 54, height: 54, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: '50%',
    background: active ? 'var(--cyan)' : 'var(--btn-bg)',
    borderTop: 'var(--btn-bt)',
    borderLeft: 'var(--btn-bl)',
    borderRight: 'var(--btn-br)',
    borderBottom: 'var(--btn-bb)',
    boxShadow: 'var(--btn-shadow)',
    color: active ? 'var(--bg)' : 'var(--btn-color)',
    cursor: 'pointer',
    transition: 'background 0.15s, color 0.15s',
  })

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* Scrollable content */}
      <div
        className="flex flex-col gap-4 w-full mx-auto flex-1"
        style={{ maxWidth: 440, padding: '24px 24px 100px' }}
      >

        {/* 1 — User quote */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col w-full overflow-hidden"
          style={{
            borderTop: 'var(--input-bt)',
            borderLeft: 'var(--input-bl)',
            borderRight: 'var(--input-br)',
            borderBottom: 'var(--input-bb)',
            borderRadius: 'var(--input-radius)',
            boxShadow: 'var(--input-shadow, var(--card-shadow))',
            filter: 'var(--card-filter, none)',
          }}
        >
          <div
            className="flex items-center justify-center"
            style={{ background: 'var(--input-header-bg)', padding: '8px 16px', borderBottom: '1px solid var(--input-divider)' }}
          >
            <p className="uppercase text-center" style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 11, letterSpacing: 0.8, lineHeight: '14px', color: 'var(--text-body)' }}>
              Dump it all here:
            </p>
          </div>
          <div style={{ background: 'var(--input-bg)', padding: '12px 16px' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, letterSpacing: 0.5, lineHeight: '20px', color: 'var(--text-body)' }}>
              {vent}
            </p>
          </div>
          <div className="flex justify-end" style={{ background: 'var(--input-bg)', borderTop: '1px solid var(--input-divider)', padding: '4px 12px' }}>
            <p className="uppercase" style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: 1, lineHeight: '12px', color: 'var(--text-sub)' }}>
              {vent.length}/{MAX_CHARS} characters
            </p>
          </div>
        </motion.div>

        {/* 2 — Brand bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.08 }}
          className="flex items-center justify-between w-full px-1"
        >
          <p className="uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: 1.5, lineHeight: '22px', color: 'var(--violet)' }}>
            Mindshift
          </p>
          <span style={{ color: 'var(--text-sub)' }}>
            <IconCamera />
          </span>
          <p className="uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: 1.5, lineHeight: '22px', color: 'var(--cyan)' }}>
            Mindshift
          </p>
        </motion.div>

        {/* 3 — Lens response card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="flex flex-col w-full overflow-hidden"
          style={{
            borderTop: 'var(--input-bt)',
            borderLeft: 'var(--input-bl)',
            borderRight: 'var(--input-br)',
            borderBottom: 'var(--input-bb)',
            borderRadius: 'var(--input-radius)',
            boxShadow: 'var(--input-shadow, var(--card-shadow))',
            filter: 'var(--card-filter, none)',
          }}
        >
          {/* Header: avatar + name */}
          <div
            className="flex items-center gap-3"
            style={{ background: 'var(--fig-bg)', padding: '8px 16px 6px', borderBottom: '1px solid var(--input-divider)' }}
          >
            <div
              className="flex-shrink-0 overflow-hidden"
              style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--fig-avatar-grad)',
                border: 'var(--fig-avatar-border)',
                boxShadow: 'var(--fig-avatar-shadow)',
              }}
            >
              <img src={avatarSrc} alt={figure.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', display: 'block' }} />
            </div>
            <p className="uppercase" style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12, letterSpacing: 0.8, lineHeight: '14px', color: 'var(--text-body)' }}>
              {figure.name}
            </p>
          </div>

          {/* Body: quote + AI response */}
          <div className="flex flex-col gap-4" style={{ background: 'var(--input-bg)', padding: '16px 16px' }}>
            <p className="text-center" style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px', letterSpacing: 0.5, color: 'var(--violet)', fontStyle: 'italic' }}>
              &ldquo;{figure.quote}&rdquo;
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, letterSpacing: 0.5, lineHeight: '22px', color: 'var(--text-body)' }}>
              {displayed}
              {!done && (
                <span
                  className="inline-block w-[1px] h-[14px] ml-[2px] align-middle"
                  style={{ background: 'var(--cyan)', animation: 'glow-pulse 0.8s steps(1) infinite' }}
                />
              )}
            </p>
          </div>
        </motion.div>

        {/* 4 — Quick action icons */}
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 justify-end w-full"
          >
            {/* Save to journal */}
            <button onClick={handleSave} title={saveState === 'saved' ? 'Saved!' : 'Save to journal'} style={iconBtn(saveState === 'saved')}>
              <IconBookmark />
            </button>
            {/* Decorate — stickers coming soon, disabled */}
            <button
              disabled
              title="Decorate (coming soon)"
              style={{ ...iconBtn(), opacity: 0.3, cursor: 'not-allowed' }}
            >
              <IconPalette />
            </button>
            {/* Share via native share sheet (SMS, socials) */}
            <button onClick={handleShare} title="Share" style={iconBtn()}>
              <IconShare />
            </button>
          </motion.div>
        )}

        {saveState === 'error' && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--pink)', textAlign: 'center' }}>
            Could not save. Please try again.
          </p>
        )}

      </div>

      {/* 5 — Footer action bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20 flex gap-1"
        style={{ padding: '4px', background: 'var(--bg)' }}
      >
        <button
          onClick={() => router.push('/app/lens')}
          className="flex-1 flex items-center justify-center gap-2 uppercase"
          style={{
            fontFamily: 'var(--font-btn)', fontWeight: 600, fontSize: 13,
            letterSpacing: 'var(--btn-letter-spacing, 2px)',
            color: 'var(--btn-secondary-color, var(--text-body))',
            background: 'var(--btn-secondary-bg)',
            borderTop: 'var(--btn-bt)', borderLeft: 'var(--btn-bl)',
            borderRight: 'var(--btn-br)', borderBottom: 'var(--btn-bb)',
            borderRadius: 'var(--btn-radius)', padding: '12px 8px',
            boxShadow: 'var(--btn-secondary-shadow)', cursor: 'pointer',
          }}
        >
          <IconRefresh />
          Try another
        </button>

        <button
          onClick={handleNew}
          className="flex items-center justify-center gap-2 uppercase"
          style={{
            flexShrink: 0,
            fontFamily: 'var(--font-btn)', fontWeight: 600, fontSize: 13,
            letterSpacing: 'var(--btn-letter-spacing, 2px)',
            color: 'var(--btn-color)',
            background: 'var(--btn-bg)',
            borderTop: 'var(--btn-bt)', borderLeft: 'var(--btn-bl)',
            borderRight: 'var(--btn-br)', borderBottom: 'var(--btn-bb)',
            borderRadius: 'var(--btn-radius)', padding: '12px 16px',
            boxShadow: 'var(--btn-shadow)', cursor: 'pointer',
          }}
        >
          <IconNote />
          New
        </button>

        <button
          onClick={() => router.push('/app/journal')}
          className="flex-1 flex items-center justify-center gap-2 uppercase"
          style={{
            fontFamily: 'var(--font-btn)', fontWeight: 600, fontSize: 13,
            letterSpacing: 'var(--btn-letter-spacing, 2px)',
            color: 'var(--btn-secondary-color, var(--text-body))',
            background: 'var(--btn-secondary-bg)',
            borderTop: 'var(--btn-bt)', borderLeft: 'var(--btn-bl)',
            borderRight: 'var(--btn-br)', borderBottom: 'var(--btn-bb)',
            borderRadius: 'var(--btn-radius)', padding: '12px 8px',
            boxShadow: 'var(--btn-secondary-shadow)', cursor: 'pointer',
          }}
        >
          <IconChat />
          Converse
        </button>
      </div>

    </div>
  )
}
