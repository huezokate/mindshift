'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

const MAX_CHARS = 800

export default function OnboardingPage() {
  const router = useRouter()
  const [text, setText] = useState('')

  const canProceed = text.trim().length >= 20
  const isEmpty = text.length === 0

  function handleProceed() {
    if (!canProceed) return
    sessionStorage.setItem('ms_vent', text.trim())
    router.push('/app/lens')
  }

  return (
    <div className="min-h-dvh flex flex-col items-center" style={{ background: 'var(--bg)' }}>
      <div className="flex flex-col gap-8 w-full" style={{ maxWidth: 440, padding: '40px 24px' }}>

        {/* Heading card — pink borders (hcard) */}
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
            className="uppercase text-center w-full"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 28,
              letterSpacing: 1.44,
              lineHeight: '32px',
              color: 'var(--cyan)',
              marginBottom: 8,
            }}
          >
            Get it off your chest
          </p>
          <p
            className="text-center"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              letterSpacing: 0.52,
              lineHeight: '20px',
              color: 'var(--text-body)',
            }}
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
        >
          {/* Textarea card */}
          <div
            className="flex flex-col overflow-hidden"
            style={{
              borderTop: 'var(--input-bt)',
              borderLeft: 'var(--input-bl)',
              borderRight: 'var(--input-br)',
              borderBottom: 'var(--input-bb)',
              borderRadius: 'var(--input-radius)',
              boxShadow: 'var(--input-shadow)',
            }}
          >
            {/* Header row */}
            <div
              className="flex items-center justify-center"
              style={{
                background: 'var(--input-header-bg)',
                boxShadow: 'var(--input-header-shadow)',
                padding: '10px 16px',
                borderBottom: '1px solid var(--input-divider)',
              }}
            >
              <p
                className="text-center uppercase"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 700,
                  fontSize: 12,
                  letterSpacing: 1,
                  lineHeight: '14px',
                  color: 'var(--text-body)',
                }}
              >
                Dump it all here:
              </p>
            </div>

            {/* Textarea body */}
            <div style={{ background: 'var(--input-bg)', position: 'relative' }}>
              <textarea
                value={text}
                onChange={e => setText(e.target.value.slice(0, MAX_CHARS))}
                className="resize-none outline-none w-full"
                style={{
                  background: 'transparent',
                  fontFamily: 'var(--font-body)',
                  fontSize: 14,
                  lineHeight: '20px',
                  letterSpacing: 0.52,
                  color: 'var(--text-body)',
                  caretColor: 'var(--cyan)',
                  padding: '12px 16px',
                  minHeight: 200,
                  display: 'block',
                }}
              />
              {/* Tooltip-style placeholder — shown when empty */}
              {isEmpty && (
                <p
                  className="uppercase pointer-events-none"
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '16px',
                    fontFamily: 'var(--font-body)',
                    fontSize: 10,
                    lineHeight: '12px',
                    letterSpacing: 1,
                    color: 'var(--text-sub)',
                  }}
                >
                  Start typing...
                </p>
              )}

              {/* Char counter */}
              <div
                className="flex justify-end"
                style={{ borderTop: '1px solid var(--input-divider)', padding: '4px 12px' }}
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
          </div>

          {/* Primary CTA — Select the Lens */}
          <motion.button
            onClick={handleProceed}
            disabled={!canProceed}
            whileTap={{ scale: 0.97 }}
            className="w-full uppercase text-center transition-all"
            style={{
              fontFamily: 'var(--font-btn)',
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: 'var(--btn-letter-spacing, 3px)',
              color: canProceed ? 'var(--btn-color)' : 'var(--btn-dis-color)',
              background: canProceed ? 'var(--btn-bg)' : 'transparent',
              borderTop: canProceed ? 'var(--btn-bt)' : '1px solid var(--btn-dis-border)',
              borderLeft: canProceed ? 'var(--btn-bl)' : '1px solid var(--btn-dis-border)',
              borderRight: canProceed ? 'var(--btn-br)' : '1px solid var(--btn-dis-border)',
              borderBottom: canProceed ? 'var(--btn-bb)' : '1px solid var(--btn-dis-border)',
              borderRadius: 'var(--btn-radius)',
              padding: '17px 12px',
              boxShadow: canProceed ? 'var(--btn-shadow)' : 'none',
              filter: canProceed ? 'var(--btn-filter, none)' : 'none',
              cursor: canProceed ? 'pointer' : 'not-allowed',
            }}
          >
            Select the Lens
          </motion.button>
        </motion.div>

        {/* Coming soon teaser */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.16 }}
          className="flex flex-col items-center gap-4"
        >
          {/* Coming soon card — pink borders (hcard) */}
          <div
            style={{
              background: 'var(--hcard-bg)',
              borderTop: 'var(--hcard-bt)',
              borderLeft: 'var(--hcard-bl)',
              borderRight: 'var(--hcard-br)',
              borderBottom: 'var(--hcard-bb)',
              borderRadius: 'var(--hcard-radius)',
              padding: '20px 24px',
              width: '100%',
            }}
          >
            <p
              className="uppercase text-center"
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: 1.32,
                lineHeight: '14px',
                color: 'var(--cyan)',
                marginBottom: 8,
              }}
            >
              Coming Soon
            </p>
            <p
              className="uppercase text-center"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 18,
                letterSpacing: 1.44,
                lineHeight: '20px',
                color: 'var(--text-h1)',
                marginBottom: 8,
              }}
            >
              Mind-mapping tool
            </p>
            <p
              className="text-center"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                letterSpacing: 0.52,
                lineHeight: '20px',
                color: 'var(--cyan)',
                marginBottom: 8,
              }}
            >
              Reflect, plan and achieve new horizons with step by step guidance
            </p>
            <p
              className="uppercase text-center"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 10,
                letterSpacing: 1,
                lineHeight: '12px',
                color: 'var(--text-body)',
              }}
            >
              career · health &amp; wellness · creativity · personal development · relationships · travel &amp; finances
            </p>
          </div>

          <p
            className="text-center w-full"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              letterSpacing: 0.52,
              lineHeight: '20px',
              color: 'var(--text-body)',
            }}
          >
            Get on the waitlist to be the first to know
          </p>

          {/* Secondary button — Sign Up */}
          <Link
            href="/sign-up"
            className="uppercase transition-opacity hover:opacity-80 inline-block text-center"
            style={{
              fontFamily: 'var(--font-btn)',
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: 'var(--btn-letter-spacing, 3px)',
              color: 'var(--btn-secondary-color)',
              background: 'var(--btn-secondary-bg)',
              borderTop: 'var(--btn-secondary-bt)',
              borderLeft: 'var(--btn-secondary-bl)',
              borderRight: 'var(--btn-secondary-br)',
              borderBottom: 'var(--btn-secondary-bb)',
              borderRadius: 'var(--btn-radius)',
              padding: '14px 32px',
              boxShadow: 'var(--btn-secondary-shadow)',
            }}
          >
            Sign Up
          </Link>
        </motion.div>

      </div>
    </div>
  )
}
