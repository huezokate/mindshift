'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import ThemeSwitcher from '@/components/ThemeSwitcher'

const fade = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
const stagger = { show: { transition: { staggerChildren: 0.12 } } }

export default function WelcomePage() {
  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'var(--bg)', padding: '40px 24px' }}
    >
      {/* Ambient glow blobs — cyberpunk only, hidden by CSS in other themes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 rounded-full blur-3xl"
          style={{ width: 600, height: 400, opacity: 0.1, background: 'radial-gradient(circle, var(--cyan), transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 right-0 rounded-full blur-3xl"
          style={{ width: 400, height: 300, opacity: 0.08, background: 'radial-gradient(circle, var(--violet), transparent 70%)' }}
        />
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center gap-8 w-full"
        style={{ maxWidth: 440 }}
      >
        {/* Main card */}
        <motion.div
          variants={fade}
          className="w-full flex flex-col gap-6 items-center"
          style={{
            background: 'var(--card-bg)',
            borderTop: 'var(--card-bt)',
            borderLeft: 'var(--card-bl)',
            borderRight: 'var(--card-br)',
            borderBottom: 'var(--card-bb)',
            borderRadius: 'var(--card-radius)',
            padding: '40px 24px',
            boxShadow: 'var(--card-shadow)',
            filter: 'var(--card-filter, none)',
          }}
        >
          <motion.h1
            variants={fade}
            className="text-center uppercase"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 36,
              letterSpacing: 6,
              color: 'var(--cyan)',
              textShadow: 'var(--glow-cyan)',
              lineHeight: 1,
            }}
          >
            MindShift
          </motion.h1>

          <motion.p
            variants={fade}
            className="text-center uppercase"
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: 1.4,
              lineHeight: '14px',
              color: 'var(--green)',
            }}
          >
            You&apos;re not lost.
            <br />
            Just looking at the map upside down.
          </motion.p>

          <motion.p
            variants={fade}
            className="text-center"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              letterSpacing: 0.5,
              lineHeight: '20px',
              color: 'var(--text-sub)',
            }}
          >
            A perspective-shifting space for anyone who&apos;s ever thought &ldquo;I know, but also… do I?&rdquo;
            <br /><br />
            MindShift helps you explore what you already know from angles you haven&apos;t tried yet.
          </motion.p>

          <motion.div variants={fade}>
            <Link
              href="/app/onboarding"
              className="inline-block text-center uppercase transition-opacity hover:opacity-80 active:scale-95"
              style={{
                fontFamily: 'var(--font-btn)',
                fontWeight: 600,
                fontSize: 13,
                letterSpacing: 'var(--btn-letter-spacing, 3px)',
                color: 'var(--btn-color)',
                background: 'var(--btn-bg)',
                borderTop: 'var(--btn-bt)',
                borderLeft: 'var(--btn-bl)',
                borderRight: 'var(--btn-br)',
                borderBottom: 'var(--btn-bb)',
                borderRadius: 'var(--btn-radius)',
                padding: '14px 32px',
                boxShadow: 'var(--btn-shadow)',
                filter: 'var(--btn-filter, none)',
              }}
            >
              Enter the Space
            </Link>
          </motion.div>
        </motion.div>

        {/* Theme switcher */}
        <motion.div variants={fade} className="flex justify-center">
          <ThemeSwitcher />
        </motion.div>

        {/* Disclaimer */}
        <motion.div variants={fade} className="flex flex-col gap-3 w-full text-center">
          <p
            className="uppercase"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 11, letterSpacing: 1.3, lineHeight: '14px', color: 'var(--cyan)' }}
          >
            A few things before we begin:
          </p>
          <p
            style={{ fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: 0.5, lineHeight: '18px', color: 'var(--text-sub)' }}
          >
            MindShift is a space for reflection, not a substitute for professional mental health support.
          </p>
          <p
            className="uppercase"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 11, letterSpacing: 1.3, lineHeight: '14px', color: 'var(--text-sub)' }}
          >
            Nothing here is clinical advice.
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
