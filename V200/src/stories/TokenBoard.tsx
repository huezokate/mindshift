'use client'
// TokenBoard (T-023-04) — the "does the system hang together?" reference board.
//
// Renders the raw design tokens (colors, typography, buttons, radii) for all three
// themes SIDE BY SIDE in one view, sourced live from the CSS custom properties so
// the page never drifts from tokens.css / tokens-kawaii.css / tokens-notepad.css.
//
// The wall this solves: theme skins are scoped to `html[data-theme="…"]` (cyberpunk
// on bare :root), so a wrapper <div data-theme="kawaii"> inherits cyberpunk — you
// cannot show three live themes by nesting divs, and hardcoding hex would drift.
// Instead we CAPTURE each theme's resolved values once at mount by transiently
// setting `data-theme` on <html> and reading a real-property probe, then render each
// column with those resolved values injected as inline CSS variables. That also lets
// a real <Button> inside a column render that theme's treatment (it reads --btn-*
// from its cascade), so we reuse the T-023-01 matrix instead of a replica.
//
// Storybook-only. Imports nothing from the app except the real Button.
import { useLayoutEffect, useState, type CSSProperties } from 'react'
import Button from '@/components/ui/Button'

// ── Themes ────────────────────────────────────────────────────────────────────
const THEMES = [
  { key: 'cyberpunk', title: 'Cyberpunk' },
  { key: 'kawaii', title: 'Kawaii' },
  { key: 'notepad', title: 'Notepad' },
] as const
type ThemeKey = (typeof THEMES)[number]['key']

// ── Token catalog ───────────────────────────────────────────────────────────────
// `kind` selects how a token is RESOLVED to a literal (a raw custom-property read
// returns unresolved `var(...)` for aliased tokens, so we bounce each one through a
// matching real CSS property on a probe and read it back).
type Kind = 'color' | 'length' | 'border' | 'shadow' | 'font' | 'letter' | 'raw'
type Token = { name: string; kind: Kind }

const PALETTE: Token[] = (
  ['--bg', '--bg-card', '--cyan', '--green', '--pink', '--violet', '--amber'] as const
).map((name) => ({ name, kind: 'color' as const }))

const TEXT: Token[] = (
  ['--text-h1', '--text-body', '--text-sub', '--text-meta', '--text-muted'] as const
).map((name) => ({ name, kind: 'color' as const }))

const FONTS: Token[] = (
  ['--font-display', '--font-body', '--font-btn'] as const
).map((name) => ({ name, kind: 'font' as const }))

const RADII: Token[] = (
  ['--card-radius', '--btn-radius', '--fig-radius', '--r-sm', '--r-md', '--r-lg'] as const
).map((name) => ({ name, kind: 'length' as const }))

// Every var a real <Button> reads, so a column can inject them and the Button
// renders that theme's treatment. Captured (for injection), not all displayed.
const BTN_PREFIXES = ['--btn', '--btn-secondary', '--btn-secondary2'] as const
const BTN_SLOTS: Array<[suffix: string, kind: Kind]> = [
  ['-bg', 'color'],
  ['-color', 'color'],
  ['-bt', 'border'],
  ['-bl', 'border'],
  ['-br', 'border'],
  ['-bb', 'border'],
  ['-radius', 'length'],
  ['-shadow', 'shadow'],
]
const BTN_VARS: Token[] = [
  ...BTN_PREFIXES.flatMap((p) => BTN_SLOTS.map(([s, kind]) => ({ name: `${p}${s}`, kind }))),
  { name: '--btn-filter', kind: 'raw' },
  { name: '--btn-letter-spacing', kind: 'letter' },
]

// Union of everything to resolve per theme.
const ALL_TOKENS: Token[] = [...PALETTE, ...TEXT, ...FONTS, ...RADII, ...BTN_VARS]

// ── Capture engine ──────────────────────────────────────────────────────────────
type ThemeTokens = Record<string, string>
type Captured = Record<ThemeKey, ThemeTokens>

// Resolve one token against whatever theme is currently on <html> by assigning it
// to the matching real property on `probe` and reading the computed value back.
function resolveOne(probe: HTMLElement, root: HTMLElement, { name, kind }: Token): string {
  const cs = () => getComputedStyle(probe)
  const s = probe.style
  s.cssText = '' // reset between reads
  switch (kind) {
    case 'color':
      s.color = `var(${name})`
      return cs().color
    case 'length':
      s.borderRadius = `var(${name})`
      return cs().borderRadius
    case 'border':
      s.borderTop = `var(${name})`
      return cs().borderTop
    case 'shadow':
      s.boxShadow = `var(${name}, none)`
      return cs().boxShadow
    case 'font':
      s.fontFamily = `var(${name})`
      return cs().fontFamily
    case 'letter':
      s.letterSpacing = `var(${name}, normal)`
      return cs().letterSpacing
    case 'raw':
      // No nested var() in these (e.g. --btn-filter: none | drop-shadow(...)),
      // so a direct custom-property read off <html> is safe and correct.
      return getComputedStyle(root).getPropertyValue(name).trim() || 'none'
  }
}

// Walk the three themes synchronously (inside useLayoutEffect → no paint between
// steps → no flicker), resolving every token, then restore the original theme.
function captureAll(tokens: Token[]): Captured {
  const root = document.documentElement
  const prev = root.getAttribute('data-theme')
  const probe = document.createElement('div')
  probe.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden;pointer-events:none'
  document.body.appendChild(probe)
  const out = {} as Captured
  try {
    for (const t of THEMES) {
      root.setAttribute('data-theme', t.key)
      const map: ThemeTokens = {}
      for (const tok of tokens) map[tok.name] = resolveOne(probe, root, tok)
      out[t.key] = map
    }
  } finally {
    if (prev === null) root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', prev)
    probe.remove()
  }
  return out
}

// ── Utilities ───────────────────────────────────────────────────────────────────
// rgb()/rgba() → #rrggbb for a readable label. Non-rgb inputs pass through.
function hexOf(value: string): string {
  const m = value.match(/rgba?\(([^)]+)\)/)
  if (!m) return value
  const [r, g, b] = m[1].split(',').map((n) => parseInt(n, 10))
  if ([r, g, b].some((n) => Number.isNaN(n))) return value
  const h = (n: number) => n.toString(16).padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}`
}

// Injected CSS custom properties for a column (CSSProperties has no index sig).
function buildCssVars(tokens: ThemeTokens): CSSProperties {
  const vars: Record<string, string> = {}
  for (const [k, v] of Object.entries(tokens)) vars[k] = v
  return vars as CSSProperties
}

const mono: CSSProperties = { fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 11 }
const label: CSSProperties = { ...mono, opacity: 0.7 }
const sectionTitle: CSSProperties = {
  ...mono,
  fontSize: 10,
  letterSpacing: 1,
  textTransform: 'uppercase',
  opacity: 0.55,
  margin: '18px 0 8px',
}

// ── Presentational sections (pure; take resolved strings) ─────────────────────────
function Swatch({ name, value }: { name: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
      <span
        style={{
          width: 22,
          height: 22,
          flex: '0 0 auto',
          borderRadius: 4,
          background: value,
          border: '1px solid rgba(128,128,128,0.4)',
        }}
      />
      <span style={{ ...label, flex: 1 }}>{name}</span>
      <span style={mono}>{hexOf(value)}</span>
    </div>
  )
}

function ColorSection({ tokens }: { tokens: ThemeTokens }) {
  return (
    <>
      <div style={sectionTitle}>Palette</div>
      {PALETTE.map((t) => (
        <Swatch key={t.name} name={t.name} value={tokens[t.name]} />
      ))}
      <div style={sectionTitle}>Text</div>
      {TEXT.map((t) => (
        <Swatch key={t.name} name={t.name} value={tokens[t.name]} />
      ))}
    </>
  )
}

function TypographySection({ tokens }: { tokens: ThemeTokens }) {
  return (
    <>
      <div style={sectionTitle}>Typography</div>
      {FONTS.map((t) => (
        <div key={t.name} style={{ marginBottom: 10 }}>
          <div style={label}>
            {t.name} · {tokens[t.name]}
          </div>
          <div style={{ fontFamily: tokens[t.name], fontSize: 20, lineHeight: 1.2 }}>
            Shift your perspective
          </div>
        </div>
      ))}
    </>
  )
}

// Reuses the REAL Button (T-023-01 matrix). Buttons read the column's injected
// --btn-* vars, so each shows its own theme treatment. Three structural variants
// only (per Kate 2026-07-09) — icon/disabled are modifiers on any of them.
function ButtonSection() {
  const row: CSSProperties = { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }
  return (
    <>
      <div style={sectionTitle}>Buttons</div>
      <div style={row}>
        <Button variant="primary">Primary</Button>
        <Button variant="primary" icon="bolt">Icon</Button>
        <Button variant="primary" disabled>Disabled</Button>
      </div>
      <div style={row}>
        <Button variant="secondary">Secondary</Button>
        <Button variant="secondary2">Secondary 2</Button>
      </div>
    </>
  )
}

function RadiiSection({ tokens }: { tokens: ThemeTokens }) {
  return (
    <>
      <div style={sectionTitle}>Radii</div>
      {RADII.map((t) => (
        <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span
            style={{
              width: 22,
              height: 22,
              flex: '0 0 auto',
              borderRadius: tokens[t.name],
              border: '1.5px solid currentColor',
              opacity: 0.7,
            }}
          />
          <span style={{ ...label, flex: 1 }}>{t.name}</span>
          <span style={mono}>{tokens[t.name]}</span>
        </div>
      ))}
    </>
  )
}

// ── Column + board ────────────────────────────────────────────────────────────────
function ThemeColumn({ theme, title, tokens }: { theme: ThemeKey; title: string; tokens: ThemeTokens }) {
  return (
    <section
      style={{
        ...buildCssVars(tokens),
        flex: '1 1 300px',
        minWidth: 280,
        padding: 16,
        borderRadius: 8,
        border: '1px solid rgba(128,128,128,0.35)',
        background: tokens['--bg'],
        color: tokens['--text-body'],
      }}
    >
      <h3 style={{ ...mono, fontSize: 13, margin: '0 0 4px', opacity: 0.9 }}>{title}</h3>
      <ColorSection tokens={tokens} />
      <TypographySection tokens={tokens} />
      <ButtonSection />
      <RadiiSection tokens={tokens} />
    </section>
  )
}

export default function TokenBoard() {
  const [caps, setCaps] = useState<Captured | null>(null)
  useLayoutEffect(() => {
    // DOM measurement: captureAll() transiently sets data-theme on <html> and
    // reads resolved token values via getComputedStyle — must run after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCaps(captureAll(ALL_TOKENS))
  }, [])

  if (!caps) {
    return <p style={mono}>Measuring tokens…</p>
  }
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      {THEMES.map((t) => (
        <ThemeColumn key={t.key} theme={t.key} title={t.title} tokens={caps[t.key]} />
      ))}
    </div>
  )
}
