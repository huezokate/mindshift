'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/lib/theme'
import { FIGURES, type Figure } from '@/lib/figures'

// "Lens selected" detail — swipe horizontally through all lenses, each as a
// centered card (avatar · name · quote · short bio) with BACK / SELECT.
// Matches Figma 419:8189.
export default function LensDetailPage() {
  const { setTheme } = useTheme()
  useEffect(() => { setTheme('notepad') }, [setTheme])

  return (
    <div className="min-h-dvh flex flex-col justify-center" style={{ padding: '24px 0' }}>
      <div
        style={{
          display: 'flex', gap: 0, overflowX: 'auto', scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {FIGURES.map(f => (
          <div key={f.id} style={{ scrollSnapAlign: 'center', flex: '0 0 100%', padding: '0 24px' }}>
            <LensCard figure={f} />
          </div>
        ))}
      </div>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-meta)', textAlign: 'center', margin: '18px 0 0' }}>
        Swipe to explore all {FIGURES.length} lenses
      </p>
    </div>
  )
}

function LensCard({ figure }: { figure: Figure }) {
  const router = useRouter()
  const shortBio = figure.bio.split('. ')[0].replace(/\.$/, '') + '.'

  return (
    <div className="flex flex-col items-center" style={{ gap: 22 }}>
      {/* The card */}
      <div
        style={{
          width: '100%', maxWidth: 340, background: 'var(--card-bg)',
          border: '1.5px solid var(--green)', borderRadius: 'var(--card-radius)',
          padding: '28px 26px 26px', filter: 'var(--card-filter, none)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center',
        }}
      >
        <Avatar figure={figure} />
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '0.3px', textTransform: 'uppercase', color: 'var(--cyan)', margin: 0, lineHeight: '26px' }}>
          {figure.name}
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: 14, lineHeight: '21px', color: 'var(--pink)', margin: 0 }}>
          “{figure.quote}”
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, lineHeight: '21px', color: 'var(--text-body)', margin: 0 }}>
          {shortBio}
        </p>
      </div>

      {/* Underlined CTAs */}
      <div className="flex items-center justify-center" style={{ gap: 36 }}>
        <CtaLink color="var(--pink)" onClick={() => router.push('/app/lens')} label="← Back" />
        <CtaLink color="var(--green)" onClick={() => router.push(`/app/generating?lens=${encodeURIComponent(figure.name)}`)} label="⊘ Select" />
      </div>
    </div>
  )
}

function CtaLink({ color, label, onClick }: { color: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none', border: 'none', borderBottom: `1.5px solid ${color}`, cursor: 'pointer',
        color, fontFamily: 'var(--font-btn)', fontWeight: 700, fontSize: 13, letterSpacing: 1.5,
        textTransform: 'uppercase', padding: '4px 10px 6px',
      }}
    >
      {label}
    </button>
  )
}

function Avatar({ figure }: { figure: Figure }) {
  const [err, setErr] = useState(false)
  const initials = figure.name.replace(/["']/g, '').split(' ').map(w => w[0]).slice(0, 2).join('')
  return (
    <div
      style={{
        width: 92, height: 92, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
        background: 'var(--bg)', border: '2px solid var(--pink)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {err ? (
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, color: 'var(--pink)' }}>{initials}</span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={figure.imgNotepad} alt={figure.name} onError={() => setErr(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
    </div>
  )
}
