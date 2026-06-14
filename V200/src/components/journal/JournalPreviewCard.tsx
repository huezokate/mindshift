'use client'
import { useRouter } from 'next/navigation'
import { FIGURES, portraitFor } from '@/lib/figures'
import { useTheme } from '@/lib/theme'
import type { JournalEntry, SharePlatform } from '@/lib/journal-types'
import Icon from '@/components/ui/Icon'
import SocialIcon from './SocialIcon'

type Props = {
  entry: JournalEntry
  // Tapping the lens footer opens the lens picker. Stubbed for now — the real
  // popup is the next task. Wire the prop cleanly so step 2 drops in.
  onAddLens?: (entryId: string) => void
}

// ── Date label ──────────────────────────────────────────────────────────────
// "2 JUN 2026"-style, derived from created_at (Figma 602:6680).
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
function formatDateLabel(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}


export default function JournalPreviewCard({ entry, onAddLens }: Props) {
  const router = useRouter()
  const { theme } = useTheme()
  const isCyberpunk = theme === 'cyberpunk'
  const isKawaii = theme === 'kawaii'

  // ── Derived content ────────────────────────────────────────────────────────
  // Title is the user's own words, UPPERCASE (per Figma — do NOT sentence-case),
  // first 6 words so the header line stays tidy. Matches the detail-view
  // billboard treatment for visual continuity.
  const title = entry.vent_text.split(/\s+/).filter(Boolean).slice(0, 6).join(' ')

  // One row per lens that resolves to a known figure, paired with the first
  // platform it was shared to (its indicator glyph renders beneath the avatar;
  // undefined → no chip).
  const lensAvatars = entry.lens_responses
    .map(lr => {
      const fig = FIGURES.find(f => f.id === lr.figure_id)
      if (!fig) return null
      return { fig, platform: lr.shares[0]?.platform as SharePlatform | undefined }
    })
    .filter((x): x is { fig: (typeof FIGURES)[number]; platform: SharePlatform | undefined } => x != null)

  const dateLabel = formatDateLabel(entry.created_at)
  const hasLens = lensAvatars.length > 0

  // ── Two tap zones ──────────────────────────────────────────────────────────
  function openDetail() {
    router.push(`/app/journal-v2/${entry.id}`)
  }
  function addLens() {
    if (onAddLens) {
      onAddLens(entry.id)
    } else {
      // Stub: the real lens-picker popup is the next task.
      // eslint-disable-next-line no-console
      console.log('[journal] add lens to entry', entry.id)
    }
  }

  // ── Vent body (tap → detail) ───────────────────────────────────────────────
  // Reuses the input-card surface (cyan accent in cyberpunk) so a saved entry
  // reads as the surface the user originally typed into. -4px bottom margin lets
  // the footer overlap by 4px (Figma 602:6682). Kawaii's 32px-radius post +
  // 32px-radius footer kiss awkwardly when overlapped, so tuck flush there.
  const ventBody = (
    <button
      type="button"
      onClick={openDetail}
      aria-label={`Open journal entry: ${title}`}
      style={{
        appearance: 'none',
        textAlign: 'inherit',
        width: '100%',
        background: 'var(--input-bg)',
        borderTop: 'var(--input-bt)',
        borderLeft: 'var(--input-bl)',
        borderRight: 'var(--input-br)',
        borderBottom: 'var(--input-bb)',
        borderRadius: 'var(--input-radius)',
        boxShadow: 'var(--input-shadow)',
        overflow: 'hidden',
        // notepad drop-shadow must live on an outer wrapper (overflow rule) —
        // the wrapper owns both the filter AND the -4px footer overlap.
        cursor: 'pointer',
        padding: 0,
        display: 'block',
      }}
    >
      <div
        style={{
          background: 'var(--input-header-bg)',
          boxShadow: 'var(--input-header-shadow)',
          padding: '8px 16px 4px',
          borderBottom: '1px solid var(--input-divider)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12,
            letterSpacing: '1.32px', lineHeight: '14px', color: 'var(--cyan)',
            textTransform: 'uppercase', textAlign: 'center', margin: 0,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {title}
        </p>
      </div>
      <div style={{ padding: '8px 16px 12px' }}>
        <p
          style={{
            fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px',
            letterSpacing: isCyberpunk || isKawaii ? '0.52px' : '0.18px',
            // Figma 574:5939 → "C Header green" #EEFFEA on cyberpunk; kawaii/
            // notepad keep their body color (token resolves per theme).
            color: 'var(--preview-body)', margin: 0,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {entry.vent_text}
        </p>
      </div>
    </button>
  )

  // notepad gets the offset drop-shadow on an OUTER wrapper (overflow rule).
  // The wrapper also owns the -4px footer overlap (cyberpunk + notepad).
  const ventBodyWrapped = (
    <div style={{
      width: '100%',
      filter: isCyberpunk || isKawaii ? 'none' : 'var(--card-filter)',
      marginBottom: isKawaii ? 0 : -4,
      position: 'relative', zIndex: 1,
    }}>
      {ventBody}
    </div>
  )

  // ── Avatar stack with per-avatar share badges (Figma 579:6099). ─────────────
  // Each avatar is its own `items-end justify-end` group. The avatar overlaps
  // its 16px badge via mr-[-16px] so the badge tucks into the avatar's
  // bottom-right corner; groups nest by -4px between them (Figma 579:6098 etc).
  // Badge = the single platform this lens was shared to; no share → no badge,
  // and the avatar drops its -16px so nothing is pulled into empty space.
  const avatarStack = (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {lensAvatars.map(({ fig, platform }, i) => {
        const img = portraitFor(fig, theme)
        const last = i === lensAvatars.length - 1
        return (
          <div
            key={fig.id + i}
            style={{
              display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
              // -4px between avatar groups so the badges nest correctly.
              marginRight: last ? 0 : -4,
              position: 'relative', zIndex: i + 1,
            }}
          >
            <div
              style={{
                width: 48, height: 48, borderRadius: '50%',
                // -16px pulls the badge over the avatar's bottom-right corner
                // (Figma LensAvatar mr-[-16px]). Only when a badge follows.
                marginRight: platform ? -16 : 0,
                border: isCyberpunk
                  ? '1px solid var(--green)'
                  : (isKawaii ? '1px solid var(--pink)' : '2px solid var(--pink)'),
                boxShadow: isKawaii ? '0px 2px 8px 0px rgba(130,100,240,0.13)' : undefined,
                background: 'var(--fig-avatar-grad)',
                overflow: 'hidden', flexShrink: 0,
                position: 'relative', zIndex: 1,
              }}
            >
              {img && (
                <img
                  src={img}
                  alt={fig.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </div>
            {/* 16px platform badge tucked at the avatar's bottom-right (Figma
                SocialMediaShareIcons, bg --bg, rounded 4px). Shown only if this
                lens was shared. Non-tappable status indicator (16px is fine). */}
            {platform && (
              <span style={{ position: 'relative', zIndex: 2, display: 'inline-flex', flexShrink: 0 }}>
                <SocialIcon platform={platform} size={16} />
              </span>
            )}
          </div>
        )
      })}
    </div>
  )

  // No-lens invite — tapping the footer opens the lens picker, so frame it as
  // an invitation, not a passive label.
  const applyLensLabel = (color: string) => (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: 'var(--font-btn)', fontWeight: 600, fontSize: 12,
      letterSpacing: '1.5px', color, textTransform: 'uppercase',
    }}>
      Apply a lens
      <Icon name="arrow_forward" size={16} />
    </span>
  )

  // ── Lens footer (tap → onAddLens) — green accent (Figma 574:5940). ──────────
  // Share glyph left, avatar stack + platform indicators right. No-lens → the
  // "Apply a lens →" invite. Per-theme borders so all 3 follow from tokens.
  const footerBorder = isCyberpunk
    ? {
        borderTop: '1px solid var(--green)', borderLeft: '1px solid var(--green)',
        borderRight: '4px solid var(--green)', borderBottom: '4px solid var(--green)',
        borderRadius: 'var(--card-radius)', background: 'var(--card-bg)',
      }
    : isKawaii
      ? {
          borderTop: 'var(--input-bt)', borderLeft: 'var(--input-bl)',
          borderRight: 'var(--input-br)', borderBottom: 'var(--input-bb)',
          borderRadius: '32px', background: 'var(--lens-header-bg)',
          boxShadow: 'inset 4px 0 0 0 var(--green)',
        }
      : {
          borderTop: '1.5px solid var(--green)', borderLeft: '4px solid var(--green)',
          borderRight: '1.5px solid var(--green)', borderBottom: '1.5px solid var(--green)',
          borderRadius: '8px', background: 'var(--card-bg)',
        }

  const footer = (
    <button
      type="button"
      onClick={addLens}
      aria-label={hasLens ? 'Add another lens to this entry' : 'Apply a lens to this entry'}
      style={{
        ...footerBorder,
        // notepad drop-shadow on the footer itself is fine — it isn't clipped.
        filter: isCyberpunk || isKawaii ? 'none' : 'var(--card-filter)',
        appearance: 'none',
        width: '100%',
        minHeight: 56,
        // Figma 574:5940 → p-[8px] all sides (was 8px 12px).
        padding: 8,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8, cursor: 'pointer',
        position: 'relative', zIndex: 2,
      }}
    >
      {/* Share glyph — 40px (Figma 574:5941 size-[40px]). The whole footer is
          the tap target, so the glyph itself need not be 44px. */}
      <span
        aria-hidden
        style={{
          width: 40, height: 40, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: isCyberpunk ? 'var(--green)' : (isKawaii ? 'var(--pink)' : 'var(--green)'),
        }}
      >
        <Icon name="ios_share" size={40} />
      </span>

      {hasLens
        ? avatarStack
        : applyLensLabel(isCyberpunk ? 'var(--green)' : (isKawaii ? 'var(--pink)' : 'var(--green)'))}
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Date label above the card (Figma 602:6680). */}
      <p style={{
        fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12,
        letterSpacing: '1.32px', lineHeight: '14px', color: 'var(--pink)',
        textTransform: 'uppercase', margin: '0 0 6px 2px',
      }}>
        {dateLabel}
      </p>
      {ventBodyWrapped}
      {footer}
    </div>
  )
}
