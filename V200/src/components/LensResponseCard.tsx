'use client'
import { FIGURES } from '@/lib/figures'
import { useTheme } from '@/lib/theme'

type Props = {
  figureId: string
  responseText: string
  createdAt: string
}

export default function LensResponseCard({ figureId, responseText }: Props) {
  const { theme } = useTheme()
  const isKawaii = theme === 'kawaii'
  const isCyberpunk = theme === 'cyberpunk'
  const fig = FIGURES.find(f => f.id === figureId)
  const portrait = fig ? (isKawaii ? fig.imgKawaii : fig.imgCyberpunk) : null

  // ─── Cyberpunk ────────────────────────────────────────────────────────────
  // Unified violet-bordered card, green name, cyan response text, no quote
  if (isCyberpunk) {
    return (
      <div style={{
        background: 'var(--card-bg)',
        borderTop: '1px solid var(--violet)',
        borderLeft: '1px solid var(--violet)',
        borderRight: '4px solid var(--violet)',
        borderBottom: '4px solid var(--violet)',
        borderRadius: 'var(--card-radius)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '4px 16px',
          borderBottom: '1px solid var(--violet)',
        }}>
          <div style={{
            width: 24,
            height: 24,
            borderRadius: 16,
            border: '1px solid var(--pink)',
            background: 'var(--fig-avatar-grad)',
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            {portrait && (
              <img src={portrait} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: '1.32px',
            lineHeight: '14px',
            color: 'var(--green)',
            textTransform: 'uppercase',
          }}>
            {fig?.name ?? figureId}
          </p>
        </div>
        <div style={{ padding: 16 }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            lineHeight: '20px',
            letterSpacing: '0.52px',
            color: 'var(--cyan)',
          }}>
            {responseText}
          </p>
        </div>
      </div>
    )
  }

  // ─── Kawaii ───────────────────────────────────────────────────────────────
  // Split header (lens-header-bg) + body (white), pink inset shadow both,
  // circular avatar, dark name, quote in deep pink, dark response text
  if (isKawaii) {
    return (
      <div>
        <div style={{
          background: 'var(--lens-header-bg)',
          boxShadow: 'inset 4px 0 0 0 var(--cyan)',
          borderTop: 'var(--input-bt)',
          borderLeft: 'var(--input-bl)',
          borderRight: 'var(--input-br)',
          borderBottom: '1px solid var(--input-divider)',
          borderRadius: 'var(--input-radius) var(--input-radius) 0 0',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '8px 16px',
        }}>
          <div style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            border: 'var(--fig-avatar-border)',
            boxShadow: 'var(--fig-avatar-shadow)',
            background: 'var(--fig-avatar-grad)',
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            {portrait && (
              <img src={portrait} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: '0.52px',
            lineHeight: '14px',
            color: 'var(--text-body)',
            textTransform: 'uppercase',
          }}>
            {fig?.name ?? figureId}
          </p>
        </div>
        <div style={{
          background: 'var(--card-bg)',
          boxShadow: 'inset 4px 0 0 0 var(--cyan)',
          borderLeft: 'var(--input-bl)',
          borderRight: 'var(--input-br)',
          borderBottom: 'var(--input-bb)',
          borderRadius: '0 0 var(--input-radius) var(--input-radius)',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          {fig?.quote && (
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              lineHeight: '20px',
              letterSpacing: '0.52px',
              color: 'var(--lens-quote-color)',
              textAlign: 'center',
            }}>
              &ldquo;{fig.quote}&rdquo;
            </p>
          )}
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            lineHeight: '20px',
            letterSpacing: '0.52px',
            color: 'var(--text-body)',
          }}>
            {responseText}
          </p>
        </div>
      </div>
    )
  }

  // ─── Notepad ──────────────────────────────────────────────────────────────
  // Split sections with green borders, drop-shadow on outer, oval avatar,
  // green name, dark body text, no quote
  return (
    <div style={{ filter: 'var(--card-filter)' }}>
      <div style={{
        background: 'var(--card-bg)',
        borderTop: '1.5px solid var(--green)',
        borderLeft: '4px solid var(--green)',
        borderRight: '1.5px solid var(--green)',
        borderRadius: 'var(--card-radius) var(--card-radius) 0 0',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '4px 22px',
      }}>
        <div style={{
          width: 24,
          height: 24,
          borderRadius: 16,
          border: '1px solid var(--pink)',
          background: 'var(--fig-avatar-grad)',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          {portrait && (
            <img src={portrait} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
        </div>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 600,
          fontSize: 12,
          letterSpacing: '0.55px',
          lineHeight: '14px',
          color: 'var(--green)',
          textTransform: 'uppercase',
        }}>
          {fig?.name ?? figureId}
        </p>
      </div>
      <div style={{
        background: 'var(--card-bg)',
        borderLeft: '4px solid var(--green)',
        borderRight: '1.5px solid var(--green)',
        borderBottom: '1.5px solid var(--green)',
        borderRadius: '0 0 var(--card-radius) var(--card-radius)',
        padding: 16,
      }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          lineHeight: '20px',
          letterSpacing: '0.18px',
          color: 'var(--text-body)',
        }}>
          {responseText}
        </p>
      </div>
    </div>
  )
}
