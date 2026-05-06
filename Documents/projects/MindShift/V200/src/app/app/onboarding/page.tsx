'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import ThemeSwitcher from '@/components/ThemeSwitcher'

const MAX_CHARS = 800

const DEMO_VENT =
  "I keep second-guessing my career choice. Everyone around me seems so sure about what they're doing, but I'm constantly wondering if I chose the right path. Maybe I need a completely fresh perspective on all of this."

export default function OnboardingPage() {
  const router = useRouter()
  const [text, setText] = useState(DEMO_VENT)

  const canProceed = text.trim().length >= 20

  function handleProceed() {
    if (!canProceed) return
    sessionStorage.setItem('ms_vent', text.trim())
    router.push('/app/lens')
  }

  return (
    <div className="min-h-dvh flex flex-col items-center" style={{ background: 'var(--bg)' }}>
      <div className="flex flex-col gap-8 w-full" style={{ maxWidth: 440, padding: '40px 24px' }}>

        {/* Heading card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            background: 'var(--hcard-bg)',
            borderTop: 'var(--hcard-bt)',
            borderLeft: 'var(--hcard-bl)',
            borderRight: 'var(--hcard-br)',
            borderBottom: 'var(--hcard-bb)',
            borderRadius: 'var(--hcard-radius)',
            padding: 'var(--hcard-padding)',
          }}
        >
          <p
            className="uppercase w-full"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: 1.44, lineHeight: '20px', color: 'var(--text-body)', marginBottom: 8 }}
          >
            Get it off your chest
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, letterSpacing: 0.52, lineHeight: '20px', color: 'var(--cyan)' }}>
            Let it all out — then see it through the eyes of someone who lived through years of history.
          </p>
        </motion.div>

        {/* Input section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="flex flex-col gap-4"
        >
          {/* Textarea card */}
          <div
            className="flex flex-col"
            style={{
              background: 'var(--input-bg)',
              borderTop: 'var(--input-bt)',
              borderLeft: 'var(--input-bl)',
              borderRight: 'var(--input-br)',
              borderBottom: 'var(--input-bb)',
              borderRadius: 'var(--input-radius)',
              minHeight: 280,
              boxShadow: 'var(--card-shadow)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-center"
              style={{ borderBottom: `1px solid var(--input-divider)`, padding: '8px 16px 4px' }}
            >
              <p
                className="flex-1 text-center uppercase"
                style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12, letterSpacing: 0.52, lineHeight: '14px', color: 'var(--cyan)' }}
              >
                Dump it all here:
              </p>
            </div>

            {/* Textarea */}
            <textarea
              value={text}
              onChange={e => setText(e.target.value.slice(0, MAX_CHARS))}
              placeholder="What's on your mind?"
              className="flex-1 resize-none outline-none w-full"
              style={{
                background: 'transparent',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                lineHeight: '20px',
                letterSpacing: 0.5,
                color: 'var(--text-body)',
                caretColor: 'var(--cyan)',
                padding: '12px 16px',
                minHeight: 200,
              }}
            />

            {/* Char counter */}
            <div
              className="flex justify-end"
              style={{ borderTop: `1px solid var(--input-divider)`, padding: '4px 8px' }}
            >
              <p
                className="uppercase text-right"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 10,
                  letterSpacing: 1,
                  lineHeight: '12px',
                  color: text.length > 700 ? 'var(--pink)' : 'var(--text-sub)',
                }}
              >
                {text.length}/{MAX_CHARS} characters
              </p>
            </div>
          </div>

          {/* CTA button */}
          <motion.button
            onClick={handleProceed}
            disabled={!canProceed}
            whileTap={{ scale: 0.97 }}
            className="w-full uppercase text-center transition-all"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: 3,
              color: canProceed ? 'var(--btn-color)' : 'var(--btn-dis-color)',
              background: canProceed ? 'var(--btn-bg)' : 'transparent',
              borderTop: canProceed ? 'var(--btn-bt)' : `1px solid var(--btn-dis-border)`,
              borderLeft: canProceed ? 'var(--btn-bl)' : `1px solid var(--btn-dis-border)`,
              borderRight: canProceed ? 'var(--btn-br)' : `1px solid var(--btn-dis-border)`,
              borderBottom: canProceed ? 'var(--btn-bb)' : `1px solid var(--btn-dis-border)`,
              borderRadius: 'var(--btn-radius)',
              padding: '17px 12px',
              boxShadow: canProceed ? 'var(--btn-shadow)' : 'none',
              cursor: canProceed ? 'pointer' : 'not-allowed',
            }}
          >
            Select the Lens
          </motion.button>
        </motion.div>

        {/* Theme switcher */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center"
        >
          <ThemeSwitcher />
        </motion.div>

        {/* Coming soon teaser */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.16 }}
          className="flex flex-col items-center gap-4"
        >
          <div
            style={{
              background: 'var(--hcard-bg, var(--bg-card))',
              borderTop: 'var(--hcard-bt)',
              borderLeft: 'var(--hcard-bl)',
              borderRight: 'var(--hcard-br)',
              borderBottom: 'var(--hcard-bb)',
              borderRadius: 'var(--hcard-radius, 4px)',
              padding: 'var(--hcard-padding, 16px 24px)',
              width: '100%',
            }}
          >
            <p className="uppercase" style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12, letterSpacing: 1.32, lineHeight: '14px', color: 'var(--cyan)', marginBottom: 8 }}>
              Coming Soon
            </p>
            <p className="uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: 1.44, lineHeight: '20px', color: 'var(--text-body)', marginBottom: 8 }}>
              Mind-mapping tool
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, letterSpacing: 0.52, lineHeight: '20px', color: 'var(--cyan)', marginBottom: 8 }}>
              Reflect, plan and achieve new horizons with step by step guidance
            </p>
            <p className="uppercase" style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: 1, lineHeight: '12px', color: 'var(--text-body)' }}>
              career, health &amp; wellness, creativity, personal development, relationships, travel &amp; finances
            </p>
          </div>

          <p className="text-center w-full" style={{ fontFamily: 'var(--font-body)', fontSize: 14, letterSpacing: 0.52, lineHeight: '20px', color: 'var(--green)' }}>
            Get on the waitlist to be the first to know
          </p>

          <button
            className="uppercase transition-opacity hover:opacity-80"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: 3,
              color: 'var(--pink)',
              background: 'transparent',
              borderTop: 'var(--hcard-bt, 1px solid var(--pink))',
              borderLeft: 'var(--hcard-bl, 4px solid var(--pink))',
              borderRight: 'var(--hcard-br, 4px solid var(--pink))',
              borderBottom: 'var(--hcard-bb, 2px solid var(--pink))',
              borderRadius: 'var(--hcard-radius, 2px)',
              padding: '9px 14px',
              cursor: 'pointer',
            }}
          >
            Sign Up
          </button>
        </motion.div>

      </div>
    </div>
  )
}
