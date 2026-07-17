'use client'
// Design-system theme-selection button (Kate 2026-07-16, born on the landing's
// phone-morph section). One button per theme world, worn in the NOTEPAD
// primary shape with the theme's signature accent as text + outline + paper
// dropshadow: notepad = blue, kawaii = red, cyberpunk = green. The emoji are
// the theme-picker icons — the one sanctioned emoji use in Minds Shift UI.
//
// Interaction model (deviates deliberately from .ds-btn):
//   hover            → grows (scale 1.04, same spring as .ds-btn)
//   selected/pressed → stroke grows 2px OUTWARD (a 0-blur box-shadow ring
//                      around the 1.5px border), so the active button reads
//                      LARGER than its siblings — never smaller (Kate
//                      2026-07-16). Selected additionally sits pressed into
//                      the page — dropshadow gone, button translated into its
//                      place, full opacity. Unselected idle raised at the
//                      0.6 dim recipe.
import type { CSSProperties, MouseEvent } from 'react'

export type ThemeButtonTheme = 'cyberpunk' | 'kawaii' | 'notepad'

// Accents are the notepad palette's own colors (the button always renders in
// the notepad shape regardless of which theme it advertises).
export const THEME_BUTTON_META: Record<ThemeButtonTheme, { emoji: string; name: string; accent: string }> = {
  notepad: { emoji: '📝', name: 'Notepad', accent: 'var(--btn-secondary-color)' },
  kawaii: { emoji: '🎀', name: 'Kawaii', accent: 'var(--btn-secondary2-color)' },
  cyberpunk: { emoji: '👾', name: 'Cyberpunk', accent: 'var(--green)' },
}

type Props = {
  theme: ThemeButtonTheme
  selected?: boolean
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  style?: CSSProperties
}

export default function ThemeButton({ theme, selected = false, onClick, style }: Props) {
  const m = THEME_BUTTON_META[theme]
  return (
    <button
      type="button"
      className="ds-theme-btn uppercase"
      aria-pressed={selected}
      onClick={onClick}
      style={{
        // Accent rides a CSS var so the :active class state can draw the
        // outer ring without fighting these inline declarations (unselected
        // buttons leave boxShadow unset, so the class rule applies).
        ['--tb-accent' as string]: m.accent,
        color: m.accent,
        background: 'var(--btn-bg)',
        border: `1.5px solid ${m.accent}`,
        boxShadow: selected ? `0 0 0 2px ${m.accent}` : undefined,
        borderRadius: 'var(--btn-radius)',
        minHeight: 56,
        padding: '12px 16px',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        fontFamily: 'var(--font-btn)', fontWeight: 600, fontSize: 14,
        letterSpacing: 'var(--btn-letter-spacing, 1px)',
        filter: selected ? 'none' : `drop-shadow(2px 3px 0px ${m.accent})`,
        transform: selected ? 'translate(2px, 3px)' : undefined,
        opacity: selected ? 1 : 0.6,
        cursor: 'pointer',
        ...style,
      }}
    >
      <span style={{ fontSize: 18, lineHeight: 1 }} aria-hidden>
        {m.emoji}
      </span>
      {m.name}
    </button>
  )
}
