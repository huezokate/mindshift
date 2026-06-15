'use client'
// Design-system button (Figma "Buttons" component, Mubv0Ghdm2SPxF42JVsX8M
// node 397:3561). The Figma component has three colour treatments per theme —
// here exposed as `variant`:
//   • primary    → CTA treatment   (cyber green / kawaii yellow / notepad white)
//   • secondary  → Figma "green"   (cyber cyan  / kawaii mint   / notepad green underline)
//   • secondary2 → Figma "red"     (cyber pink  / kawaii pink   / notepad red underline)
// Everything is driven by the structural --btn-* token families (see DESIGN-SYSTEM
// "The Rule"), NEVER the raw --cyan/--pink accent slots — those collapse to the
// same magenta in kawaii, which is the bug this component replaces. Drive the
// variant off the SEMANTIC role of the button and all three themes follow.
import type { CSSProperties, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'secondary2'

// Maps a variant onto its structural token family. `p` is the token-name prefix
// so primary reads --btn-bg/--btn-bt/…, secondary reads --btn-secondary-bg/…, etc.
function variantStyle(variant: ButtonVariant): CSSProperties {
  const p =
    variant === 'primary' ? '--btn'
    : variant === 'secondary' ? '--btn-secondary'
    : '--btn-secondary2'
  return {
    background: `var(${p}-bg)`,
    color: `var(${p}-color, var(--btn-color))`,
    borderTop: `var(${p}-bt)`,
    borderLeft: `var(${p}-bl)`,
    borderRight: `var(${p}-br)`,
    borderBottom: `var(${p}-bb)`,
    borderRadius: `var(${p}-radius)`,
    boxShadow: `var(${p}-shadow, none)`,
  }
}

type Props = {
  variant?: ButtonVariant
  onClick?: () => void
  children: ReactNode
  /** Larger vertical padding for the section-header rows. */
  tall?: boolean
  /** Stretch to fill its container (dropdown rows are full-width). */
  fullWidth?: boolean
  ariaLabel?: string
  role?: string
  style?: CSSProperties
}

export default function Button({
  variant = 'primary', onClick, children,
  tall = false, fullWidth = false, ariaLabel, role, style,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      role={role}
      style={{
        ...variantStyle(variant),
        // Notepad CTA carries its offset drop-shadow via --btn-filter; harmless
        // (none) in the other themes. Safe here — the button is not overflow:hidden.
        filter: variant === 'primary' ? 'var(--btn-filter, none)' : 'none',
        fontFamily: 'var(--font-btn)',
        fontWeight: 600,
        letterSpacing: 'var(--btn-letter-spacing, 1px)',
        textTransform: 'uppercase',
        width: fullWidth ? '100%' : undefined,
        minHeight: tall ? 56 : 45,
        padding: tall ? '12px' : '8px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </button>
  )
}
