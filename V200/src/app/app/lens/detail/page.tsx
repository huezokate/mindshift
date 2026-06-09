'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from '@/lib/theme'
import { FIGURES } from '@/lib/figures'

// DRAFT — "Lens selected" detail. Swipe horizontally through all 15 lenses
// (expanded bio) and make a final choice. Maps to the architecture's
// "Lens selected screen where user can scroll left and right".
export default function LensDetailPage() {
  const router = useRouter()
  const { setTheme } = useTheme()
  useEffect(() => { setTheme('notepad') }, [setTheme])

  return (
    <div className="min-h-dvh flex flex-col" style={{ padding: '20px 0 28px' }}>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ padding: '0 20px', marginBottom: 14 }}>
        <Link
          href="/app/lens"
          style={{ color: 'var(--text-sub)', fontFamily: 'var(--font-body)', fontSize: 13, textDecoration: 'none' }}
        >
          ← Grid
        </Link>
        <p
          style={{
            fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 11, letterSpacing: 1.5,
            textTransform: 'uppercase', color: 'var(--text-sub)', margin: 0,
          }}
        >
          Pick a lens · swipe
        </p>
        <div style={{ width: 44 }} aria-hidden />
      </div>

      {/* Horizontal scroll-snap carousel */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          padding: '4px 20px 16px',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {FIGURES.map(f => (
          <div
            key={f.id}
            style={{
              scrollSnapAlign: 'center',
              flex: '0 0 86%',
              maxWidth: 360,
              background: 'var(--card-bg)',
              border: '1.5px solid var(--pink)',
              borderRadius: 'var(--card-radius)',
              padding: '22px 22px 20px',
              filter: 'var(--card-filter, none)',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            {/* Monogram + name */}
            <div className="flex items-center" style={{ gap: 14 }}>
              <div
                style={{
                  width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--bg)', border: '1.5px solid var(--cyan)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--cyan)' }}>
                  {f.name.replace(/["']/g, '').split(' ').map(w => w[0]).slice(0, 2).join('')}
                </span>
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.3px', color: 'var(--text-h1)', margin: 0 }}>
                  {f.name}
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-sub)', margin: '2px 0 0' }}>
                  {f.era}
                </p>
              </div>
            </div>

            {/* Bio */}
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-body)', margin: 0, flex: 1 }}>
              {f.bio}
            </p>

            {/* Choose CTA */}
            <button
              onClick={() => router.push(`/app/generating?lens=${encodeURIComponent(f.name)}`)}
              style={{
                background: 'var(--btn-bg)', color: 'var(--btn-color)',
                borderTop: 'var(--btn-bt)', borderLeft: 'var(--btn-bl)',
                borderRight: 'var(--btn-br)', borderBottom: 'var(--btn-bb)',
                borderRadius: 'var(--btn-radius)', padding: '13px 12px',
                fontFamily: 'var(--font-btn)', fontWeight: 700, fontSize: 14,
                letterSpacing: 'var(--btn-letter-spacing, -0.5px)', cursor: 'pointer',
                filter: 'var(--btn-filter, none)', width: '100%',
              }}
            >
              Reflect through {f.name.split(' ')[0]} →
            </button>
          </div>
        ))}
      </div>

      <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-meta)', textAlign: 'center', margin: '4px 20px 0' }}>
        Swipe to explore all {FIGURES.length} lenses.
      </p>
    </div>
  )
}
