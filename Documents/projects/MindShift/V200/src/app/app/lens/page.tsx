'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FIGURES } from '@/lib/figures'
import Image from 'next/image'

const DEMO_VENT =
  'I keep second-guessing my career choice. Everyone around me seems so sure about what they\'re doing, but I\'m constantly wondering if I chose the right path. Maybe I need a completely fresh perspective on all of this.'

export default function LensPage() {
  const router = useRouter()
  const [vent, setVent] = useState(DEMO_VENT)
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('ms_vent')
    if (stored) setVent(stored)
    // No redirect — fall back to demo vent text so the flow is always visible
  }, [])

  async function handleGetPerspective() {
    if (!selected) return
    setLoading(true)
    const figure = FIGURES.find(f => f.id === selected)!
    sessionStorage.setItem('ms_figure_id', figure.id)
    sessionStorage.setItem('ms_figure_name', figure.name)
    sessionStorage.setItem('ms_figure_img', figure.img)
    try {
      const res = await fetch('/api/generate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: vent, figureId: figure.id, systemPrompt: figure.systemPrompt }),
      })
      const data = await res.json()
      sessionStorage.setItem('ms_response', data.response ?? 'No response received.')
    } catch {
      // Demo mode — show a placeholder response
      sessionStorage.setItem(
        'ms_response',
        `"${vent.slice(0, 60)}..." — ${figure.name} would say: every question worth asking already contains its answer. The fact that you doubt yourself means you're paying attention. Most people who seem certain are simply not looking closely enough.`
      )
    }
    router.push('/app/response')
  }

  const selectedFigure = FIGURES.find(f => f.id === selected)

  return (
    <div className="min-h-dvh flex flex-col items-center" style={{ background: 'var(--bg)' }}>
      <div
        className="flex flex-col gap-6 w-full"
        style={{ maxWidth: 440, padding: '40px 24px 32px' }}
      >

        {/* User's quote card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col w-full"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--cyan)',
            borderLeft: '4px solid var(--cyan)',
            borderTop: '4px solid var(--cyan)',
            borderRadius: 4,
            maxHeight: 180,
            overflow: 'hidden',
          }}
        >
          <div
            className="flex items-center"
            style={{ borderBottom: '1px solid var(--cyan)', padding: '8px 16px 4px' }}
          >
            <p
              className="uppercase"
              style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12, letterSpacing: 1.32, lineHeight: '14px', color: 'var(--cyan)' }}
            >
              Your perspective:
            </p>
          </div>
          <div style={{ padding: '12px 16px', overflowY: 'auto' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: 0.52, lineHeight: '20px', color: '#EEFFEA' }}>
              {vent}
            </p>
          </div>
        </motion.div>

        {/* Pick a Lens heading */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center uppercase"
          style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 18, letterSpacing: 1.44, lineHeight: '20px', color: '#EEFFEA' }}
        >
          Pick a Lens
        </motion.p>

        {/* Figure grid — 3 columns */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="grid w-full"
          style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}
        >
          {FIGURES.map((fig, i) => {
            const isSelected = selected === fig.id
            return (
              <motion.button
                key={fig.id}
                onClick={() => setSelected(isSelected ? null : fig.id)}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 + i * 0.025 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-2 transition-all"
                style={{
                  background: isSelected ? 'rgba(0,255,200,0.08)' : 'var(--bg-card2)',
                  border: '1px solid var(--violet)',
                  borderRadius: 2,
                  padding: '13px 9px',
                  boxShadow: isSelected ? '0 0 16px rgba(0,255,200,0.35)' : 'none',
                  cursor: 'pointer',
                }}
              >
                {/* Portrait */}
                <div
                  className="relative rounded-full overflow-hidden flex-shrink-0"
                  style={{
                    width: 64,
                    height: 64,
                    border: isSelected ? '2px solid var(--green)' : '1px solid var(--green)',
                  }}
                >
                  <Image src={fig.img} alt={fig.name} fill className="object-cover" unoptimized />
                </div>

                {/* Name */}
                <p
                  className="w-full text-center uppercase"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    fontSize: 10,
                    letterSpacing: 1.32,
                    lineHeight: '13px',
                    color: 'var(--green)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {fig.name}
                </p>

                {/* Descriptor */}
                <p
                  className="w-full text-center uppercase"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 8,
                    letterSpacing: 0.8,
                    lineHeight: '11px',
                    color: '#EEFFEA',
                  }}
                >
                  {fig.descriptor}
                </p>
              </motion.button>
            )
          })}
        </motion.div>

        {/* Get perspective CTA — appears when a figure is selected */}
        {selected && (
          <motion.button
            key={selected}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleGetPerspective}
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="w-full uppercase text-center transition-all"
            style={{
              fontFamily: 'var(--font-alumni)',
              fontWeight: 600,
              fontSize: 13,
              letterSpacing: 3,
              color: loading ? 'var(--text-muted)' : 'var(--green)',
              background: 'transparent',
              border: '1px solid var(--green)',
              borderBottom: '4px solid var(--green)',
              borderLeft: '4px solid var(--green)',
              borderRadius: 2,
              padding: '17px 12px',
              boxShadow: '0 0 16px rgba(57,255,20,0.2)',
              cursor: loading ? 'wait' : 'pointer',
            }}
          >
            {loading
              ? 'Loading perspective...'
              : `Get ${selectedFigure?.name}'s take`}
          </motion.button>
        )}

      </div>
    </div>
  )
}
