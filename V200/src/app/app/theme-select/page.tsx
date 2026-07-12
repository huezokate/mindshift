'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { FIGURES, getFigureImg } from '@/lib/figures'
import { useTheme, type Theme } from '@/lib/theme'
import Icon from '@/components/ui/Icon'
import Button from '@/components/ui/Button'
import TextLink from '@/components/ui/TextLink'
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
  const { isSignedIn, user } = useUser()

  const firstName =
    user?.firstName ??
    user?.username ??
    user?.primaryEmailAddress?.emailAddress ??
    null

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
  // Disclaimer ack is intentionally ephemeral — it must start UNCHECKED on every
  // visit (Kate, 14 June board). Do not restore it from localStorage.
  const [acknowledged, setAcknowledged] = useState(false)
  const [expanded, setExpanded] = useState(false)

  // Signed-in users have already acknowledged the disclaimer at sign-up, so we
  // skip the checkbox for them and treat the gate as satisfied (Kate, 2 July).
  const gateSatisfied = acknowledged || !!isSignedIn

  const current = THEMES[index]

  function prev() {
    const n = (index - 1 + THEMES.length) % THEMES.length
    setIndex(n)
    setTheme(THEMES[n].id)
  }

  function next() {
    const n = (index + 1) % THEMES.length
    setIndex(n)
    setTheme(THEMES[n].id)
  }

  function handleEnter() {
    if (!gateSatisfied) return
    setTheme(current.id)
    router.push('/app/onboarding')
  }

  function toggleAck() {
    setAcknowledged(v => !v)
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
        {/* AUTH ROW — anon only: Log in / Sign up links. Signed-in users are
            already greeted by name in the hero card below, so we skip the
            redundant "Hi, {name}" greeting here. */}
        {!isSignedIn && <EntryAuthRow maxWidth={376} />}

        {/* HERO CARD — signed in → warm welcome only; signed out → wordmark +
            tagline + disclaimer ack. */}
        <div
          className="w-full flex flex-col items-center"
          style={{ ...cardStyle, maxWidth: 376, padding: '24px 24px', gap: 14 }}
        >
          {isSignedIn ? (
          <>
            <p
              className="uppercase text-center"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 24,
                letterSpacing: 2,
                lineHeight: '28px',
                color: 'var(--violet)',
                margin: 0,
              }}
            >
              Welcome back{firstName ? ',' : ''}
            </p>
            {firstName && (
              <p
                className="uppercase text-center"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 20,
                  letterSpacing: 1.5,
                  lineHeight: '24px',
                  color: 'var(--violet)',
                  margin: 0,
                  // A long name (or an email fallback) must never blow out the
                  // card — wrap on any character rather than overflow.
                  maxWidth: '100%',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                }}
              >
                {firstName}
              </p>
            )}
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
              Pick the theme that matches your mood today.
            </p>
          </>
          ) : (
          <>
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
            Minds Shift
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

          {/* Disclaimer ack — progressive disclosure. Custom checkbox (Material
              Symbol) instead of a native input: the native control with a cyan
              accent on the dark bg read as pre-ticked. This renders an
              unmistakably empty box until the user actually taps it. */}
          <div
            role="checkbox"
            tabIndex={0}
            aria-checked={acknowledged}
            onClick={toggleAck}
            onKeyDown={e => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault()
                toggleAck()
              }
            }}
            className="flex items-start gap-3 cursor-pointer select-none w-full"
          >
            <Icon
              name={acknowledged ? 'check_box' : 'check_box_outline_blank'}
              fill={acknowledged ? 1 : 0}
              size={20}
              style={{
                flexShrink: 0,
                marginTop: 1,
                color: acknowledged ? 'var(--cyan)' : 'var(--text-sub)',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 12,
                lineHeight: '18px',
                letterSpacing: 0.3,
                color: 'var(--text-body)',
              }}
            >
              I understand Minds Shift is a space for reflection, not clinical advice.{' '}
              <button
                type="button"
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  setExpanded(v => !v)
                }}
                aria-expanded={expanded}
                className="underline transition-opacity hover:opacity-70"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--cyan)',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  letterSpacing: 'inherit',
                  padding: 0,
                }}
              >
                {expanded ? 'Show less' : 'Learn more'}
              </button>
            </span>
          </div>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                key="disclaimer-detail"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden', width: '100%' }}
              >
                <div
                  className="flex flex-col gap-2"
                  style={{
                    padding: '10px 14px',
                    borderLeft: '2px solid var(--cyan)',
                    marginLeft: 28,
                  }}
                >
                  <p
                    className="uppercase"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontWeight: 700,
                      fontSize: 10,
                      letterSpacing: 0.5,
                      lineHeight: '14px',
                      color: 'var(--cyan)',
                      margin: 0,
                    }}
                  >
                    A few things before we begin
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 12,
                      lineHeight: '18px',
                      letterSpacing: 0.3,
                      color: 'var(--text-body)',
                      margin: 0,
                    }}
                  >
                    Minds Shift is a space for reflection, not a substitute for professional mental health support. The lenses are creative re-framings, not therapy. If you&apos;re in crisis, please reach out to a qualified professional or a crisis line.
                  </p>
                  <p
                    className="uppercase"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontWeight: 700,
                      fontSize: 10,
                      letterSpacing: 0.5,
                      lineHeight: '14px',
                      color: 'var(--violet)',
                      margin: 0,
                    }}
                  >
                    Nothing here is clinical advice.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </>
          )}
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

            <div className="flex items-center gap-5" style={{ marginTop: 4 }}>
              <Button variant="secondary" icon="chevron_left" onClick={prev} ariaLabel="Previous theme" />
              <p
                className="uppercase"
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
                Pick your interface
              </p>
              <Button variant="secondary" icon="chevron_right" onClick={next} ariaLabel="Next theme" />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* PRIMARY CTA — solid filled, never transparent */}
        <button
          onClick={handleEnter}
          disabled={!gateSatisfied}
          className="w-full uppercase transition-colors active:scale-95"
          style={{
            maxWidth: 376,
            fontFamily: 'var(--font-btn)',
            fontWeight: 600,
            fontSize: 14,
            letterSpacing: 'var(--btn-letter-spacing, 3px)',
            color: gateSatisfied ? 'var(--violet)' : 'var(--text-sub)',
            // Per-theme opaque CTA fill so the button never lets the figure grid show
            // through. Cyberpunk black, kawaii cream, notepad paper (see --cta-solid-bg).
            backgroundColor: gateSatisfied ? 'var(--cta-solid-bg)' : 'var(--cta-solid-bg-disabled)',
            borderTop: 'var(--card-bt)',
            borderLeft: 'var(--card-bl)',
            borderRight: 'var(--card-br)',
            borderBottom: 'var(--card-bb)',
            borderRadius: 'var(--btn-radius, 32px)',
            padding: '17px 12px',
            boxShadow: 'var(--card-shadow)',
            cursor: gateSatisfied ? 'pointer' : 'not-allowed',
          }}
        >
          Enter Minds Shift
        </button>
      </div>
    </div>
  )
}
