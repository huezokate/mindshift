'use client'
// Reusable lens-picker popup — the figure carousel from the vent flow
// (/app/lens). Endless horizontal carousel via the shared CircularArrow (wraps
// Socrates → … → Lenin → Socrates). Presentational: the parent owns what Select
// and Back do (vent flow routes to /app/response; the journal adds a lens to the
// open entry and Back returns to it). Kate, 23 June — "it's solid for now."
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FIGURES, getFigureImg } from '@/lib/figures'
import { useTheme } from '@/lib/theme'
import Icon from '@/components/ui/Icon'
import CircularArrow from '@/components/ui/CircularArrow'
import Button from '@/components/ui/Button'

type Props = {
  open: boolean
  /** Figure index to open on (default 0 = Socrates). */
  startIndex?: number
  loading?: boolean
  selectLabel?: string
  /** Inline error (e.g. tier limit) shown above the buttons; keeps the sheet open. */
  error?: string | null
  onSelect: (figureId: string) => void
  onBack: () => void
}

export default function LensPickerSheet({
  open, startIndex = 0, loading = false, selectLabel = 'Select', error = null, onSelect, onBack,
}: Props) {
  const { theme } = useTheme()
  const [index, setIndex] = useState(startIndex)
  const [prevOpen, setPrevOpen] = useState(open)

  // Reset to the requested start figure each time the sheet opens. Done during
  // render (not in an effect) so React reconciles before paint — no cascade, no
  // flash of the previous figure.
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) setIndex(startIndex)
  }

  const fig = FIGURES[index]
  const prev = () => setIndex(i => (i - 1 + FIGURES.length) % FIGURES.length)
  const next = () => setIndex(i => (i + 1) % FIGURES.length)

  return (
    <AnimatePresence>
      {open && fig && (
        <motion.div
          key="lens-picker-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)', padding: '24px' }}
          onClick={onBack}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={fig.id}
              initial={{ opacity: 0, scale: 0.94, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 8 }}
              transition={{ duration: 0.16 }}
              onClick={e => e.stopPropagation()}
              className="flex flex-col items-center gap-4 w-full"
              style={{
                maxWidth: 320,
                background: 'var(--card-bg)',
                borderTop: 'var(--card-bt)',
                borderLeft: 'var(--card-bl)',
                borderRight: 'var(--card-br)',
                borderBottom: 'var(--card-bb)',
                borderRadius: 'var(--card-radius)',
                padding: '28px 20px 20px',
                boxShadow: 'var(--card-shadow)',
              }}
            >
              {/* Portrait + in-popup nav arrows (shared CircularArrow) */}
              <div className="flex items-center justify-between w-full">
                <CircularArrow direction="prev" ariaLabel="Previous figure" onClick={e => { e.stopPropagation(); prev() }} />
                <div
                  className="overflow-hidden flex-shrink-0"
                  style={{
                    width: 120, height: 120, borderRadius: '50%',
                    background: 'var(--fig-avatar-grad)',
                    border: 'var(--fig-avatar-border)',
                    boxShadow: 'var(--fig-avatar-shadow)',
                  }}
                >
                  <img src={getFigureImg(fig, theme)} alt={fig.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', display: 'block' }} />
                </div>
                <CircularArrow direction="next" ariaLabel="Next figure" onClick={e => { e.stopPropagation(); next() }} />
              </div>

              <p className="uppercase text-center" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: 1.5, lineHeight: '22px', color: 'var(--violet)' }}>
                {fig.name}
              </p>
              <p className="text-center uppercase" style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: 1, color: 'var(--text-sub)', marginTop: -8 }}>
                {fig.era}
              </p>
              <p className="text-center" style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', color: 'var(--text-body)', fontStyle: 'italic' }}>
                &ldquo;{fig.quote}&rdquo;
              </p>
              <p className="text-center" style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', color: 'var(--text-body)' }}>
                {fig.bio}
              </p>

              {error && (
                <p className="text-center" style={{ fontFamily: 'var(--font-body)', fontSize: 12, lineHeight: '16px', color: 'var(--pink)', margin: 0 }}>
                  {error}
                </p>
              )}

              <div className="flex gap-3 w-full" style={{ marginTop: 4 }}>
                <button
                  onClick={onBack}
                  className="flex-1 uppercase flex items-center justify-center"
                  style={{
                    fontFamily: 'var(--font-btn)', fontWeight: 600, fontSize: 13,
                    letterSpacing: 'var(--btn-letter-spacing, 2px)', gap: 6,
                    color: 'var(--btn-secondary-color, var(--text-body))',
                    background: 'var(--btn-secondary-bg)',
                    borderTop: 'var(--btn-bt)', borderLeft: 'var(--btn-bl)',
                    borderRight: 'var(--btn-br)', borderBottom: 'var(--btn-bb)',
                    borderRadius: 'var(--btn-radius)', padding: '12px 8px',
                    boxShadow: 'var(--btn-secondary-shadow)', cursor: 'pointer',
                  }}
                >
                  <Icon name="arrow_back" size={16} />
                  Back
                </button>
                <Button
                  variant="primary"
                  disabled={loading}
                  onClick={() => onSelect(fig.id)}
                  style={{ flex: 1, fontSize: 13, letterSpacing: 'var(--btn-letter-spacing, 2px)', padding: '12px 8px' }}
                >
                  {loading ? 'Loading…' : selectLabel}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
