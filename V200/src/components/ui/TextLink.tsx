'use client'
// Design-system text link (Kate 2026-07-11): underlined normal body text (14px)
// in the theme's blue/positive --link-color, padded to the secondary button's
// vertical rhythm (8px) so the tap target clears ~36px without looking like a
// button. Renders a real <a> when given href (next/link), a link-styled
// <button> when given onClick (e.g. disclosure toggles).
import type { CSSProperties, ReactNode } from 'react'
import Link from 'next/link'

type Props = {
  href?: string
  onClick?: () => void
  children: ReactNode
  ariaExpanded?: boolean
  style?: CSSProperties
}

const LINK_STYLE: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  fontFamily: 'var(--font-body)',
  fontWeight: 400,
  fontSize: 14,
  lineHeight: '20px',
  letterSpacing: '0.2px',
  color: 'var(--link-color, var(--cyan))',
  textDecoration: 'underline',
  textUnderlineOffset: 4,
  // Secondary-button vertical padding → ≥36px tap target on a 20px line.
  padding: '8px 4px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
}

export default function TextLink({ href, onClick, children, ariaExpanded, style }: Props) {
  const merged = { ...LINK_STYLE, ...style }
  if (href) {
    return (
      <Link href={href} className="transition-opacity hover:opacity-75" style={merged}>
        {children}
      </Link>
    )
  }
  return (
    <button type="button" onClick={onClick} aria-expanded={ariaExpanded} className="transition-opacity hover:opacity-75" style={merged}>
      {children}
    </button>
  )
}
