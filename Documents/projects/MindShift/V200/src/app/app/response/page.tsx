'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { FIGURES } from '@/lib/figures'

const DEMO_FIGURE = FIGURES[0]
const DEMO_RESPONSE =
  'The unexamined life is not worth living — and you, my friend, are doing the examining. Every doubt you feel is a sign of an active mind. Most who seem certain have simply stopped asking questions. Your hesitation is not weakness; it is wisdom in its earliest form. Sit with the discomfort. Let it teach you. The path reveals itself to those who keep walking, not to those who wait for the map.'

export default function ResponsePage() {
  const router = useRouter()
  const [figureName, setFigureName] = useState('')
  const [figureImg, setFigureImg] = useState('')
  const [response, setResponse] = useState('')
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    const name = sessionStorage.getItem('ms_figure_name') ?? ''
    const img = sessionStorage.getItem('ms_figure_img') ?? ''
    const resp = sessionStorage.getItem('ms_response') ?? ''
    setFigureName(name || DEMO_FIGURE.name)
    setFigureImg(img || DEMO_FIGURE.img)
    setResponse(resp || DEMO_RESPONSE)
  }, [])

  // Typewriter effect
  useEffect(() => {
    if (!response) return
    setDisplayed('')
    setDone(false)
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(response.slice(0, i))
      if (i >= response.length) {
        clearInterval(interval)
        setDone(true)
      }
    }, 18)
    return () => clearInterval(interval)
  }, [response])

  return (
    <div className="min-h-dvh flex flex-col items-center" style={{ background: 'var(--bg)' }}>
      <div className="flex flex-col gap-6 w-full" style={{ maxWidth: 440, padding: '40px 24px 32px' }}>

      {/* Figure header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-3 w-full"
      >
        {figureImg && (
          <div
            className="relative w-20 h-20 rounded-full overflow-hidden"
            style={{ border: '2px solid var(--cyan)', boxShadow: 'var(--glow-cyan)' }}
          >
            <Image src={figureImg} alt={figureName} fill className="object-cover" unoptimized />
          </div>
        )}
        <p
          className="uppercase text-[12px] tracking-[1.32px] leading-[14px] text-center"
          style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--cyan)' }}
        >
          {figureName}&apos;s perspective
        </p>
      </motion.div>

      {/* Response terminal card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col w-full flex-1"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--cyan)',
          borderLeft: '4px solid var(--cyan)',
          borderTop: '4px solid var(--cyan)',
          borderRadius: '4px',
          minHeight: '300px',
        }}
      >
        <div
          className="flex items-center px-4 pb-[2px] pt-2 gap-2"
          style={{ borderBottom: '1px solid var(--cyan)' }}
        >
          {/* Terminal dots */}
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--pink)' }} />
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--amber)' }} />
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--green)' }} />
          <p
            className="uppercase text-[10px] tracking-[1.32px] leading-[12px] ml-2"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-sub)' }}
          >
            perspective.exe
          </p>
        </div>
        <div className="px-4 py-4 flex-1">
          <p
            className="text-[13px] tracking-[0.52px] leading-[22px]"
            style={{ fontFamily: 'var(--font-mono)', color: '#EEFFEA' }}
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
            className="w-full py-3 uppercase text-[13px] tracking-[3px] text-center"
            style={{
              fontFamily: 'var(--font-alumni)',
              fontWeight: 600,
              color: 'var(--violet)',
              background: 'transparent',
              border: '1px solid var(--violet)',
              borderBottom: '4px solid var(--violet)',
              borderLeft: '4px solid var(--violet)',
              borderRadius: '2px',
            }}
          >
            Try another lens
          </button>
          <button
            onClick={() => router.push('/app/onboarding')}
            className="w-full py-3 uppercase text-[13px] tracking-[3px] text-center"
            style={{
              fontFamily: 'var(--font-alumni)',
              fontWeight: 600,
              color: 'var(--text-sub)',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '2px',
            }}
          >
            New session
          </button>
        </motion.div>
      )}

      </div>
    </div>
  )
}
