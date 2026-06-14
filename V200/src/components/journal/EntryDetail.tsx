'use client'
import { useRef, useState } from 'react'
import { useTheme } from '@/lib/theme'
import LensCard from './LensCard'
import ShareSheet from './ShareSheet'
import UpcomingChip from './UpcomingChip'
import type { JournalEntry, LensResponseV2, SharePlatform } from '@/lib/journal-types'

type Props = {
  entry: JournalEntry
}

// ── Icons (Material symbols, traced to match Figma 602:6446) ────────────────
function CommentIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden style={{ display: 'block' }}>
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
    </svg>
  )
}

function PaletteIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden style={{ display: 'block' }}>
      <path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.2-.64-1.67-.08-.1-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8 8 8.67 8 9.5 7.33 11 6.5 11zm3-4C8.67 7 8 6.33 8 5.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 8 17.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
    </svg>
  )
}

function ShareIosIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden style={{ display: 'block' }}>
      <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z" />
    </svg>
  )
}

// Brain-icon medallion that sits between the two MINDSHIFT wordmarks in the
// decorative billboard row (Figma 469:4224 → Component1 / psychology_alt).
function BrainMedallion() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden style={{ display: 'block' }}>
      <path d="M13 3c-3.31 0-6 2.69-6 6 0 1.66.67 3.16 1.76 4.24L7 14.5V17a1 1 0 0 0 1 1h2v1a2 2 0 0 0 4 0v-3.07A6 6 0 0 0 13 3zm0 2a4 4 0 0 1 .5 7.97V15h-3v-1.34l-.7-.7A4 4 0 0 1 13 5z" />
      <circle cx="13" cy="9" r="1.4" />
    </svg>
  )
}

export default function EntryDetail({ entry }: Props) {
  const { theme } = useTheme()
  const isKawaii = theme === 'kawaii'
  const isCyberpunk = theme === 'cyberpunk'

  const [activeLens, setActiveLens] = useState(0)
  // Detail-page ShareSheet is opened from the "Socials" button beneath the
  // active lens card (Figma 602:6457). It shares the active lens's quote card.
  const [shareLens, setShareLens] = useState<LensResponseV2 | null>(null)
  const lensScrollRef = useRef<HTMLDivElement>(null)

  const lenses = entry.lens_responses

  // Title is rendered UPPERCASE here to match Figma (469:4275) — this is the
  // detail view's billboard treatment, distinct from the feed's sentence-case.
  const title = entry.vent_text.split(/\s+/).filter(Boolean).slice(0, 6).join(' ')

  function onShared(platform: SharePlatform) {
    // Preview/QA: the share log POST will 401 without auth; we don't mutate
    // local share state here since the detail page reflects server data.
    void platform
  }

  // ── Header: minimal avatar/logo medallion pinned top-right (Figma 602:6952) ─
  const header = (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
      padding: 8, width: '100%',
    }}>
      <div
        aria-hidden
        style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'var(--bg)',
          border: isCyberpunk
            ? '2px solid var(--green)'
            : (isKawaii ? '2px solid var(--pink)' : '1.5px solid var(--cyan)'),
          boxShadow: 'var(--fig-avatar-shadow)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: isCyberpunk ? 'var(--green)' : (isKawaii ? 'var(--pink)' : 'var(--cyan)'),
          flexShrink: 0,
        }}
      >
        <BrainMedallion />
      </div>
    </div>
  )

  // ── Full vent card — reuses the input-card surface (Figma 469:4275). ────────
  const ventCard = (
    <div
      style={{
        background: 'var(--input-bg)',
        borderTop: 'var(--input-bt)',
        borderLeft: 'var(--input-bl)',
        borderRight: 'var(--input-br)',
        borderBottom: 'var(--input-bb)',
        borderRadius: 'var(--input-radius)',
        boxShadow: 'var(--input-shadow)',
        overflow: 'hidden',
        // notepad's drop-shadow needs an outer wrapper, not an overflow:hidden
        // element — apply via wrapper below instead. Here keep it visual-only.
        width: '100%',
      }}
    >
      <div style={{
        background: 'var(--input-header-bg)',
        boxShadow: 'var(--input-header-shadow)',
        padding: '8px 16px 2px',
        borderBottom: '1px solid var(--input-divider)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12,
          letterSpacing: '1.32px', lineHeight: '14px', color: 'var(--cyan)',
          textTransform: 'uppercase', textAlign: 'center', margin: 0,
        }}>
          {title}
        </p>
      </div>
      <div style={{ padding: '8px 16px 14px' }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px',
          letterSpacing: isKawaii ? '0.52px' : (isCyberpunk ? '0.52px' : '0.18px'),
          color: isCyberpunk ? 'var(--text-sub)' : 'var(--text-body)',
          margin: 0,
        }}>
          {entry.vent_text}
        </p>
      </div>
    </div>
  )

  // notepad gets the offset drop-shadow on an OUTER wrapper (overflow rule).
  const ventCardWrapped = (
    <div style={{ width: '100%', filter: isCyberpunk || isKawaii ? 'none' : 'var(--card-filter)' }}>
      {ventCard}
    </div>
  )

  // ── MINDSHIFT ◇ MINDSHIFT billboard (Figma 469:4224 decorative row). ────────
  // Full version: two wordmarks flanking the brain-icon medallion. Token-driven.
  const wordmark = (
    <span style={{
      fontFamily: 'var(--font-display)', fontWeight: 700,
      fontSize: 18, letterSpacing: '3px', lineHeight: 1,
      color: 'var(--cyan)', textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      MindShift
    </span>
  )

  const billboard = (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 10, width: '100%', padding: '4px 0',
      overflow: 'hidden',
    }}>
      <span style={{ flex: 1, height: 2, background: 'var(--cyan)', opacity: 0.35, minWidth: 4 }} />
      {wordmark}
      <span
        aria-hidden
        style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--bg)',
          border: isCyberpunk ? '1.5px solid var(--violet)' : '1.5px solid var(--cyan)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: isCyberpunk ? 'var(--violet)' : 'var(--cyan)',
          flexShrink: 0,
        }}
      >
        <BrainMedallion />
      </span>
      {wordmark}
      <span style={{ flex: 1, height: 2, background: 'var(--cyan)', opacity: 0.35, minWidth: 4 }} />
    </div>
  )

  // ── Button row beneath each lens card (Figma 602:6448). ─────────────────────
  // Single right-aligned row: Chat with lens · Decorate · Socials, gap-[4px],
  // items-start, justify-end. Chat + Decorate are disabled (opacity-60) and each
  // carries an "upcoming" chip pulled over its top-right corner via the Figma
  // mr-[-72px] trick. Socials is the only live action → opens ShareSheet.
  function buttonRow(lens: LensResponseV2) {
    // Button Primary — border t-4 l-4 r b green, rounded 2px (Figma 602:6457).
    const btnBase = {
      background: 'var(--bg)',
      borderTop: '4px solid var(--green)',
      borderLeft: '4px solid var(--green)',
      borderRight: '1px solid var(--green)',
      borderBottom: '1px solid var(--green)',
      borderRadius: 2,
      color: 'var(--green)',
      display: 'flex', flexDirection: 'column' as const,
      alignItems: 'center', justifyContent: 'center', gap: 4,
      // Figma pt-[8px] pr-[9px] pb-[5px] pl-[12px].
      padding: '8px 9px 5px 12px',
    }

    const btnLabel = {
      fontFamily: 'var(--font-btn)', fontWeight: 600, fontSize: 14,
      letterSpacing: '3px', lineHeight: '16px',
      textTransform: 'uppercase' as const, textAlign: 'center' as const,
    }

    // Disabled coming-soon button + its overlapping "upcoming" chip. The button
    // pulls -72px right (Figma mr-[-72px]) so the trailing chip lands over its
    // top-right corner; items-start keeps the chip pinned to the top edge.
    const comingSoon = (
      icon: React.ReactNode,
      label: string,
    ) => (
      <div style={{ display: 'flex', alignItems: 'flex-start', flexShrink: 0 }}>
        <button
          type="button"
          disabled
          aria-disabled="true"
          title={`${label} — coming soon`}
          style={{ ...btnBase, marginRight: -72, opacity: 0.6, cursor: 'not-allowed' }}
        >
          {icon}
          <span style={btnLabel}>{label}</span>
        </button>
        <UpcomingChip />
      </div>
    )

    return (
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
        gap: 4, width: '100%',
      }}>
        {comingSoon(<CommentIcon />, 'Chat with lens')}
        {comingSoon(<PaletteIcon />, 'Decorate')}
        {/* Socials — active, opens ShareSheet. ~57px tall ≥ 44px tap target. */}
        <button
          type="button"
          onClick={() => setShareLens(lens)}
          aria-label="Share this lens to social media"
          style={{ ...btnBase, flexShrink: 0, cursor: 'pointer' }}
        >
          <ShareIosIcon />
          <span style={btnLabel}>Socials</span>
        </button>
      </div>
    )
  }

  // ── Lens carousel item: LensCard + its button row. ──────────────────────────
  function lensItem(lens: LensResponseV2) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <LensCard
          response={lens}
          ventText={entry.vent_text}
          isEntryPublic={entry.is_public}
        />
        {buttonRow(lens)}
      </div>
    )
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      {header}

      <div style={{
        display: 'flex', flexDirection: 'column', gap: 16,
        padding: '0 16px', width: '100%',
      }}>
        {ventCardWrapped}

        {lenses.length > 0 && billboard}

        {/* Carousel — peek next card + page-dots (Figma 602:6521). Single-lens
            entries render full-width with no carousel plumbing. */}
        {lenses.length === 0 ? null : lenses.length === 1 ? (
          lensItem(lenses[0])
        ) : (
          <>
            <div
              ref={lensScrollRef}
              onScroll={(e) => {
                const el = e.currentTarget
                // One "page" = card width (clientWidth - 48px insets) + 8px gap.
                const page = el.clientWidth - 48 + 8
                const idx = Math.round(el.scrollLeft / page)
                if (idx !== activeLens) {
                  setActiveLens(Math.min(Math.max(idx, 0), lenses.length - 1))
                }
              }}
              style={{
                display: 'flex', gap: 8, overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
                paddingBottom: 4,
                scrollbarWidth: 'none',
                // Break out of the parent's 16px gutter to full width, then own
                // the Figma geometry: 24px side padding (scroll-padding snaps
                // cards to the 24px inset), 8px gap, card = 100%-48px so the
                // next card peeks ~16px (Figma 602:6521).
                marginLeft: -16, marginRight: -16,
                paddingLeft: 24, paddingRight: 24,
                scrollPaddingLeft: 24, scrollPaddingRight: 24,
              }}
            >
              {lenses.map(lr => (
                <div key={lr.id} style={{
                  flex: '0 0 calc(100% - 48px)', scrollSnapAlign: 'start',
                }}>
                  {lensItem(lr)}
                </div>
              ))}
            </div>

            {/* Page-dots — one per lens, clickable, aria-labelled. */}
            <div style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              gap: 6, paddingTop: 2,
            }}>
              {lenses.map((lr, i) => {
                const active = i === activeLens
                return (
                  <button
                    key={lr.id}
                    type="button"
                    aria-label={`Go to lens ${i + 1} of ${lenses.length}`}
                    aria-current={active}
                    onClick={() => {
                      const el = lensScrollRef.current
                      // page = card width (clientWidth - 48px) + 8px gap.
                      if (el) el.scrollTo({ left: i * (el.clientWidth - 48 + 8), behavior: 'smooth' })
                      setActiveLens(i)
                    }}
                    style={{
                      // 6px visual dot inside a 44px-tall hit area for a11y.
                      width: active ? 18 : 6, height: 6, borderRadius: 3,
                      background: active ? 'var(--violet)' : 'var(--text-muted)',
                      border: 'none', padding: 0, cursor: 'pointer',
                      transition: 'width 0.2s ease, background 0.2s ease',
                    }}
                  />
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* spacer so the last card clears the bottom of the viewport */}
      <div style={{ height: 40 }} />

      {shareLens && (
        <ShareSheet
          responseId={shareLens.id}
          figureId={shareLens.figure_id}
          responseText={shareLens.response_text}
          ventText={entry.vent_text}
          isEntryPublic={entry.is_public}
          onClose={() => setShareLens(null)}
          onShared={onShared}
        />
      )}
    </div>
  )
}
