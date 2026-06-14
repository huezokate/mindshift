'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useAnimationControls } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { FIGURES, getFigureImg } from '@/lib/figures'
import { useTheme } from '@/lib/theme'
import Icon from '@/components/ui/Icon'
import AppHeader from '@/components/nav/AppHeader'

const MAX_CHARS = 800
const DEMO_FIGURE = FIGURES[0]
const DEMO_VENT =
  "I keep second-guessing my career choice. Everyone around me seems so sure about what they're doing, but I'm constantly wondering if I chose the right path."
const DEMO_RESPONSE =
  'The unexamined life is not worth living — and you, my friend, are doing the examining. Every doubt you feel is a sign of an active mind. Most who seem certain have simply stopped asking questions. Your hesitation is not weakness; it is wisdom in its earliest form.'

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
  const saveControls = useAnimationControls()

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
      // Pop the bookmark, then route to the freshly-saved entry's detail page.
      await saveControls.start({
        scale: [1, 1.3, 0.92, 1],
        transition: { duration: 0.42, times: [0, 0.4, 0.7, 1], ease: 'easeOut' },
      })
      router.push(`/app/journal-v2/${data.sessionId}`)
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

  // Flat, transparent icon buttons matching the journal lens-card button row
  // (LensCard.tsx headerActions) — no pill chrome. Active accent applied inline.
  const actionBtn: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'transparent', border: 'none', padding: 6,
    cursor: 'pointer', color: 'var(--text-muted)',
    transition: 'color 0.15s',
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* Top nav — header dropdown replaces the old footer (FigJam 95:2228) */}
      <AppHeader />

      {/* Scrollable content */}
      <div
        className="flex flex-col gap-4 w-full mx-auto flex-1"
        style={{ maxWidth: 440, padding: '24px 24px 32px' }}
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

        {/* 2 — Lens response card */}
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

        {/* 3 — Quick action icons (lens-card button-row idiom) */}
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-1 justify-end w-full"
          >
            {/* Save to journal */}
            <motion.button
              onClick={handleSave}
              animate={saveControls}
              whileTap={{ scale: 0.95 }}
              title={saveState === 'saved' ? 'Saved!' : 'Save to journal'}
              style={{ ...actionBtn, color: saveState === 'saved' ? 'var(--cyan)' : 'var(--text-muted)' }}
            >
              <Icon name="bookmark" size={20} />
            </motion.button>
            {/* Decorate — stickers coming soon, disabled */}
            <button
              disabled
              title="Decorate (coming soon)"
              style={{ ...actionBtn, opacity: 0.3, cursor: 'not-allowed' }}
            >
              <Icon name="palette" size={20} />
            </button>
            {/* Share via native share sheet (SMS, socials) */}
            <button onClick={handleShare} title="Share" style={actionBtn}>
              <Icon name="ios_share" size={20} />
            </button>
          </motion.div>
        )}

        {saveState === 'error' && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--pink)', textAlign: 'center' }}>
            Could not save. Please try again.
          </p>
        )}

      </div>

    </div>
  )
}
