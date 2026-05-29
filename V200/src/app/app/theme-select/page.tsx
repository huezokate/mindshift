'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FIGURES, getFigureImg } from '@/lib/figures'
import { useTheme, type Theme } from '@/lib/theme'

const ACK_KEY = 'ms_disclaimer_ack'

const THEMES: { id: Theme; name: string; tagline: string; description: string }[] = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    tagline: 'Hack the system.\nNeon dreams.\nThink different.',
    description:
      'A high-contrast, neon-lit skin for those who want their thoughts to feel as sharp as they are.',
  },
  {
    id: 'kawaii',
    name: 'Kawaii',
    tagline: 'Soft edges.\nBright energy.\nGood vibes only.',
    description:
      'A playful, candy-colored skin that makes self-growth feel like a treat. For the ones who know joy is the best motivator.',
  },
  {
    id: 'notepad',
    name: 'Notepad',
    tagline: 'Clean lines.\nClear thoughts.\nJust the essentials.',
    description:
      'A minimal, paper-like skin for those who prefer their reflections unadorned and their focus undivided.',
  },
]

export default function ThemeSelectPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const currentIndex = THEMES.findIndex(t => t.id === theme)
  const [index, setIndex] = useState(currentIndex >= 0 ? currentIndex : 1)
  const [acknowledged, setAcknowledged] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem(ACK_KEY) === '1') {
      setAcknowledged(true)
    }
  }, [])

  const current = THEMES[index]

  function prev() {
    const next = (index - 1 + THEMES.length) % THEMES.length
    setIndex(next)
    setTheme(THEMES[next].id)
  }

  function next() {
    const next = (index + 1) % THEMES.length
    setIndex(next)
    setTheme(THEMES[next].id)
  }

  function handleSelect() {
    if (!acknowledged) return
    setTheme(current.id)
    router.push('/app/onboarding')
  }

  function toggleAck() {
    const next = !acknowledged
    setAcknowledged(next)
    if (typeof window !== 'undefined') {
      if (next) localStorage.setItem(ACK_KEY, '1')
      else localStorage.removeItem(ACK_KEY)
    }
  }

  return (
    <div
      className="min-h-dvh relative overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* Background: decorative figure grid — fills entire viewport */}
      <div
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(5, 1fr)',
          gap: 6,
          padding: '8px',
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        {FIGURES.map(fig => (
          <div
            key={fig.id}
            className="flex flex-col items-center justify-center gap-2"
            style={{
              background: 'var(--fig-bg)',
              border: 'var(--fig-border)',
              borderRadius: 'var(--fig-radius)',
              padding: '8px 6px',
              overflow: 'hidden',
            }}
          >
            <div
              className="overflow-hidden flex-shrink-0"
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'var(--fig-avatar-grad)',
                border: 'var(--fig-avatar-border)',
              }}
            >
              <img
                src={getFigureImg(fig, current.id)}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', display: 'block' }}
              />
            </div>
            <p
              className="uppercase text-center"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 9,
                letterSpacing: 0.8,
                lineHeight: '12px',
                color: 'var(--fig-name-unsel)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                width: '100%',
              }}
            >
              {fig.name}
            </p>
            <p
              className="uppercase text-center"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 7,
                letterSpacing: 0.5,
                lineHeight: '10px',
                color: 'var(--fig-desc)',
              }}
            >
              {fig.descriptor}
            </p>
          </div>
        ))}
      </div>

      {/* 30% bg-colour overlay — dims grid, creates depth behind modal */}
      <div
        className="absolute inset-0 z-[5]"
        style={{ background: 'var(--bg)', opacity: 0.3 }}
        aria-hidden="true"
      />

      {/* Foreground: centered modal card */}
      <div
        className="relative z-10 flex items-center justify-center min-h-dvh"
        style={{ padding: '24px' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-5 w-full"
            style={{
              maxWidth: 360,
              background: 'var(--card-bg)',
              borderTop: 'var(--card-bt)',
              borderLeft: 'var(--card-bl)',
              borderRight: 'var(--card-br)',
              borderBottom: 'var(--card-bb)',
              borderRadius: 'var(--card-radius)',
              padding: '32px 24px 24px',
              boxShadow: 'var(--card-shadow)',
              filter: 'var(--card-filter, none)',
            }}
          >
            {/* Theme name */}
            <p
              className="uppercase text-center"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 18,
                letterSpacing: 2,
                lineHeight: '22px',
                color: 'var(--violet)',
              }}
            >
              {current.name}
            </p>

            {/* Tagline */}
            <p
              className="text-center"
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: 0.5,
                lineHeight: '22px',
                color: 'var(--cyan)',
                whiteSpace: 'pre-line',
              }}
            >
              {current.tagline}
            </p>

            {/* Description */}
            <p
              className="text-center"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                letterSpacing: 0.5,
                lineHeight: '20px',
                color: 'var(--text-body)',
              }}
            >
              {current.description}
            </p>

            {/* Disclaimer block */}
            <div
              className="w-full flex flex-col gap-2"
              style={{
                padding: '12px 14px',
                borderTop: 'var(--hcard-bt)',
                borderLeft: 'var(--hcard-bl)',
                borderRight: 'var(--hcard-br)',
                borderBottom: 'var(--hcard-bb)',
                borderRadius: 'var(--hcard-radius)',
                background: 'var(--hcard-bg)',
              }}
            >
              <p
                className="uppercase"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: 0.5,
                  lineHeight: '14px',
                  color: 'var(--cyan)',
                }}
              >
                A few things before we begin:
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  lineHeight: '18px',
                  letterSpacing: 0.3,
                  color: 'var(--text-body)',
                }}
              >
                MindShift is a space for reflection, not a substitute for professional mental health support.
              </p>
              <p
                className="uppercase"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: 0.5,
                  lineHeight: '14px',
                  color: 'var(--violet)',
                }}
              >
                Nothing here is clinical advice.
              </p>

              {/* Acknowledgement checkbox */}
              <label
                className="flex items-center gap-2 cursor-pointer select-none"
                style={{ marginTop: 4 }}
              >
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={toggleAck}
                  className="cursor-pointer"
                  style={{
                    width: 16,
                    height: 16,
                    accentColor: 'var(--cyan)',
                    flexShrink: 0,
                  }}
                />
                <span
                  className="uppercase"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: 0.5,
                    lineHeight: '14px',
                    color: 'var(--text-body)',
                  }}
                >
                  I understand
                </span>
              </label>
            </div>

            {/* SELECT UI button */}
            <button
              onClick={handleSelect}
              disabled={!acknowledged}
              className="uppercase transition-opacity active:scale-95"
              style={{
                fontFamily: 'var(--font-btn)',
                fontWeight: 600,
                fontSize: 14,
                letterSpacing: 'var(--btn-letter-spacing, 2px)',
                color: acknowledged
                  ? 'var(--btn-secondary-color, var(--text-body))'
                  : 'var(--btn-dis-color)',
                background: acknowledged ? 'var(--btn-secondary-bg)' : 'transparent',
                borderTop: acknowledged ? 'var(--btn-bt)' : '1px solid var(--btn-dis-border)',
                borderLeft: acknowledged ? 'var(--btn-bl)' : '1px solid var(--btn-dis-border)',
                borderRight: acknowledged ? 'var(--btn-br)' : '1px solid var(--btn-dis-border)',
                borderBottom: acknowledged ? 'var(--btn-bb)' : '1px solid var(--btn-dis-border)',
                borderRadius: 'var(--btn-radius)',
                padding: '14px 40px',
                boxShadow: acknowledged ? 'var(--btn-secondary-shadow)' : 'none',
                cursor: acknowledged ? 'pointer' : 'not-allowed',
                opacity: acknowledged ? 1 : 0.85,
              }}
            >
              Select UI
            </button>

            {/* Navigation row */}
            <div className="flex items-center gap-4">
              <button
                onClick={prev}
                className="flex items-center justify-center transition-opacity hover:opacity-70"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--cyan)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 20,
                  lineHeight: 1,
                  padding: '4px 8px',
                }}
                aria-label="Previous theme"
              >
                ‹
              </button>

              <p
                className="uppercase"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: 1.5,
                  lineHeight: '14px',
                  color: 'var(--text-sub)',
                }}
              >
                Pick your interface
              </p>

              <button
                onClick={next}
                className="flex items-center justify-center transition-opacity hover:opacity-70"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--cyan)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 20,
                  lineHeight: 1,
                  padding: '4px 8px',
                }}
                aria-label="Next theme"
              >
                ›
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
