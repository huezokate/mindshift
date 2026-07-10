'use client'
import { FIGURES, portraitFor } from '@/lib/figures'
import { useTheme } from '@/lib/theme'
import { relativeTime } from '@/lib/relative-time'
import type { LensResponseV2, SharePlatform } from '@/lib/journal-types'

type Props = {
  response: LensResponseV2
  // kept for API symmetry with the detail page (Socials button handles sharing).
  ventText: string
  isEntryPublic: boolean
}

const PLATFORM_LABEL: Record<SharePlatform, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  link: 'Link',
  native: 'Share sheet',
  download: 'Downloaded',
}

// "just now" stays as-is; everything else gets " ago" appended for the share log.
function relativeTimeAgo(iso: string): string {
  const t = relativeTime(iso)
  return t === 'just now' ? t : `${t} ago`
}

// Lens response card. Header is just the figure's avatar + name — the save
// (star) and share icons were removed; sharing lives in the detail page's
// "Socials" button, and signed-in vents auto-save. The "SHARED …" log at the
// foot still shows where this lens was shared.
export default function LensResponseCard({ response }: Props) {
  const { theme } = useTheme()
  const isKawaii = theme === 'kawaii'
  const isCyberpunk = theme === 'cyberpunk'
  const fig = FIGURES.find(f => f.id === response.figure_id)
  const portrait = fig ? portraitFor(fig, theme) : null
  const shares = response.shares ?? []

  const shareBadges = shares.length > 0 && (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 4,
      paddingTop: 12, borderTop: '1px solid rgba(127,127,127,0.18)', marginTop: 12,
    }}>
      <span style={{
        fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '1.2px',
        color: 'var(--text-meta)', textTransform: 'uppercase',
      }}>Shared</span>
      {shares.map(s => (
        <span key={s.id} style={{
          fontFamily: 'var(--font-body)', fontSize: 11,
          color: 'var(--text-sub)', letterSpacing: '0.4px',
        }}>
          <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>{PLATFORM_LABEL[s.platform]}</span>
          <span style={{ color: 'var(--text-meta)' }}> · {relativeTimeAgo(s.shared_at)}</span>
        </span>
      ))}
    </div>
  )

  const name = (
    <p style={{
      flex: 1,
      fontFamily: 'var(--font-body)', fontWeight: isCyberpunk || isKawaii ? 700 : 600,
      fontSize: 12, letterSpacing: isCyberpunk ? '1.32px' : '0.55px',
      lineHeight: '14px',
      color: isKawaii ? 'var(--text-body)' : 'var(--green)',
      textTransform: 'uppercase', margin: 0,
    }}>
      {fig?.name ?? response.figure_id}
    </p>
  )

  const avatar = (size: number, border: string) => (
    <div style={{
      width: size, height: size, borderRadius: '50%', border,
      boxShadow: isKawaii ? 'var(--fig-avatar-shadow)' : undefined,
      background: 'var(--fig-avatar-grad)', overflow: 'hidden', flexShrink: 0,
    }}>
      {portrait && <img src={portrait} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
    </div>
  )

  // ─── Cyberpunk ──────────────────────────────────────────────────────────────
  if (isCyberpunk) {
    return (
      <div style={{
        background: 'var(--card-bg)',
        borderTop: '1px solid var(--violet)', borderLeft: '1px solid var(--violet)',
        borderRight: '4px solid var(--violet)', borderBottom: '4px solid var(--violet)',
        borderRadius: 'var(--card-radius)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '8px 16px', borderBottom: '1px solid var(--violet)',
        }}>
          {avatar(24, '1px solid var(--pink)')}
          {name}
        </div>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {fig?.quote && (
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px',
              letterSpacing: '0.52px', color: 'var(--pink)', textAlign: 'center', margin: 0,
            }}>
              &ldquo;{fig.quote}&rdquo;
            </p>
          )}
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px',
            letterSpacing: '0.52px', color: 'var(--cyan)', margin: 0,
          }}>
            {response.response_text}
          </p>
          {shareBadges}
        </div>
      </div>
    )
  }

  // ─── Kawaii ─────────────────────────────────────────────────────────────────
  if (isKawaii) {
    return (
      <div>
        <div style={{
          background: 'var(--lens-header-bg)', boxShadow: 'inset 4px 0 0 0 var(--cyan)',
          borderTop: 'var(--input-bt)', borderLeft: 'var(--input-bl)', borderRight: 'var(--input-br)',
          borderBottom: '1px solid var(--input-divider)',
          borderRadius: 'var(--input-radius) var(--input-radius) 0 0',
          display: 'flex', alignItems: 'center', gap: 12, padding: '6px 16px',
        }}>
          {avatar(24, 'var(--fig-avatar-border)')}
          {name}
        </div>
        <div style={{
          background: 'var(--card-bg)', boxShadow: 'inset 4px 0 0 0 var(--cyan)',
          borderLeft: 'var(--input-bl)', borderRight: 'var(--input-br)', borderBottom: 'var(--input-bb)',
          borderRadius: '0 0 var(--input-radius) var(--input-radius)', padding: 16,
        }}>
          {fig?.quote && (
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '18px',
              letterSpacing: '0.4px', color: 'var(--lens-quote-color)',
              textAlign: 'center', marginBottom: 8,
            }}>
              &ldquo;{fig.quote}&rdquo;
            </p>
          )}
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px',
            letterSpacing: '0.52px', color: 'var(--text-body)', margin: 0,
          }}>
            {response.response_text}
          </p>
          {shareBadges}
        </div>
      </div>
    )
  }

  // ─── Notepad ────────────────────────────────────────────────────────────────
  return (
    <div style={{ filter: 'var(--card-filter)' }}>
      <div style={{
        background: 'var(--card-bg)',
        borderTop: '1.5px solid var(--green)', borderLeft: '4px solid var(--green)',
        borderRight: '1.5px solid var(--green)',
        borderRadius: 'var(--card-radius) var(--card-radius) 0 0',
        display: 'flex', alignItems: 'center', gap: 10, padding: '6px 16px 6px 22px',
      }}>
        {avatar(24, '1px solid var(--pink)')}
        {name}
      </div>
      <div style={{
        background: 'var(--card-bg)',
        borderLeft: '4px solid var(--green)', borderRight: '1.5px solid var(--green)',
        borderBottom: '1.5px solid var(--green)',
        borderRadius: '0 0 var(--card-radius) var(--card-radius)', padding: 16,
      }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px',
          letterSpacing: '0.18px', color: 'var(--text-body)', margin: 0,
        }}>
          {response.response_text}
        </p>
        {shareBadges}
      </div>
    </div>
  )
}
