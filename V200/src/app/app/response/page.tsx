'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FIGURES } from '@/lib/figures'
import ThemeSwitcher from '@/components/ThemeSwitcher'

const DEMO_FIGURE = FIGURES[0]
const DEMO_RESPONSE =
  'The unexamined life is not worth living — and you, my friend, are doing the examining. Every doubt you feel is a sign of an active mind. Most who seem certain have simply stopped asking questions. Your hesitation is not weakness; it is wisdom in its earliest form. Sit with the discomfort. Let it teach you. The path reveals itself to those who keep walking, not to those who wait for the map.'

export default function ResponsePage() {
  const router = useRouter()
  const [figureName, setFigureName] = useState('')
  const [response, setResponse] = useState('')
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    const name = sessionStorage.getItem('ms_figure_name') ?? ''
    const resp = sessionStorage.getItem('ms_response') ?? ''
    setFigureName(name || DEMO_FIGURE.name)
    setResponse(resp || DEMO_RESPONSE)
  }, [])

  useEffect(() => {
    if (!response) return
    setDisplayed('')
    setDone(false)
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(response.slice(0, i))
      if (i >= response.length) { clearInterval(interval); setDone(true) }
    }, 18)
    return () => clearInterval(interval)
  }, [response])

  const initial = figureName ? figureName[0].toUpperCase() : '?'

  return (
    <div className="min-h-dvh flex flex-col items-center" style={{ background: 'var(--bg)' }}>
      <div className="flex flex-col gap-6 w-full" style={{ maxWidth: 440, padding: '40px 24px 32px' }}>

        {/* Figure header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 w-full"
        >
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'var(--fig-area-bg)',
              border: '2px solid var(--cyan)',
              boxShadow: 'var(--glow-cyan)',
            }}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, color: 'var(--fig-initial-sel)' }}>
              {initial}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-sub)' }}>
              perspective:
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text-body)' }}>
              {figureName}
            </p>
          </div>
        </motion.div>

        {/* Response terminal card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col w-full flex-1"
          style={{
            background: 'var(--card-bg)',
            borderTop: 'var(--card-bt)',
            borderLeft: 'var(--card-bl)',
            borderRight: 'var(--card-br)',
            borderBottom: 'var(--card-bb)',
            borderRadius: 'var(--card-radius)',
            minHeight: 300,
            boxShadow: 'var(--card-shadow)',
            filter: 'var(--card-filter, none)',
          }}
        >
          <div
            className="flex items-center px-4 pb-[2px] pt-2 gap-2"
            style={{ borderBottom: `1px solid var(--input-divider)` }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: 'var(--pink)' }} />
            <span className="w-2 h-2 rounded-full" style={{ background: 'var(--amber)' }} />
            <span className="w-2 h-2 rounded-full" style={{ background: 'var(--green)' }} />
            <p
              className="uppercase text-[10px] tracking-[1.32px] leading-[12px] ml-2"
              style={{ fontFamily: 'var(--font-body)', color: 'var(--text-sub)' }}
            >
              perspective.exe
            </p>
          </div>
          <div className="px-4 py-4 flex-1">
            <p
              style={{ fontFamily: 'var(--font-body)', fontSize: 13, letterSpacing: 0.52, lineHeight: '22px', color: 'var(--text-body)' }}
            >
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

        {/* Action row */}
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3 w-full"
          >
            <button
              onClick={() => router.push('/app/lens')}
              className="w-full py-3 uppercase text-center"
              style={{
                fontFamily: 'var(--font-btn)',
                fontWeight: 600,
                fontSize: 13,
                letterSpacing: 'var(--btn-letter-spacing, 3px)',
                color: 'var(--violet)',
                background: 'transparent',
                borderTop: '1px solid var(--violet)',
                borderLeft: 'var(--btn-bl, 1px solid var(--violet))',
                borderRight: '1px solid var(--violet)',
                borderBottom: 'var(--btn-bb, 1px solid var(--violet))',
                borderRadius: 'var(--btn-radius)',
              }}
            >
              Try another lens
            </button>
            <button
              onClick={() => router.push('/app/onboarding')}
              className="w-full py-3 uppercase text-center"
              style={{
                fontFamily: 'var(--font-btn)',
                fontWeight: 600,
                fontSize: 13,
                letterSpacing: 'var(--btn-letter-spacing, 3px)',
                color: 'var(--text-sub)',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 'var(--btn-radius)',
              }}
            >
              New session
            </button>
          </motion.div>
        )}

        {/* Theme switcher */}
        <div className="flex justify-center">
          <ThemeSwitcher />
        </div>

      </div>
    </div>
  )
}
