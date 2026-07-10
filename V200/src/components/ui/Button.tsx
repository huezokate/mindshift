'use client'
// Design-system button (Figma "Buttons" component, Mubv0Ghdm2SPxF42JVsX8M
// node 397:3561). The Figma component has three colour treatments per theme,
// exposed as the structural `variant`s:
//   • primary    → CTA treatment (cyber green / kawaii amber / notepad white+dropshadow)
//   • secondary  → --btn-secondary  (cyber pink / kawaii mint  / notepad green)
//   • secondary2 → --btn-secondary2 (cyber cyan / kawaii pink  / notepad red)
// Plus two SEMANTIC variants for the account dropdown, where Figma paints
// Journal pink/red and Mind Map cyan/mint/green in EVERY theme. Because the
// accent slots are swapped between cyberpunk and kawaii/notepad, these resolve
// to the right family per theme (see resolveFamily) — pass the active `theme`:
//   • journal → pink/red    (cyber secondary, kawaii/notepad secondary2)
//   • mindmap → cyan/mint/green (cyber secondary2, kawaii/notepad secondary)
// Everything is driven by the structural --btn-* token families (see DESIGN-SYSTEM
// "The Rule"), NEVER the raw --cyan/--pink accent slots — those collapse to the
// same magenta in kawaii, which is the bug this component replaces.
import type { CSSProperties, ReactNode } from 'react'
import Icon from '@/components/ui/Icon'

// `primary | secondary | secondary2` map 1:1 onto the structural --btn-* token
// families. `journal | mindmap` are SEMANTIC variants for the account dropdown:
// the Figma dropdown colours Journal pink/red and Mind Map cyan/mint/green in
// every theme, but the underlying accent slots live in different families per
// theme — cyberpunk has secondary=pink / secondary2=cyan, while kawaii & notepad
// have secondary=mint·green / secondary2=pink·red (the slots are swapped). So the
// semantic variant must resolve to the right family per theme (see resolveFamily).
export type ButtonVariant = 'primary' | 'secondary' | 'secondary2' | 'journal' | 'mindmap'

export type ThemeName = 'cyberpunk' | 'kawaii' | 'notepad'

// Resolve a (possibly semantic) variant to a concrete --btn-* token prefix.
// Cyberpunk pink lives in --btn-secondary; kawaii/notepad pink-red in --btn-secondary2.
// Cyberpunk cyan lives in --btn-secondary2; kawaii/notepad mint-green in --btn-secondary.
function resolveFamily(variant: ButtonVariant, theme: ThemeName): string {
  switch (variant) {
    case 'primary':    return '--btn'
    case 'secondary':  return '--btn-secondary'
    case 'secondary2': return '--btn-secondary2'
    case 'journal':    return theme === 'cyberpunk' ? '--btn-secondary' : '--btn-secondary2'
    case 'mindmap':    return theme === 'cyberpunk' ? '--btn-secondary2' : '--btn-secondary'
  }
}

// Maps a resolved token prefix onto its structural style. `p` is the token-name
// prefix so primary reads --btn-bg/--btn-bt/…, secondary reads --btn-secondary-bg/…
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
  /** Theme the variant resolves against — required for the semantic journal/mindmap variants. */
  theme?: ThemeName
  onClick?: () => void
  children: ReactNode
  /** Larger vertical padding for the section-header rows. */
  tall?: boolean
  /** Stretch to fill its container (dropdown rows are full-width). */
  fullWidth?: boolean
  /** Disabled — renders the live treatment at opacity 0.6 (Figma's recipe) and blocks clicks. */
  disabled?: boolean
  /** Leading Material Symbol name (Figma `icon=yes` form). */
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
  variant = 'primary', theme = 'cyberpunk', onClick, children,
  tall = false, fullWidth = false, disabled = false,
  icon, iconSize = 24, type = 'button', ariaLabel, role, style,
}: Props) {
  const family = resolveFamily(variant, theme)
  // Only the primary (CTA) family carries a drop-shadow filter (notepad's offset
  // shadow). It's harmless (none) in the other themes; safe — never overflow:hidden.
  const isPrimary = family === '--btn'
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
        filter: isPrimary ? 'var(--btn-filter, none)' : 'none',
        fontFamily: 'var(--font-btn)',
        fontWeight: 600,
        letterSpacing: 'var(--btn-letter-spacing, 1px)',
        textTransform: 'uppercase',
        width: fullWidth ? '100%' : undefined,
        minHeight: tall ? 56 : 45,
        // Size hierarchy: primary (CTA) 16×12, secondaries 12×8.
        padding: tall ? '12px' : isPrimary ? '12px 16px' : '8px 12px',
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
