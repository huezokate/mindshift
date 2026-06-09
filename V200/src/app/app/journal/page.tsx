'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTheme } from '@/lib/theme'
import { FIGURES } from '@/lib/figures'

// Journal feed — compact entry cards per Figma 562:5363. Each card: titled note
// (vent topic + clamped body) + a footer strip with a privacy icon (lock /
// share) and the lens avatars (with social badges when shared). Tapping an entry
// would open the expanded standard card (470:2455) — detail view is next.
// Real Supabase page preserved at page.real.tsx.bak.

// Notepad UI → notepad portraits (monogram fallback until assets land).
const PORTRAIT: Record<string, string> = Object.fromEntries(FIGURES.map(f => [f.id, f.imgNotepad]))

type Platform = 'instagram' | 'facebook' | 'tiktok' | 'sms'
type Lens = { id: string; name: string; platform?: Platform }
type Entry = {
  id: string
  title: string
  body: string
  shared: boolean
  lenses: Lens[]
}

const ENTRIES: Entry[] = [
  {
    id: 'e1', shared: true,
    title: 'When I keep saying yes…',
    body: 'I keep saying yes to things I don’t actually want to do and then quietly resenting everyone for it. I think the truth is I’m scared a “no” will cost me something I can’t name yet.',
    lenses: [
      { id: 'socrates', name: 'Socrates', platform: 'instagram' },
      { id: 'maya-angelou', name: 'Maya Angelou', platform: 'facebook' },
      { id: 'frida-kahlo', name: 'Frida Kahlo', platform: 'tiktok' },
      { id: 'n-mandela', name: 'Nelson Mandela', platform: 'sms' },
    ],
  },
  {
    id: 'e2', shared: true,
    title: 'Shipping before I’m ready',
    body: 'Everyone says just ship it but my hands freeze on the publish button every single time. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.',
    lenses: [],
  },
  {
    id: 'e3', shared: false,
    title: 'Just before bed',
    body: 'Just need to get this out of my head before bed. Long day. Brain is loud and won’t quiet down. That’s all — no advice needed tonight.',
    lenses: [],
  },
  {
    id: 'e4', shared: false,
    title: 'The window I think I missed',
    body: 'I’m scared I’ve already missed my window to do the thing I actually care about. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
    lenses: [
      { id: 'maya-angelou', name: 'Maya Angelou' },
      { id: 'a-lincoln', name: 'Abraham Lincoln' },
      { id: 'dolly-parton', name: 'Dolly Parton' },
    ],
  },
]

export default function JournalPage() {
  const { setTheme } = useTheme()
  useEffect(() => { setTheme('notepad') }, [setTheme])

  return (
    <div className="min-h-dvh flex flex-col items-center" style={{ padding: '24px 20px 120px', position: 'relative' }}>
      {/* Header */}
      <div className="w-full flex items-center" style={{ maxWidth: 440, justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ width: 28 }} aria-hidden />
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--cyan)', margin: 0 }}>
          Journal
        </h1>
        <Link href="/app/profile" aria-label="Account" style={{ color: 'var(--green)', display: 'inline-flex' }}>
          <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
            <circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3.2" /><path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
          </svg>
        </Link>
      </div>

      {/* Feed */}
      <div className="w-full flex flex-col" style={{ maxWidth: 440, gap: 18 }}>
        {ENTRIES.map(e => <EntryCard key={e.id} entry={e} />)}
      </div>

      {/* New-entry FAB */}
      <Link
        href="/app/vent"
        aria-label="New vent"
        style={{
          position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 40,
          width: 58, height: 58, borderRadius: '50%', background: 'var(--card-bg)', border: '2px solid var(--pink)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', filter: 'var(--card-filter, none)',
          color: 'var(--pink)', fontSize: 30, fontWeight: 300, textDecoration: 'none', lineHeight: 1,
        }}
      >
        +
      </Link>
    </div>
  )
}

function EntryCard({ entry }: { entry: Entry }) {
  const accent = entry.shared ? 'var(--green)' : 'var(--pink)'
  return (
    <div className="flex flex-col">
      {/* Note (title + body) */}
      <div style={{ position: 'relative', zIndex: 0, background: 'var(--card-bg)', border: '1.5px solid var(--cyan)', borderLeft: '4px solid var(--cyan)', borderRadius: 'var(--card-radius)', overflow: 'hidden', filter: 'var(--card-filter, none)' }}>
        <div style={{ background: '#e9eff5', padding: '8px 14px', borderBottom: '1px solid #d6e0ea' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--cyan)', margin: 0, textAlign: 'center' }}>
            {entry.title}
          </p>
        </div>
        <p
          style={{
            fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '21px', color: 'var(--text-body)', margin: 0,
            padding: '12px 16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}
        >
          {entry.body}
        </p>
      </div>

      {/* Footer strip — privacy icon + lens avatars */}
      <div
        style={{
          position: 'relative', zIndex: 1, marginTop: -4,
          background: 'var(--card-bg)', border: `1.5px solid ${accent}`, borderLeft: `4px solid ${accent}`,
          borderRadius: 'var(--card-radius)', padding: '10px 14px', filter: 'var(--card-filter, none)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 56,
        }}
      >
        <span style={{ color: accent, display: 'inline-flex' }}>
          {entry.shared ? <ShareIcon /> : <LockIcon />}
        </span>
        {entry.lenses.length > 0 && (
          <div className="flex items-center" style={{ gap: 4 }}>
            {entry.lenses.map(l => <LensAvatar key={l.id + (l.platform ?? '')} lens={l} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function LensAvatar({ lens }: { lens: Lens }) {
  const [err, setErr] = useState(false)
  const initials = lens.name.replace(/["']/g, '').split(' ').map(w => w[0]).slice(0, 2).join('')
  return (
    <div style={{ position: 'relative', width: 36, height: 36 }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid var(--pink)', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {err ? (
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--pink)' }}>{initials}</span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={PORTRAIT[lens.id]} alt={lens.name} onError={() => setErr(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </div>
      {lens.platform && <PlatformBadge platform={lens.platform} />}
    </div>
  )
}

const BADGE: Record<Platform, { glyph: string; bg: string }> = {
  instagram: { glyph: '⌾', bg: '#c13584' },
  facebook: { glyph: 'f', bg: '#1877f2' },
  tiktok: { glyph: '♪', bg: '#1e1e1e' },
  sms: { glyph: '✉', bg: 'var(--cyan)' },
}
function PlatformBadge({ platform }: { platform: Platform }) {
  const b = BADGE[platform]
  return (
    <span
      style={{
        position: 'absolute', bottom: -2, right: -2, width: 15, height: 15, borderRadius: '50%', background: b.bg,
        border: '1.5px solid var(--card-bg)', color: '#fff', fontSize: 8, lineHeight: 1,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
      }}
    >
      {b.glyph}
    </span>
  )
}

function ShareIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 16V4" /><path d="m8 8 4-4 4 4" /><path d="M5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
    </svg>
  )
}
function LockIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  )
}
