'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { FIGURES, getFigureImg } from '@/lib/figures'
import { useTheme } from '@/lib/theme'
import Icon from '@/components/ui/Icon'
import CircularArrow from '@/components/ui/CircularArrow'

// Returns 'vents' if daily vent limit hit, 'lenses' if per-vent lens limit hit, null if OK
function checkAnonLimits(ventText: string): 'vents' | 'lenses' | null {
  const today = new Date().toISOString().split('T')[0]
  const storedDate = localStorage.getItem('ms_anon_date')
  const storedVentKey = localStorage.getItem('ms_anon_vent_key')
  const storedLenses = parseInt(localStorage.getItem('ms_anon_vent_lenses') ?? '0')
  const ventKey = ventText.slice(0, 100)

  if (storedDate !== today) return null // new day, reset will happen on track
  if (storedVentKey === ventKey) return storedLenses >= 3 ? 'lenses' : null
  if (storedVentKey) return 'vents' // different vent, same day
  return null // first vent of the day
}

function trackAnonLens(ventText: string) {
  const today = new Date().toISOString().split('T')[0]
  const ventKey = ventText.slice(0, 100)
  const isNewVent = localStorage.getItem('ms_anon_date') !== today || localStorage.getItem('ms_anon_vent_key') !== ventKey
  localStorage.setItem('ms_anon_date', today)
  localStorage.setItem('ms_anon_vent_key', ventKey)
  localStorage.setItem('ms_anon_vent_lenses', isNewVent ? '1' : String(parseInt(localStorage.getItem('ms_anon_vent_lenses') ?? '0') + 1))
}

const MAX_CHARS = 800

const STOP = new Set(['i','a','the','is','it','and','or','but','to','my','me','you','we','they','am','are','was','be','have','has','had','do','does','did','will','would','could','should','of','in','on','at','for','with','by','from','up','out','that','this','an','not','what','so','all','as','just','about','if','there','when','who','which','than','then','into','can','how','more','their','your','its','our','her','his','im','ive','dont','keep','like','very','really','maybe','even','every','some','been','one','see','feel','get','got','know','think','want','need','just','much','also','still','going','make','always','never','something','anything','because','really','around','second'])

const PREFIXES = ['Contemplating', 'Ruminating on', 'Reflecting on']

function getVentLabel(vent: string): string {
  const words = vent.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(w => w.length > 3 && !STOP.has(w))
  const keyword = [...new Set(words)][0]
  if (!keyword) return 'Dump it all here:'
  const prefix = PREFIXES[vent.length % PREFIXES.length]
  return `${prefix} ${keyword}`
}

const DEMO_VENT =
  'I keep second-guessing my career choice. Everyone around me seems so sure about what they\'re doing, but I\'m constantly wondering if I chose the right path. Maybe I need a completely fresh perspective on all of this.'

export default function LensPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const { isSignedIn } = useUser()
  const [vent, setVent] = useState(DEMO_VENT)
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [limitError, setLimitError] = useState<'lenses' | 'vents' | null>(null)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('ms_vent')
    if (stored) setVent(stored)
  }, [])

  async function handleGetPerspective(figureId: string) {
    if (loading) return
    setLimitError(null)

    // Anonymous limit check (client-side)
    if (!isSignedIn) {
      const limitType = checkAnonLimits(vent)
      if (limitType === 'lenses') {
        setLimitError('lenses')
        return
      }
      if (limitType === 'vents') {
        setLimitError('vents')
        return
      }
    }

    setLoading(true)
    setSelected(figureId)
    const figure = FIGURES.find(f => f.id === figureId)!
    sessionStorage.setItem('ms_figure_id', figure.id)
    sessionStorage.setItem('ms_figure_name', figure.name)

    const isNewQuote = !sessionStorage.getItem('ms_session_id')

    try {
      const res = await fetch('/api/generate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: vent, figureId: figure.id, systemPrompt: figure.systemPrompt, isNewQuote }),
      })

      if (res.status === 429) {
        const data = await res.json()
        setLimitError(data.error)
        setLoading(false)
        setSelected(null)
        return
      }

      const data = await res.json()
      sessionStorage.setItem('ms_response', data.response ?? 'No response received.')

      if (!isSignedIn) trackAnonLens(vent)
    } catch {
      sessionStorage.setItem(
        'ms_response',
        `"${vent.slice(0, 60)}..." — ${figure.name} would say: every question worth asking already contains its answer. The fact that you doubt yourself means you're paying attention. Most people who seem certain are simply not looking closely enough.`
      )
    }
    router.push('/app/response')
  }

  const previewing = previewIndex !== null ? FIGURES[previewIndex] : null

  function prevPreview() {
    setPreviewIndex(i => i === null ? null : (i - 1 + FIGURES.length) % FIGURES.length)
  }

  function nextPreview() {
    setPreviewIndex(i => i === null ? null : (i + 1) % FIGURES.length)
  }

  return (
    <div className="min-h-dvh flex flex-col items-center relative" style={{ background: 'var(--bg)' }}>
      <div className="flex flex-col gap-6 w-full" style={{ maxWidth: 440, padding: '40px 24px 32px' }}>

        {/* Vent preview — read-only */}
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
            style={{
              background: 'var(--input-header-bg)',
              padding: '10px 16px',
              borderBottom: '1px solid var(--input-divider)',
            }}
          >
            <p
              className="text-center uppercase"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 11, letterSpacing: 0.8, lineHeight: '14px', color: 'var(--text-body)' }}
            >
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

        {/* Limit error */}
        {limitError && (
          <div
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--pink)',
              borderRadius: 'var(--card-radius)',
              padding: '16px',
            }}
          >
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--pink)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
              {limitError === 'lenses' ? 'Lens limit reached' : 'Daily limit reached'}
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-sub)', lineHeight: '18px', marginBottom: 12 }}>
              {limitError === 'lenses'
                ? 'You\'ve applied 3 lenses to this vent. Create a free account for 5 lenses per vent.'
                : 'You\'ve used your free vent for today. Create a free account for 3 vents per day.'}
            </p>
            <button
              onClick={() => router.push(`/sign-up?reason=${limitError}_limit`)}
              className="w-full uppercase text-center"
              style={{
                fontFamily: 'var(--font-btn)', fontWeight: 600, fontSize: 12,
                letterSpacing: 'var(--btn-letter-spacing, 2px)',
                color: 'var(--btn-color)', background: 'var(--btn-bg)',
                borderTop: 'var(--btn-bt)', borderLeft: 'var(--btn-bl)',
                borderRight: 'var(--btn-br)', borderBottom: 'var(--btn-bb)',
                borderRadius: 'var(--btn-radius)', padding: '10px',
                cursor: 'pointer',
              }}
            >
              Create free account →
            </button>
          </div>
        )}

        {/* Choose label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center uppercase"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12, letterSpacing: 1.3, lineHeight: '14px', color: 'var(--violet)' }}
        >
          Choose:
        </motion.p>

        {/* Figure grid — tap to open detail overlay */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="grid w-full"
          style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}
        >
          {FIGURES.map((fig, i) => {
            const isSelected = selected === fig.id
            return (
              <motion.button
                key={fig.id}
                onClick={() => setPreviewIndex(i)}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 + i * 0.025 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-2 transition-all"
                style={{
                  background: 'var(--fig-bg)',
                  border: isSelected ? 'var(--fig-border-sel)' : 'var(--fig-border)',
                  borderRadius: 'var(--fig-radius)',
                  padding: '10px 8px',
                  boxShadow: isSelected ? 'var(--fig-shadow-sel)' : 'none',
                  cursor: 'pointer',
                }}
              >
                <div
                  className="flex items-center justify-center flex-shrink-0 overflow-hidden"
                  style={{
                    width: 76, height: 76, borderRadius: '50%',
                    background: 'var(--fig-avatar-grad)',
                    border: 'var(--fig-avatar-border)',
                    boxShadow: 'var(--fig-avatar-shadow)',
                  }}
                >
                  <img src={getFigureImg(fig, theme)} alt={fig.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', display: 'block' }} />
                </div>
                <p className="w-full text-center uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10, letterSpacing: 1, lineHeight: '13px', color: isSelected ? 'var(--fig-name-sel)' : 'var(--fig-name-unsel)' }}>
                  {fig.name}
                </p>
                <p className="w-full text-center uppercase" style={{ fontFamily: 'var(--font-body)', fontSize: 8, letterSpacing: 0.6, lineHeight: '11px', color: 'var(--fig-desc)' }}>
                  {fig.descriptor}
                </p>
              </motion.button>
            )
          })}
        </motion.div>

      </div>

      {/* Lens detail overlay */}
      <AnimatePresence>
        {previewing && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)', padding: '24px' }}
            onClick={() => setPreviewIndex(null)}
          >
            {/* Detail card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={previewing.id}
                initial={{ opacity: 0, scale: 0.94, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 8 }}
                transition={{ duration: 0.16 }}
                onClick={e => e.stopPropagation()}
                className="flex flex-col items-center gap-4 w-full"
                style={{
                  maxWidth: 320,
                  background: 'var(--card-bg)',
                  borderTop: 'var(--card-bt)',
                  borderLeft: 'var(--card-bl)',
                  borderRight: 'var(--card-br)',
                  borderBottom: 'var(--card-bb)',
                  borderRadius: 'var(--card-radius)',
                  padding: '28px 20px 20px',
                  boxShadow: 'var(--card-shadow)',
                }}
              >
                {/* Portrait + in-popup nav arrows (shared CircularArrow) */}
                <div className="flex items-center justify-between w-full">
                  <CircularArrow
                    direction="prev"
                    ariaLabel="Previous figure"
                    onClick={e => { e.stopPropagation(); prevPreview() }}
                  />
                  <div
                    className="overflow-hidden flex-shrink-0"
                    style={{
                      width: 120, height: 120, borderRadius: '50%',
                      background: 'var(--fig-avatar-grad)',
                      border: 'var(--fig-avatar-border)',
                      boxShadow: 'var(--fig-avatar-shadow)',
                    }}
                  >
                    <img src={getFigureImg(previewing, theme)} alt={previewing.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', display: 'block' }} />
                  </div>
                  <CircularArrow
                    direction="next"
                    ariaLabel="Next figure"
                    onClick={e => { e.stopPropagation(); nextPreview() }}
                  />
                </div>

                {/* Name */}
                <p className="uppercase text-center" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: 1.5, lineHeight: '22px', color: 'var(--violet)' }}>
                  {previewing.name}
                </p>

                {/* Era */}
                <p className="text-center uppercase" style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: 1, color: 'var(--text-sub)', marginTop: -8 }}>
                  {previewing.era}
                </p>

                {/* Quote */}
                <p className="text-center" style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', color: 'var(--text-body)', fontStyle: 'italic' }}>
                  &ldquo;{previewing.quote}&rdquo;
                </p>

                {/* Bio */}
                <p className="text-center" style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', color: 'var(--text-body)' }}>
                  {previewing.bio}
                </p>

                {/* Action buttons */}
                <div className="flex gap-3 w-full" style={{ marginTop: 4 }}>
                  <button
                    onClick={() => setPreviewIndex(null)}
                    className="flex-1 uppercase flex items-center justify-center"
                    style={{
                      fontFamily: 'var(--font-btn)', fontWeight: 600, fontSize: 13,
                      letterSpacing: 'var(--btn-letter-spacing, 2px)',
                      gap: 6,
                      color: 'var(--btn-secondary-color, var(--text-body))',
                      background: 'var(--btn-secondary-bg)',
                      borderTop: 'var(--btn-bt)', borderLeft: 'var(--btn-bl)',
                      borderRight: 'var(--btn-br)', borderBottom: 'var(--btn-bb)',
                      borderRadius: 'var(--btn-radius)', padding: '12px 8px',
                      boxShadow: 'var(--btn-secondary-shadow)', cursor: 'pointer',
                    }}
                  >
                    <Icon name="arrow_back" size={16} />
                    Back
                  </button>
                  <button
                    onClick={() => {
                      setPreviewIndex(null)
                      handleGetPerspective(previewing.id)
                    }}
                    disabled={loading}
                    className="flex-1 uppercase text-center"
                    style={{
                      fontFamily: 'var(--font-btn)', fontWeight: 600, fontSize: 13,
                      letterSpacing: 'var(--btn-letter-spacing, 2px)',
                      color: 'var(--btn-color)',
                      background: 'var(--btn-bg)',
                      borderTop: 'var(--btn-bt)', borderLeft: 'var(--btn-bl)',
                      borderRight: 'var(--btn-br)', borderBottom: 'var(--btn-bb)',
                      borderRadius: 'var(--btn-radius)', padding: '12px 8px',
                      boxShadow: 'var(--btn-shadow)', cursor: loading ? 'wait' : 'pointer',
                      opacity: loading ? 0.6 : 1,
                    }}
                  >
                    {loading ? 'Loading…' : 'Select'}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
