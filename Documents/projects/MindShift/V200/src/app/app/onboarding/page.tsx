'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const MAX_CHARS = 800

const PLACEHOLDERS = [
  'I keep second-guessing my career choice...',
  "My relationship feels like it's going nowhere...",
  "I know what I should do, but I just can't start...",
  'Everyone around me seems to have it figured out...',
  "I'm scared of making the wrong decision...",
]

export default function OnboardingPage() {
  const router = useRouter()
  const [text, setText] = useState('')
  const [placeholderIdx] = useState(() => Math.floor(Math.random() * PLACEHOLDERS.length))

  const canProceed = text.trim().length >= 20

  function handleProceed() {
    if (!canProceed) return
    sessionStorage.setItem('ms_vent', text.trim())
    router.push('/app/lens')
  }

  return (
    /* Full-screen bg */
    <div className="min-h-dvh flex flex-col items-center" style={{ background: 'var(--bg)' }}>
      {/* Centred column — matches Figma 440px frame */}
      <div className="flex flex-col gap-8 w-full" style={{ maxWidth: 440, padding: '40px 34px' }}>

        {/* "GET IT OFF YOUR CHEST" card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--pink)',
            borderLeft: '4px solid var(--pink)',
            borderBottom: '2px solid var(--pink)',
            borderRight: '4px solid var(--pink)',
            borderRadius: 4,
            padding: '16px 24px',
          }}
        >
          <p
            className="uppercase w-full"
            style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 18, letterSpacing: 1.44, lineHeight: '20px', color: '#EEFFEA', marginBottom: 8 }}
          >
            Get it off your chest
          </p>
          <p
            style={{ fontFamily: 'var(--font-mono)', fontSize: 14, letterSpacing: 0.52, lineHeight: '20px', color: 'var(--cyan)' }}
          >
            Let it all out — then see it through the eyes of someone who lived through years of history.
          </p>
        </motion.div>

        {/* Input section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="flex flex-col gap-4"
          style={{ flex: 1 }}
        >
          {/* Textarea card */}
          <div
            className="flex flex-col"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--cyan)',
              borderLeft: '4px solid var(--cyan)',
              borderTop: '4px solid var(--cyan)',
              borderRadius: 4,
              minHeight: 280,
            }}
          >
            {/* "DUMP IT ALL HERE:" header */}
            <div
              className="flex items-center justify-center"
              style={{ borderBottom: '1px solid var(--cyan)', padding: '8px 16px 4px' }}
            >
              <p
                className="flex-1 text-center uppercase"
                style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12, letterSpacing: 0.52, lineHeight: '14px', color: 'var(--cyan)' }}
              >
                Dump it all here:
              </p>
            </div>

            {/* Textarea */}
            <textarea
              value={text}
              onChange={e => setText(e.target.value.slice(0, MAX_CHARS))}
              placeholder={PLACEHOLDERS[placeholderIdx]}
              className="flex-1 resize-none outline-none w-full"
              style={{
                background: 'transparent',
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                lineHeight: '20px',
                letterSpacing: 0.5,
                color: '#EEFFEA',
                caretColor: 'var(--cyan)',
                padding: '12px 16px',
                minHeight: 200,
              }}
            />

            {/* Char counter */}
            <div
              className="flex justify-end"
              style={{ borderTop: '1px solid var(--cyan)', padding: '4px 8px' }}
            >
              <p
                className="uppercase text-right"
                style={{
                  fontFamily: 'var(--font-mono)',
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

          {/* SELECT THE LENS button */}
          <motion.button
            onClick={handleProceed}
            disabled={!canProceed}
            whileTap={{ scale: 0.97 }}
            className="w-full uppercase text-center transition-all"
            style={{
              fontFamily: 'var(--font-alumni)',
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: 3,
              color: canProceed ? 'var(--green)' : 'rgba(255,255,255,0.2)',
              background: 'transparent',
              border: `1px solid ${canProceed ? 'var(--green)' : 'rgba(255,255,255,0.1)'}`,
              borderBottom: `4px solid ${canProceed ? 'var(--green)' : 'rgba(255,255,255,0.1)'}`,
              borderLeft: `4px solid ${canProceed ? 'var(--green)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 2,
              padding: '17px 12px 17px 9px',
              boxShadow: canProceed ? '0 0 12px rgba(57,255,20,0.2)' : 'none',
              cursor: canProceed ? 'pointer' : 'not-allowed',
            }}
          >
            Select the Lens
          </motion.button>
        </motion.div>

        {/* Coming soon teaser + waitlist */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.16 }}
          className="flex flex-col items-center gap-4"
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--pink)',
              borderLeft: '4px solid var(--pink)',
              borderBottom: '2px solid var(--pink)',
              borderRight: '4px solid var(--pink)',
              borderRadius: 4,
              padding: '16px 24px',
              width: '100%',
            }}
          >
            <p
              className="uppercase"
              style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12, letterSpacing: 1.32, lineHeight: '14px', color: 'var(--cyan)', marginBottom: 8 }}
            >
              Coming Soon
            </p>
            <p
              className="uppercase"
              style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 18, letterSpacing: 1.44, lineHeight: '20px', color: '#EEFFEA', marginBottom: 8 }}
            >
              Mind-mapping tool
            </p>
            <p
              style={{ fontFamily: 'var(--font-mono)', fontSize: 14, letterSpacing: 0.52, lineHeight: '20px', color: 'var(--cyan)', marginBottom: 8 }}
            >
              Reflect, plan and achieve new horizons with step by step guidance
            </p>
            <p
              className="uppercase"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1, lineHeight: '12px', color: '#EEFFEA' }}
            >
              career, health &amp; wellness, creativity, personal development, relationships, travel &amp; finances
            </p>
          </div>

          <p
            className="text-center w-full"
            style={{ fontFamily: 'var(--font-mono)', fontSize: 14, letterSpacing: 0.52, lineHeight: '20px', color: 'var(--green)' }}
          >
            Get on the waitlist to be the first to know
          </p>

          <button
            className="uppercase transition-opacity hover:opacity-80"
            style={{
              fontFamily: 'var(--font-alumni)',
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: 3,
              color: 'var(--pink)',
              background: 'transparent',
              border: '1px solid var(--pink)',
              borderBottom: '2px solid var(--pink)',
              borderRight: '2px solid var(--pink)',
              borderRadius: 2,
              padding: '9px 14px 10px 13px',
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
