'use client'
// Design-system button (Figma "Buttons" component, Mubv0Ghdm2SPxF42JVsX8M
// node 397:3561). Three structural variants, colored by the active theme's
// --btn-* token families — the theme decides the palette, the variant decides
// the role:
//   • primary    → CTA treatment (cyber green / kawaii amber / notepad white+dropshadow)
//   • secondary  → --btn-secondary  (cyber pink / kawaii mint  / notepad green)
//   • secondary2 → --btn-secondary2 (cyber cyan / kawaii pink  / notepad red)
// `icon` and `disabled` are orthogonal modifiers available on every variant.
// Sizing is role-based: primary is the big one (56 min-height, 16×12 padding),
// secondaries are compact (45 min-height, 12×8). There is no separate tall
// variant — its specs ARE the primary default (per Kate, 2026-07-09).
// Everything is driven by the structural --btn-* token families (see DESIGN-SYSTEM
// "The Rule"), NEVER the raw --cyan/--pink accent slots — those collapse to the
// same magenta in kawaii, which is the bug this component replaces.
import type { CSSProperties, ReactNode } from 'react'
import Icon from '@/components/ui/Icon'

export type ButtonVariant = 'primary' | 'secondary' | 'secondary2'

// Maps a variant onto its structural token prefix: primary reads --btn-bg/--btn-bt/…,
// secondary reads --btn-secondary-bg/…, secondary2 reads --btn-secondary2-bg/…
function variantStyle(p: string): CSSProperties {
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
  /** Stretch to fill its container (dropdown rows are full-width). */
  fullWidth?: boolean
  /** Disabled — renders the live treatment at opacity 0.6 (Figma's recipe) and blocks clicks. */
  disabled?: boolean
  /** Leading Material Symbol name (Figma `icon=yes` form) — available on every variant. */
  icon?: string
  /** Icon glyph size (Figma uses 24; pass smaller for compact buttons). */
  iconSize?: number
  /** Native button type — 'submit' for form CTAs. */
  type?: 'button' | 'submit'
  ariaLabel?: string
  role?: string
  style?: CSSProperties
}

export default function Button({
  variant = 'primary', onClick, children,
  fullWidth = false, disabled = false,
  icon, iconSize = 24, type = 'button', ariaLabel, role, style,
}: Props) {
  const isPrimary = variant === 'primary'
  const family = isPrimary ? '--btn' : `--btn-${variant}`
  return (
    <button
      type={type}
      className="ds-btn"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      role={role}
      style={{
        ...variantStyle(family),
        // Only the primary (CTA) family carries a drop-shadow filter (notepad's
        // offset shadow). Safe — never overflow:hidden.
        filter: isPrimary ? 'var(--btn-filter, none)' : 'none',
        fontFamily: 'var(--font-btn)',
        fontWeight: 600,
        letterSpacing: 'var(--btn-letter-spacing, 1px)',
        textTransform: 'uppercase',
        width: fullWidth ? '100%' : undefined,
        // Size hierarchy: primary is the big role (former "tall" specs are the
        // primary default), secondaries are compact.
        minHeight: isPrimary ? 56 : 45,
        padding: isPrimary ? '12px 16px' : '8px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: icon ? 8 : undefined,
        // Figma disabled = the live treatment dimmed to 0.6 (Kate's chosen recipe).
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : (onClick || type === 'submit' ? 'pointer' : 'default'),
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={iconSize} />}
      {children}
    </button>
  )
}
