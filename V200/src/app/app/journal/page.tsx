'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/lib/theme'
import { FIGURES } from '@/lib/figures'

// Journal feed — compact entry cards (Figma 572:5715 notepad, 579:6146 cyberpunk)
// that open up on tap to reveal the full vent + each lens's response.
// Exact notepad chrome: blue (#3a6fa8 = --cyan) note border, green/red footer,
// hard drop-shadow #d4cbbf, -4px overlap, 48px avatars with social badges.
// Real Supabase page preserved at page.real.tsx.bak.

const PORTRAIT: Record<string, string> = Object.fromEntries(FIGURES.map(f => [f.id, f.imgNotepad]))
const SHADOW = 'drop-shadow(3px 4px 0 var(--mm-shadow, #d4cbbf))'

type Platform = 'instagram' | 'facebook' | 'tiktok' | 'sms'
type Lens = { id: string; name: string; response: string; platform?: Platform }
type Entry = { id: string; title: string; body: string; shared: boolean; lenses: Lens[] }

const ENTRIES: Entry[] = [
  {
    id: 'e1',
    shared: true,
    title: 'When I keep saying yes…',
    body: 'I keep saying yes to things I don’t actually want to do and then quietly resenting everyone for it. I think the truth is I’m scared a “no” will cost me something I can’t name yet — approval, maybe, or the version of me that everyone already likes.',
    lenses: [
      { id: 'socrates', name: 'Socrates', platform: 'instagram', response: 'No one forced the yes. So ask: what do you believe a “no” would prove about you — and is that belief actually true, or just old?' },
      { id: 'maya-angelou', name: 'Maya Angelou', platform: 'facebook', response: 'You teach people how to treat you by what you allow. A loving “no” is not a door slammed — it is a window you finally open for yourself.' },
      { id: 'frida-kahlo', name: 'Frida Kahlo', platform: 'tiktok', response: 'Resentment is the body painting in red. Stop apologizing for taking up space — your “no” is a self-portrait too.' },
      { id: 'n-mandela', name: 'Nelson Mandela', platform: 'sms', response: 'Courage is not the absence of fear, but acting in spite of it. Say the small no first. The cost you imagine is rarely the cost you pay.' },
    ],
  },
  {
    id: 'e2',
    shared: true,
    title: 'Shipping before I’m ready',
    body: 'Everyone says “just ship it” but my hands freeze on the publish button every single time. I rewrite the same thing for the fourth time and call it polishing, but I know it’s just fear wearing a productive costume.',
    lenses: [
      { id: 'che-guevara', name: 'Ernesto “Che” Guevara', platform: 'instagram', response: 'Perfection is the alibi of the comfortable. Ship the imperfect thing — the world corrects what action puts in front of it.' },
    ],
  },
  {
    id: 'e3',
    shared: false,
    title: 'Just before bed',
    body: 'Just need to get this out of my head before bed. Long day. Brain is loud and won’t quiet down. That’s all — no advice needed tonight, just somewhere to put it down.',
    lenses: [],
  },
  {
    id: 'e4',
    shared: false,
    title: 'The window I think I missed',
    body: 'I’m scared I’ve already missed my window to do the thing I actually care about. Everyone my age seems three steps ahead and I keep doing the math on how late I am.',
    lenses: [
      { id: 'maya-angelou', name: 'Maya Angelou', response: 'There is no greater agony than bearing an untold story inside you. The window is a door — and it opens from your side.' },
      { id: 'a-lincoln', name: 'Abraham Lincoln', response: 'I failed at nearly everything before I didn’t. Late is a comparison; persistence is a fact. Start where you stand.' },
      { id: 'dolly-parton', name: 'Dolly Parton', response: 'Honey, the only person you’re racing is the one in the mirror. Figure out who you are and do it on purpose.' },
    ],
  },
]

export default function JournalPage() {
  const { setTheme } = useTheme()
  useEffect(() => { setTheme('notepad') }, [setTheme])

  return (
    <div className="min-h-dvh flex flex-col items-center" style={{ padding: '24px 20px 120px', position: 'relative' }}>
      {/* Header */}
      <div className="w-full flex items-center" style={{ maxWidth: 440, justifyContent: 'space-between', marginBottom: 22 }}>
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
      <div className="w-full flex flex-col" style={{ maxWidth: 408, gap: 22 }}>
        {ENTRIES.map(e => <EntryCard key={e.id} entry={e} />)}
      </div>

      {/* New-entry FAB */}
      <Link
        href="/app/vent"
        aria-label="New vent"
        style={{
          position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 40,
          width: 58, height: 58, borderRadius: '50%', background: 'var(--card-bg)', border: '2px solid var(--pink)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', filter: SHADOW,
          color: 'var(--pink)', fontSize: 30, fontWeight: 300, textDecoration: 'none', lineHeight: 1,
        }}
      >
        +
      </Link>
    </div>
  )
}

function EntryCard({ entry }: { entry: Entry }) {
  const [open, setOpen] = useState(false)
  const accent = entry.shared ? 'var(--green)' : 'var(--pink)'
  const hasLens = entry.lenses.length > 0

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={open}
      onClick={() => setOpen(o => !o)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(o => !o) } }}
      className="flex flex-col"
      style={{ cursor: 'pointer', outline: 'none' }}
    >
      {/* NOTE — header + body (overlap footer by -4) */}
      <div style={{ display: 'flex', flexDirection: 'column', marginBottom: -4, position: 'relative', zIndex: 0 }}>
        {/* Header bar */}
        <div
          style={{
            background: 'var(--card-bg)',
            borderTop: '1.5px solid var(--cyan)', borderLeft: '4px solid var(--cyan)',
            borderRight: '1.5px solid var(--cyan)', borderBottom: '1.5px solid var(--cyan)',
            borderTopLeftRadius: 8, borderTopRightRadius: 8, filter: SHADOW,
            padding: '8px 12px 2px', textAlign: 'center',
          }}
        >
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12, letterSpacing: 0.55, textTransform: 'uppercase', color: 'var(--cyan)', lineHeight: '14px', margin: 0 }}>
            {entry.title}
          </p>
        </div>
        {/* Body */}
        <div
          style={{
            background: 'var(--card-bg)',
            borderLeft: '4px solid var(--cyan)', borderRight: '1.5px solid var(--cyan)', borderBottom: '1.5px solid var(--cyan)',
            borderBottomLeftRadius: 8, borderBottomRightRadius: 8, filter: SHADOW, padding: '8px 16px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-body)', fontSize: 14, letterSpacing: 0.52, lineHeight: '20px',
              color: 'var(--text-body)', margin: 0,
              ...(open ? {} : { display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }),
            }}
          >
            {entry.body}
          </p>
        </div>
      </div>

      {/* FOOTER — privacy icon + lens avatars */}
      <div
        style={{
          background: 'var(--card-bg)',
          borderTop: `1.5px solid ${accent}`, borderLeft: `4px solid ${accent}`,
          borderRight: `1.5px solid ${accent}`, borderBottom: `1.5px solid ${accent}`,
          borderRadius: 8, filter: SHADOW, padding: '8px 16px', position: 'relative', zIndex: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 56,
        }}
      >
        <span style={{ color: entry.shared ? 'var(--cyan)' : 'var(--pink)', display: 'inline-flex' }}>
          {entry.shared ? <ShareIcon /> : <LockIcon />}
        </span>
        {hasLens && <AvatarRow lenses={entry.lenses} shared={entry.shared} />}
      </div>

      {/* EXPANDED — the lens responses */}
      <AnimatePresence initial={false}>
        {open && hasLens && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="flex flex-col" style={{ gap: 12, paddingTop: 14 }}>
              {entry.lenses.map(l => <ResponseBlock key={l.id} lens={l} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ResponseBlock({ lens }: { lens: Lens }) {
  return (
    <div
      style={{
        background: 'var(--card-bg)', borderTop: '1.5px solid var(--pink)', borderLeft: '4px solid var(--pink)',
        borderRight: '1.5px solid var(--pink)', borderBottom: '1.5px solid var(--pink)', borderRadius: 8,
        filter: SHADOW, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8,
      }}
    >
      <div className="flex items-center" style={{ gap: 9 }}>
        <Avatar id={lens.id} name={lens.name} size={30} ring={1.5} />
        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--cyan)' }}>
          {lens.name}
        </span>
      </div>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, lineHeight: '20px', letterSpacing: 0.3, color: 'var(--text-body)', margin: 0 }}>
        {lens.response}
      </p>
    </div>
  )
}

function AvatarRow({ lenses, shared }: { lenses: Lens[]; shared: boolean }) {
  return (
    <div className="flex items-center">
      {lenses.map((l, i) => {
        const last = i === lenses.length - 1
        if (shared) {
          return (
            <div key={l.id} style={{ display: 'flex', alignItems: 'flex-end', marginRight: last ? 0 : -4 }}>
              <Avatar id={l.id} name={l.name} size={48} ring={2} style={{ marginRight: -16 }} />
              {l.platform && <PlatformBadge platform={l.platform} />}
            </div>
          )
        }
        return <Avatar key={l.id} id={l.id} name={l.name} size={48} ring={2} style={{ marginRight: last ? 0 : -4 }} />
      })}
    </div>
  )
}

function Avatar({ id, name, size, ring, style }: { id: string; name: string; size: number; ring: number; style?: React.CSSProperties }) {
  const [err, setErr] = useState(false)
  const initials = name.replace(/["']/g, '').split(' ').map(w => w[0]).slice(0, 2).join('')
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
        border: `${ring}px solid var(--pink)`, background: 'var(--bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', ...style,
      }}
    >
      {err ? (
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: size * 0.36, color: 'var(--pink)' }}>{initials}</span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={PORTRAIT[id]} alt={name} onError={() => setErr(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
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
        width: 16, height: 16, borderRadius: 4, background: b.bg, color: '#fff',
        border: '1.5px solid var(--bg)', fontSize: 9, lineHeight: 1, fontWeight: 700,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}
    >
      {b.glyph}
    </span>
  )
}

function ShareIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 16V4" /><path d="m8 8 4-4 4 4" /><path d="M5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
    </svg>
  )
}
function LockIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  )
}
