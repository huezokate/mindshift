'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useTheme } from '@/lib/theme'

// DRAFT — the "lens response generating" screen (no prior design).
// Sits between lens selection and the response. Auto-advances in the demo.
const LINES = [
  'Reading what you wrote…',
  'Finding the right angle…',
  'Letting them think it over…',
  'Choosing their words…',
]

export default function GeneratingPage() {
  return (
    <Suspense fallback={null}>
      <Generating />
    </Suspense>
  )
}

function Generating() {
  const router = useRouter()
  const params = useSearchParams()
  const { setTheme } = useTheme()
  const lens = params.get('lens') ?? 'your lens'
  const [line, setLine] = useState(0)

  useEffect(() => { setTheme('notepad') }, [setTheme])

  useEffect(() => {
    const cycle = setInterval(() => setLine(l => (l + 1) % LINES.length), 1400)
    const go = setTimeout(() => router.push('/app/response'), LINES.length * 1400)
    return () => { clearInterval(cycle); clearTimeout(go) }
  }, [router])

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center"
      style={{ padding: '24px', gap: 28 }}
    >
      {/* Pulsing monogram */}
      <motion.div
        animate={{ scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: 92,
          height: 92,
          borderRadius: '50%',
          background: 'var(--card-bg)',
          border: '1.5px solid var(--pink)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          filter: 'var(--card-filter, none)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 34,
            color: 'var(--pink)',
            lineHeight: 1,
          }}
        >
          ✦
        </span>
      </motion.div>

      <div className="flex items-center" style={{ gap: 6 }}>
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.18 }}
            style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--cyan)' }}
          />
        ))}
      </div>

      <div className="flex flex-col items-center" style={{ gap: 6, textAlign: 'center', maxWidth: 320 }}>
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: '-0.4px',
            color: 'var(--text-h1)',
            margin: 0,
          }}
        >
          Channeling {lens}…
        </p>
        <motion.p
          key={line}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            lineHeight: '20px',
            color: 'var(--text-sub)',
            margin: 0,
          }}
        >
          {LINES[line]}
        </motion.p>
      </div>
    </div>
  )
}
