'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useAnimationControls } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { FIGURES, getFigureImg } from '@/lib/figures'
import { getVentLabel } from '@/lib/vent-label'
import { useTheme } from '@/lib/theme'
import Icon from '@/components/ui/Icon'
import AppHeader from '@/components/nav/AppHeader'
import ShareSheet from '@/components/journal/ShareSheet'

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
  const [prevResponse, setPrevResponse] = useState('')
  const [shareOpen, setShareOpen] = useState(false)
  // True only when this is a real vent (loaded from sessionStorage), not the
  // demo fallback — gates auto-save so we never persist the placeholder.
  const [loadedReal, setLoadedReal] = useState(false)
  const saveControls = useAnimationControls()

  useEffect(() => {
    const figureId = sessionStorage.getItem('ms_figure_id')
    const resp = sessionStorage.getItem('ms_response') ?? ''
    const ventText = sessionStorage.getItem('ms_vent') ?? ''
    const found = figureId ? FIGURES.find(f => f.id === figureId) : null
    // hydration-safe: defer client-only sessionStorage reads past first paint so
    // SSR + first client render match the demo fallbacks (no hydration mismatch).
    /* eslint-disable react-hooks/set-state-in-effect */
    if (found) setFigure(found)
    if (ventText) setVent(ventText)
    if (resp) setLoadedReal(true)
    setResponse(resp || DEMO_RESPONSE)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  // Reset the typewriter when the response changes — done during render (not in
  // the effect) so the old text never flashes and there's no cascading render.
  if (response && response !== prevResponse) {
    setPrevResponse(response)
    setDisplayed('')
    setDone(false)
  }

  useEffect(() => {
    if (!response) return
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(response.slice(0, i))
      if (i >= response.length) { clearInterval(interval); setDone(true) }
    }, 18)
    return () => clearInterval(interval)
  }, [response])

  const avatarSrc = getFigureImg(figure, theme)

  // Core persist — upserts the vent session + this lens. Appends to the existing
  // session (ms_session_id) so every lens applied to the same vent lands in one
  // entry. Returns the saved sessionId, or null on failure.
  async function persist(): Promise<string | null> {
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
      return data.sessionId
    } catch {
      return null
    }
  }

  // Signed-in users journal automatically (T-018-05): once the response finishes
  // typing, silently save the vent + this lens. No button, no navigation — the
  // entry just appears in their journal. Re-runs per lens via saveState gating.
  useEffect(() => {
    if (isSignedIn !== true || !done || !loadedReal || saveState !== 'idle') return
    let alive = true
    // Optimistic in-flight status before the async persist below (also acts as
    // the re-entry guard via the saveState !== 'idle' check above).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaveState('saving')
    persist().then(id => {
      if (!alive) return
      setSaveState(id ? 'saved' : 'error')
    })
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, done, loadedReal])

  // Explicit Save — anon only (signed-in auto-saves above). Anon can't journal
  // without an account, so route to sign-in and return to the response after.
  async function handleSave() {
    if (!isSignedIn) {
      router.push('/sign-in?reason=save&redirect_url=' + encodeURIComponent('/app/response'))
      return
    }
    if (saveState === 'saving' || saveState === 'saved') return
    setSaveState('saving')
    const id = await persist()
    if (!id) { setSaveState('error'); return }
    setSaveState('saved')
    await saveControls.start({
      scale: [1, 1.3, 0.92, 1],
      transition: { duration: 0.42, times: [0, 0.4, 0.7, 1], ease: 'easeOut' },
    })
    router.push(`/app/journal-v2/${id}`)
  }

  // Open the same rich quote-card sheet used in the journal — generated from the
  // content, so the card looks identical whether or not the entry is saved yet.
  function handleShare() {
    setShareOpen(true)
  }

  // Chat with this lens straight from the response (the journal chat screen
  // needs a saved session, so persist first if auto-save hasn't landed yet).
  // Anon: chat lives in the journal — sign in, then return here.
  async function handleChat() {
    if (!isSignedIn) {
      router.push('/sign-in?reason=chat&redirect_url=' + encodeURIComponent('/app/response'))
      return
    }
    const id = sessionStorage.getItem('ms_session_id') ?? await persist()
    if (!id) { setSaveState('error'); return }
    router.push(`/app/journal-v2/${id}/chat/${figure.id}`)
  }

  // Labelled, bordered accent pills matching the Button Secondary component
  // (Figma 414:5353) + the lens-card button-row idiom: asymmetric 1/2px border,
  // 2px radius, a faint accent-tinted fill (color-mix off the accent slot so all
  // three themes follow for free), ≥44px tap target. `accent` is a token name:
  // --cyan (SAVE) / --green (ANOTHER LENS) / --violet (CHAT) / --pink (SHARE).
  function pillStyle(accent: string): React.CSSProperties {
    // Kawaii renders the canonical design-system Secondary button (Figma 626:8286):
    // a SOLID fill + brown asymmetric border + inset accent shadow + 32px radius —
    // not the faint accent-tint pill below, which reads washed-out on kawaii's pink
    // page bg. Kawaii only ships two secondary fills, so map each accent slot to the
    // matching family: the teal/mint accent (--green) → "secondary" (mint #e5fcfa /
    // teal inset), the pink accents (--cyan/--pink) → "secondary2" (pink #ffe1ff /
    // magenta inset). All values come from the --btn-secondary* / --btn-secondary2*
    // token families — no hardcoded hex.
    if (theme === 'kawaii') {
      const fam = accent === '--green' ? 'secondary' : 'secondary2'
      return {
        flex: 1,
        minWidth: 130,
        minHeight: 44,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        fontFamily: 'var(--font-btn)', fontWeight: 600, fontSize: 13,
        letterSpacing: 0.2, textTransform: 'uppercase',
        color: `var(--btn-${fam}-color)`,
        background: `var(--btn-${fam}-bg)`,
        borderTop: `var(--btn-${fam}-bt)`,
        borderLeft: `var(--btn-${fam}-bl)`,
        borderRight: `var(--btn-${fam}-br)`,
        borderBottom: `var(--btn-${fam}-bb)`,
        borderRadius: `var(--btn-${fam}-radius)`,
        boxShadow: `var(--btn-${fam}-shadow)`,
        padding: '8px 12px',
        cursor: 'pointer',
        transition: 'opacity 0.15s',
      }
    }
    const c = `var(${accent})`
    return {
      flex: 1,
      minWidth: 130,
      minHeight: 44,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      fontFamily: 'var(--font-btn)', fontWeight: 600, fontSize: 13,
      letterSpacing: 'var(--btn-letter-spacing, 1px)', textTransform: 'uppercase',
      color: c,
      background: `color-mix(in srgb, ${c} 12%, transparent)`,
      borderTop: `1px solid ${c}`,
      borderLeft: `1px solid ${c}`,
      borderRight: `2px solid ${c}`,
      borderBottom: `2px solid ${c}`,
      borderRadius: 'var(--btn-secondary-radius, 2px)',
      padding: '8px 12px',
      cursor: 'pointer',
      transition: 'opacity 0.15s',
    }
  }

  return (
    <div className="min-h-dvh flex flex-col">

      {/* Top nav — header dropdown replaces the old footer (FigJam 95:2228) */}
      <AppHeader />

      {/* Scrollable content */}
      <div
        // page-column centers for real — the old mx-auto/max-w-[…] utilities are
        // not generated in this setup, which left the grid hugging the left edge
        // on desktop (responsive audit, Kate 2026-07-11).
        className="flex flex-col gap-4 w-full flex-1 page-column page-column--wide lg:grid lg:grid-cols-[2fr_3fr] lg:gap-x-6 lg:gap-y-4 lg:items-start"
        style={{ padding: '24px 24px 32px' }}
      >

        {/* 1 — User quote + ANOTHER LENS grouped in one column div (Kate
            2026-07-12): the re-roll action belongs with the vent, the
            save/chat/share actions with the response — all breakpoints. */}
        <div className="flex flex-col gap-2 w-full lg:col-start-1 lg:row-start-1">
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
              {getVentLabel(vent)}
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

        {/* ANOTHER LENS — re-pick a lens for the same vent (vent persists in
            sessionStorage). flex:none so it doesn't grow in the column. */}
        {done && (
          <motion.button
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => router.push('/app/lens')}
            className="uppercase hover:opacity-80"
            title="Try another lens"
            style={{ ...pillStyle('--green'), flex: 'none' }}
          >
            <Icon name="autorenew" size={18} />
            Another lens
          </motion.button>
        )}
        </div>

        {/* 2 — Lens response card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="flex flex-col w-full overflow-hidden lg:col-start-2 lg:row-start-1"
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

        {/* 3 — Action pills (Button Secondary idiom, Figma 414:5353):
            SAVE (cyan) · CHAT (violet) · SHARE (pink), grouped under the lens
            response card on every breakpoint (ANOTHER LENS lives with the vent
            above). flex-wrap + the pills' min-width folds them on phones. */}
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 w-full lg:col-start-2 lg:row-start-2 lg:self-start"
          >
            {/* Save: anon taps to save (routes to sign-in). Signed-in auto-saves
                (T-018-05) — show a non-interactive status pill instead. */}
            {isSignedIn === true ? (
              <div
                role={saveState === 'error' ? 'button' : undefined}
                onClick={saveState === 'error' ? () => {
                  setSaveState('saving')
                  persist().then(id => setSaveState(id ? 'saved' : 'error'))
                } : undefined}
                className="uppercase"
                title={saveState === 'error' ? 'Save failed — tap to retry' : 'Saved to your journal'}
                style={{
                  ...pillStyle('--cyan'),
                  cursor: saveState === 'error' ? 'pointer' : 'default',
                  opacity: saveState === 'saving' ? 0.6 : 1,
                }}
              >
                <Icon name={saveState === 'saved' ? 'bookmark_added' : 'bookmark'} size={18} />
                {saveState === 'saved' ? 'Saved' : saveState === 'error' ? 'Retry' : 'Saving…'}
              </div>
            ) : (
              <motion.button
                onClick={handleSave}
                animate={saveControls}
                whileTap={{ scale: 0.95 }}
                className="uppercase hover:opacity-80"
                title="Save to journal"
                style={pillStyle('--cyan')}
              >
                <Icon name="bookmark" size={18} />
                Save
              </motion.button>
            )}
            {/* Chat — continue with this figure on the journal chat screen */}
            <button
              onClick={handleChat}
              className="uppercase hover:opacity-80"
              title={`Chat with ${figure.name}`}
              style={pillStyle('--violet')}
            >
              <Icon name="comic_bubble" size={18} />
              Chat
            </button>
            {/* Share via native share sheet (SMS, socials) */}
            <button
              onClick={handleShare}
              className="uppercase hover:opacity-80"
              title="Share"
              style={pillStyle('--pink')}
            >
              <Icon name="ios_share" size={18} />
              Share
            </button>
          </motion.div>
        )}

        {saveState === 'error' && (
          <p className="lg:col-start-2 lg:row-start-3" style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--pink)', textAlign: 'center' }}>
            Could not save. Please try again.
          </p>
        )}

      </div>

      {shareOpen && (
        <ShareSheet
          figureId={figure.id}
          responseText={response}
          ventText={vent}
          isEntryPublic={false}
          onClose={() => setShareOpen(false)}
          onShared={() => {}}
        />
      )}

    </div>
  )
}
