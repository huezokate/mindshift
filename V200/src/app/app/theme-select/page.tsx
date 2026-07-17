'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { FIGURES, getFigureImg } from '@/lib/figures'
import { useTheme, type Theme } from '@/lib/theme'
import ThemeButton from '@/components/ui/ThemeButton'
import EntryAuthRow from '@/components/nav/EntryAuthRow'

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

// Reusable Figma-matched card style (node 397:3658 — LensePreviewCard).
// Uses existing --card-* tokens which already encode the asymmetric border / radius / shadow.
const cardStyle: React.CSSProperties = {
  background: 'var(--card-bg)',
  borderTop: 'var(--card-bt)',
  borderLeft: 'var(--card-bl)',
  borderRight: 'var(--card-br)',
  borderBottom: 'var(--card-bb)',
  borderRadius: 'var(--card-radius)',
  boxShadow: 'var(--card-shadow)',
  filter: 'var(--card-filter, none)',
}

export default function ThemeSelectPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const currentIndex = THEMES.findIndex(t => t.id === theme)
  const [index, setIndex] = useState(currentIndex >= 0 ? currentIndex : 1)

  // BUG FIX (Kate 2026-07-11): ThemeProvider starts at the DEFAULT theme and
  // applies the saved one in a mount effect — so the initializer above ran
  // against 'cyberpunk' even when the visitor had saved kawaii. The carousel
  // then silently sat on the wrong theme and "Enter" wrote it back over the
  // saved pick (kawaii → cyberpunk after passing through this screen). Track
  // the provider: whenever the resolved theme changes underneath us, re-point
  // the carousel. User swipes call setTheme immediately, so this effect is a
  // no-op during normal interaction.
  useEffect(() => {
    const i = THEMES.findIndex(t => t.id === theme)
    if (i >= 0) setIndex(i)
  }, [theme])
  const { user } = useUser()

  const current = THEMES[index]

  function pick(id: Theme) {
    setIndex(THEMES.findIndex(t => t.id === id))
    setTheme(id)
  }

  // The not-therapy checkmark moved to its own screen (/app/disclaimer, Kate
  // 2026-07-16): anon users see it until they ack once on this device; a
  // signed-in profile sees it on its very first login (ack persisted to Clerk
  // unsafeMetadata), then never again.
  function handleEnter() {
    setTheme(current.id)
    const acked =
      user?.unsafeMetadata?.ntAck === true ||
      localStorage.getItem('ms_nt_ack') === '1'
    router.push(acked ? '/app/onboarding' : '/app/disclaimer')
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

      {/* Bg-colour overlay — dims figure grid for depth */}
      <div
        className="absolute inset-0 z-[5]"
        style={{ background: 'var(--bg)', opacity: 0.55 }}
        aria-hidden="true"
      />

      {/* Foreground column */}
      <div
        className="relative z-10 flex flex-col items-center min-h-dvh"
        style={{ padding: '32px 24px', gap: 20 }}
      >
        {/* AUTH ROW — sign-up visible for anon, name shown when signed in */}
        <EntryAuthRow maxWidth={376} />

        {/* HERO CARD — wordmark + tagline + disclaimer ack */}
        <div
          className="w-full flex flex-col items-center"
          style={{ ...cardStyle, maxWidth: 376, padding: '24px 24px', gap: 14 }}
        >
          <p
            className="uppercase text-center"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 28,
              letterSpacing: 3,
              lineHeight: '32px',
              color: 'var(--violet)',
              margin: 0,
            }}
          >
            Welcome to Minds Shift
          </p>
          <p
            className="text-center"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              letterSpacing: 0.4,
              lineHeight: '18px',
              color: 'var(--text-body)',
              margin: 0,
            }}
          >
            For the overthinkers, the stuck ones, and anyone who just needs a fresh angle.
          </p>

          {/* Divider */}
          <div
            style={{
              width: '100%',
              height: 1,
              background: 'var(--input-divider, rgba(0,0,0,0.08))',
            }}
            aria-hidden="true"
          />

          {/* Select your vibe — the DS ThemeButtons (UI/ThemeButton). Picking
              one live-morphs the whole screen; the not-therapy ack now lives
              on its own screen after this one. */}
          <p
            className="uppercase text-center"
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: 1.5,
              lineHeight: '14px',
              color: 'var(--text-sub)',
              margin: 0,
            }}
          >
            Select your vibe
          </p>
          <div className="w-full flex flex-col" style={{ gap: 12 }}>
            {THEMES.map(t => (
              <ThemeButton
                key={t.id}
                theme={t.id}
                selected={current.id === t.id}
                onClick={() => pick(t.id)}
                style={{ width: '100%' }}
              />
            ))}
          </div>
        </div>

        {/* THEME PICKER CARD — the active decision */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="w-full flex flex-col items-center"
            style={{ ...cardStyle, maxWidth: 376, padding: '24px 24px 20px', gap: 16 }}
          >
            <p
              className="uppercase text-center"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 18,
                letterSpacing: 2,
                lineHeight: '22px',
                color: 'var(--violet)',
                margin: 0,
              }}
            >
              {current.name}
            </p>

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
                margin: 0,
              }}
            >
              {current.tagline}
            </p>

            <p
              className="text-center"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                letterSpacing: 0.5,
                lineHeight: '20px',
                color: 'var(--text-body)',
                margin: 0,
              }}
            >
              {current.description}
            </p>

          </motion.div>
        </AnimatePresence>

        {/* PRIMARY CTA — solid filled, never transparent */}
        <button
          onClick={handleEnter}
          className="w-full uppercase transition-colors active:scale-95"
          style={{
            maxWidth: 376,
            fontFamily: 'var(--font-btn)',
            fontWeight: 600,
            fontSize: 14,
            letterSpacing: 'var(--btn-letter-spacing, 3px)',
            color: 'var(--violet)',
            // Per-theme opaque CTA fill so the button never lets the figure grid show
            // through. Cyberpunk black, kawaii cream, notepad paper (see --cta-solid-bg).
            backgroundColor: 'var(--cta-solid-bg)',
            borderTop: 'var(--card-bt)',
            borderLeft: 'var(--card-bl)',
            borderRight: 'var(--card-br)',
            borderBottom: 'var(--card-bb)',
            borderRadius: 'var(--btn-radius, 32px)',
            padding: '17px 12px',
            boxShadow: 'var(--card-shadow)',
            cursor: 'pointer',
          }}
        >
          Enter Minds Shift
        </button>
      </div>
    </div>
  )
}
