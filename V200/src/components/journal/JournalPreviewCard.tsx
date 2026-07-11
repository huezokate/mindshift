'use client'
import { useRouter } from 'next/navigation'
import { FIGURES, portraitFor } from '@/lib/figures'
import { useTheme } from '@/lib/theme'
import type { JournalEntry, SharePlatform } from '@/lib/journal-types'
import { deriveTitleFallback } from '@/lib/title'
import Icon from '@/components/ui/Icon'
import Button from '@/components/ui/Button'
import SocialIcon from './SocialIcon'

type Props = {
  entry: JournalEntry
  // Tapping the lens footer opens the lens picker. Stubbed for now — the real
  // popup is the next task. Wire the prop cleanly so step 2 drops in.
  onAddLens?: (entryId: string) => void
}

// ── Date label ──────────────────────────────────────────────────────────────
// "2 JUN 2026"-style, derived from created_at (Figma 604:7285).
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
  const isNotepad = theme === 'notepad'

  // ── Derived content ────────────────────────────────────────────────────────
  // Prefer the Gemini "<synonym> on <topic>" title (T-018-07); fall back to the
  // user's first words when a row predates the title column or generation fell
  // back. Rendered UPPERCASE per Figma — do NOT sentence-case.
  const title = entry.title?.trim() || deriveTitleFallback(entry.vent_text)

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
       
      console.log('[journal] add lens to entry', entry.id)
    }
  }

  // ── Vent body (tap → detail) ───────────────────────────────────────────────
  // The "User quote input field" instance (Figma 604:7288 / 604:7472 / 572:5434):
  // card surface (--card-bg) with the theme's input borders, single-line title
  // header, clamped vent preview. -4px bottom margin lets the footer overlap by
  // 4px in ALL themes (Figma keeps mb-[-4px] even on kawaii's 32px radii).
  const ventBody = (
    <button
      type="button"
      onClick={openDetail}
      aria-label={`Open journal entry: ${title}`}
      style={{
        appearance: 'none',
        textAlign: 'inherit',
        width: '100%',
        background: 'var(--card-bg)',
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
      {/* Header — Figma only fills it on kawaii (#e5fcfa); cyberpunk/notepad
          show the card surface. The header/body divider is the input
          component's own bottom border (solid, per theme). */}
      <div
        style={{
          background: isKawaii ? 'var(--input-header-bg)' : 'transparent',
          boxShadow: isKawaii ? 'var(--input-header-shadow)' : 'none',
          padding: isKawaii ? '8px 16px 4px' : '8px 16px 2px',
          borderBottom: 'var(--input-bb)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: isNotepad ? 600 : 700,
            fontSize: 12,
            letterSpacing: isCyberpunk ? '1.32px' : (isKawaii ? '0.52px' : '0.55px'),
            lineHeight: '14px',
            // Figma title color: C Blue / Kawaii text main / Notepad Blue.
            color: isKawaii ? 'var(--text-body)' : 'var(--cyan)',
            textTransform: 'uppercase', textAlign: 'center', margin: 0,
            // Single line with "..." (Figma renders the title nowrap).
            maxWidth: '100%', whiteSpace: 'nowrap',
            overflow: 'hidden', textOverflow: 'ellipsis',
          }}
        >
          {title}
        </p>
      </div>
      <div style={{ padding: isKawaii ? '4px 8px 4px 16px' : '4px 16px' }}>
        <p
          style={{
            fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px',
            letterSpacing: isCyberpunk || isKawaii ? '0.52px' : '0.18px',
            // Figma 574:5939 → "C Header green" #EEFFEA on cyberpunk; kawaii/
            // notepad keep their body color (token resolves per theme).
            color: 'var(--preview-body)', margin: 0,
            // Figma fixes the vent at ~120px; line-clamp approximates it
            // (4 lines cp/kawaii, 3 on notepad's taller header) while letting
            // short vents shrink.
            display: '-webkit-box',
            WebkitLineClamp: isNotepad ? 3 : 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {entry.vent_text}
        </p>
      </div>
    </button>
  )

  // notepad gets the offset drop-shadow on an OUTER wrapper (overflow rule).
  // The wrapper also owns the -4px footer overlap (all themes — Figma 604:7472).
  const ventBodyWrapped = (
    <div style={{
      width: '100%',
      filter: isCyberpunk || isKawaii ? 'none' : 'var(--card-filter)',
      marginBottom: -4,
      position: 'relative', zIndex: 1,
    }}>
      {ventBody}
    </div>
  )

  // ── Avatar stack with per-avatar share badges (Figma 604:7292). ─────────────
  // Each avatar is its own `items-end justify-end` group. The avatar overlaps
  // its 16px badge via mr-[-16px] so the badge tucks into the avatar's
  // bottom-right corner; groups nest by -4px between them (Figma 604:7293 etc).
  // Badge = the single platform this lens was shared to; no share → no badge,
  // and the avatar drops its -16px so nothing is pulled into empty space.
  // Avatar ring per Figma: cyberpunk 1px violet / kawaii 2px pink / notepad
  // 2px green.
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
                  ? '1px solid var(--violet)'
                  : '2px solid var(--' + (isKawaii ? 'pink' : 'green') + ')',
                boxShadow: isKawaii ? 'var(--fig-avatar-shadow)' : undefined,
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

  // ── Lens footer (tap → onAddLens) — green accent (Figma 604:7289). ──────────
  // Status glyph left (share icon when public, lock when private — Figma
  // shared/privat variants), avatar stack OR the "+ Lens" secondary button
  // right. Per-theme borders so all 3 follow from tokens.
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
          // Figma 604:7473 — pink inner stroke, not the teal input one.
          boxShadow: 'inset 4px 0 0 0 var(--pink)',
        }
      : {
          borderTop: '1.5px solid var(--green)', borderLeft: '4px solid var(--green)',
          borderRight: '1.5px solid var(--green)', borderBottom: '1.5px solid var(--green)',
          borderRadius: '8px', background: 'var(--card-bg)',
        }

  const footerStyle = {
    ...footerBorder,
    // notepad drop-shadow on the footer itself is fine — it isn't clipped.
    filter: isCyberpunk || isKawaii ? 'none' : 'var(--card-filter)',
    appearance: 'none' as const,
    width: '100%',
    minHeight: 56,
    // Figma: cyberpunk p-[8px] (604:7289); kawaii/notepad px-16 py-8.
    padding: isCyberpunk ? 8 : '8px 16px',
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    position: 'relative' as const, zIndex: 2,
  }

  // Status glyph — 40px (Figma 604:7290 size-[40px]): share icon on public
  // entries, lock on private ones (Figma shared vs privat variants).
  const statusGlyph = (
    <span
      aria-hidden
      style={{
        width: 40, height: 40, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--preview-glyph)',
      }}
    >
      <Icon name={entry.is_public ? 'ios_share' : 'lock'} size={40} />
    </span>
  )

  // With lenses the whole footer is the tap target; without, the "+ Lens"
  // design-system button (Figma 606:7852 / 606:7843 / 606:7826) is the button,
  // so we don't nest <button> in <button>.
  const footer = hasLens ? (
    <button
      type="button"
      onClick={addLens}
      aria-label="Add another lens to this entry"
      style={{ ...footerStyle, cursor: 'pointer' }}
    >
      {statusGlyph}
      {avatarStack}
    </button>
  ) : (
    <div style={footerStyle}>
      {statusGlyph}
      {/* Icon-only + (Kate 2026-07-11): the visual button language carries it */}
      <Button
        variant="secondary"
        icon="add"
        onClick={addLens}
        ariaLabel="Apply a lens to this entry"
      />
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Date label above the card (Figma 604:7285) — flush against the vent
          card (pb-[4px] mb-[-4px] cancel out). Cyberpunk sets it in the
          12px subhead style; kawaii/notepad in the 10px tooltip style. */}
      <p style={{
        fontFamily: 'var(--font-body)',
        fontWeight: isCyberpunk ? 700 : 400,
        fontSize: isCyberpunk ? 12 : 10,
        lineHeight: isCyberpunk ? '14px' : '12px',
        letterSpacing: isCyberpunk ? '1.32px' : 'var(--btn-subtext-tracking)',
        color: 'var(--pink)',
        textTransform: 'uppercase', margin: 0,
      }}>
        {dateLabel}
      </p>
      {ventBodyWrapped}
      {footer}
    </div>
  )
}
