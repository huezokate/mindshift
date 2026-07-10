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
              {/* Portrait + in-popup nav arrows (icon-only design-system Button) */}
              <div className="flex items-center justify-between w-full">
                <Button variant="secondary" icon="chevron_left" ariaLabel="Previous figure" onClick={e => { e.stopPropagation(); prev() }} />
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
                <Button variant="secondary" icon="chevron_right" ariaLabel="Next figure" onClick={e => { e.stopPropagation(); next() }} />
              </div>

              {/* Fixed-height text area (Kate 2026-07-10): every figure's text
                  block renders in the SAME grid cell — inactive ones invisible —
                  so the area is always as tall as the LONGEST lens and the card,
                  arrows, and bottom buttons never move between figures. */}
              <div style={{ display: 'grid', width: '100%' }}>
                {FIGURES.map(f => (
                  <div
                    key={f.id}
                    aria-hidden={f.id !== fig.id}
                    style={{
                      gridArea: '1 / 1',
                      visibility: f.id === fig.id ? 'visible' : 'hidden',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    }}
                  >
                    <p className="uppercase text-center" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: 1.5, lineHeight: '22px', color: 'var(--violet)', margin: 0 }}>
                      {f.name}
                    </p>
                    <p className="text-center uppercase" style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: 1, color: 'var(--text-sub)', margin: 0 }}>
                      {f.era}
                    </p>
                    <p className="text-center" style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', color: 'var(--text-body)', fontStyle: 'italic', margin: '4px 0 0' }}>
                      &ldquo;{f.quote}&rdquo;
                    </p>
                    <p className="text-center" style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', color: 'var(--text-body)', margin: 0 }}>
                      {f.bio}
                    </p>
                  </div>
                ))}
              </div>

              {error && (
                <p className="text-center" style={{ fontFamily: 'var(--font-body)', fontSize: 12, lineHeight: '16px', color: 'var(--pink)', margin: 0 }}>
                  {error}
                </p>
              )}

              {/* Back = secondary2 (red), Select = secondary (blue) — the
                  positive/negative button rule (Kate 2026-07-10). */}
              <div className="flex gap-3 w-full" style={{ marginTop: 4 }}>
                <div style={{ flex: 1 }}>
                  <Button variant="secondary2" icon="arrow_back" iconSize={16} fullWidth onClick={onBack}>
                    Back
                  </Button>
                </div>
                <div style={{ flex: 1 }}>
                  <Button variant="secondary" disabled={loading} fullWidth onClick={() => onSelect(fig.id)}>
                    {loading ? 'Loading…' : selectLabel}
                  </Button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
