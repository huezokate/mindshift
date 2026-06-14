'use client'
import { useState } from 'react'
import { FIGURES } from '@/lib/figures'
import { useTheme } from '@/lib/theme'
import Icon from '@/components/ui/Icon'
import LensResponseCard from './LensResponseCard'

type LensResponse = {
  id: string
  figure_id: string
  response_text: string
  created_at: string
}

type Props = {
  ventText: string
  createdAt: string
  lensResponses: LensResponse[]
}

export default function SessionCard({ ventText, createdAt, lensResponses }: Props) {
  const [expanded, setExpanded] = useState(false)
  const { theme } = useTheme()
  const isKawaii = theme === 'kawaii'
  const isCyberpunk = theme === 'cyberpunk'

  const titleDisplay = ventText.split(' ').slice(0, 5).join(' ').toUpperCase() + '...'

  const figs = lensResponses
    .map(lr => FIGURES.find(f => f.id === lr.figure_id))
    .filter((f): f is NonNullable<typeof f> => f != null)

  // ─── Collapsed (all themes share the three-path preview) ───────────────────
  if (!expanded) {
    if (isCyberpunk) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: 'var(--card-bg)', borderTop: '4px solid var(--cyan)', borderLeft: '4px solid var(--cyan)', borderRight: '1px solid var(--cyan)', borderBottom: '1px solid var(--cyan)', borderRadius: 'var(--card-radius)', height: 164, marginBottom: -4, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ borderBottom: '1px solid var(--cyan)', padding: '8px 16px 2px', flexShrink: 0 }}>
              <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12, letterSpacing: '1.32px', lineHeight: '14px', color: 'var(--cyan)', textTransform: 'uppercase', textAlign: 'center' }}>{titleDisplay}</p>
            </div>
            <div style={{ padding: '4px 16px', flex: 1, overflow: 'hidden' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px', letterSpacing: '0.52px', color: 'var(--text-body)' }}>{ventText}</p>
            </div>
          </div>
          <button type="button" onClick={() => setExpanded(true)} style={{ background: 'var(--card-bg)', borderTop: '1px solid var(--violet)', borderLeft: '1px solid var(--violet)', borderRight: '4px solid var(--violet)', borderBottom: '4px solid var(--violet)', borderRadius: 'var(--card-radius)', padding: '8px 8px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', cursor: 'pointer', color: 'var(--cyan)' }}>
            <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="ios_share" size={24} /></div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {figs.map((fig, i) => (
                <div key={i} style={{ width: 48, height: 48, borderRadius: '50%', border: '1px solid var(--green)', background: 'var(--fig-avatar-grad)', overflow: 'hidden', flexShrink: 0, marginRight: i < figs.length - 1 ? -4 : 0, position: 'relative', zIndex: i + 1 }}>
                  {fig.imgCyberpunk && <img src={fig.imgCyberpunk} alt={fig.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
              ))}
            </div>
          </button>
        </div>
      )
    }

    if (isKawaii) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: -4 }}>
            <div style={{ background: 'var(--input-header-bg)', boxShadow: 'inset 4px 0 0 0 var(--green)', borderTop: 'var(--input-bt)', borderLeft: 'var(--input-bl)', borderRight: 'var(--input-br)', borderBottom: '1px solid var(--input-divider)', borderRadius: '32px 32px 0 0', padding: '8px 16px 4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12, letterSpacing: '0.52px', lineHeight: '14px', color: 'var(--text-body)', textTransform: 'uppercase' }}>{titleDisplay}</p>
            </div>
            <div style={{ background: 'var(--card-bg)', boxShadow: 'inset 4px 0 0 0 var(--green)', borderLeft: 'var(--input-bl)', borderRight: 'var(--input-br)', borderBottom: 'var(--input-bb)', borderRadius: '0 0 32px 32px', height: 140, overflow: 'hidden', padding: '4px 8px 4px 16px' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px', letterSpacing: '0.52px', color: 'var(--text-body)' }}>{ventText}</p>
            </div>
          </div>
          <button type="button" onClick={() => setExpanded(true)} style={{ position: 'relative', background: 'var(--lens-header-bg)', boxShadow: 'inset 4px 0 0 0 var(--violet)', borderTop: 'var(--input-bt)', borderLeft: 'var(--input-bl)', borderRight: 'var(--input-br)', borderBottom: 'var(--input-bb)', borderRadius: '32px', overflow: 'hidden', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', cursor: 'pointer', color: 'var(--pink)' }}>
            <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="ios_share" size={24} /></div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {figs.map((fig, i) => (
                <div key={i} style={{ width: 48, height: 48, borderRadius: '50%', border: '1px solid var(--pink)', boxShadow: '0px 2px 8px 0px rgba(130,100,240,0.13)', background: 'var(--fig-avatar-grad)', overflow: 'hidden', flexShrink: 0, marginRight: i < figs.length - 1 ? -4 : 0, position: 'relative', zIndex: i + 1 }}>
                  {fig.imgKawaii && <img src={fig.imgKawaii} alt={fig.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
              ))}
            </div>
          </button>
        </div>
      )
    }

    // Notepad collapsed
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ filter: 'var(--card-filter)', marginBottom: -4 }}>
          <div style={{ background: 'var(--card-bg)', borderTop: '1.5px solid var(--cyan)', borderLeft: '4px solid var(--cyan)', borderRight: '1.5px solid var(--cyan)', borderBottom: '1.5px solid var(--cyan)', borderRadius: '8px 8px 0 0', padding: '8px 16px 2px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12, letterSpacing: '0.55px', lineHeight: '14px', color: 'var(--cyan)', textTransform: 'uppercase', textAlign: 'center' }}>{titleDisplay}</p>
          </div>
          <div style={{ background: 'var(--card-bg)', borderLeft: '4px solid var(--cyan)', borderRight: '1.5px solid var(--cyan)', borderBottom: '1.5px solid var(--cyan)', borderRadius: '0 0 8px 8px', height: 140, overflow: 'hidden', padding: '4px 16px' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px', letterSpacing: '0.18px', color: 'var(--text-body)' }}>{ventText}</p>
          </div>
        </div>
        <button type="button" onClick={() => setExpanded(true)} style={{ filter: 'var(--card-filter)', background: 'var(--card-bg)', borderTop: '1.5px solid var(--green)', borderLeft: '4px solid var(--green)', borderRight: '1.5px solid var(--green)', borderBottom: '1.5px solid var(--green)', borderRadius: '8px', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', cursor: 'pointer', color: 'var(--text-body)' }}>
          <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="ios_share" size={24} /></div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {figs.map((fig, i) => (
              <div key={i} style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid var(--pink)', background: 'var(--fig-avatar-grad)', overflow: 'hidden', flexShrink: 0, marginRight: i < figs.length - 1 ? -4 : 0, position: 'relative', zIndex: i + 1 }}>
                {fig.imgCyberpunk && <img src={fig.imgCyberpunk} alt={fig.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
            ))}
          </div>
        </button>
      </div>
    )
  }

  // ─── Expanded shared elements ──────────────────────────────────────────────
  const lensScroll = (
    <div style={{ overflowX: 'auto', display: 'flex', gap: 12, scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' as const, paddingBottom: 4 }}>
      {lensResponses.map(lr => (
        <div key={lr.id} style={{ flexShrink: 0, width: '100%', scrollSnapAlign: 'start' }}>
          <LensResponseCard figureId={lr.figure_id} responseText={lr.response_text} createdAt={lr.created_at} />
        </div>
      ))}
    </div>
  )

  // ─── Expanded — Cyberpunk ──────────────────────────────────────────────────
  if (isCyberpunk) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Full vent card — header taps to collapse */}
        <div style={{ background: 'var(--card-bg)', borderTop: '4px solid var(--cyan)', borderLeft: '4px solid var(--cyan)', borderRight: '1px solid var(--cyan)', borderBottom: '1px solid var(--cyan)', borderRadius: 'var(--card-radius)', display: 'flex', flexDirection: 'column' }}>
          <button type="button" onClick={() => setExpanded(false)} style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--cyan)', padding: '8px 16px 2px', width: '100%', cursor: 'pointer', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12, letterSpacing: '1.32px', lineHeight: '14px', color: 'var(--cyan)', textTransform: 'uppercase' }}>{titleDisplay}</p>
          </button>
          <div style={{ padding: '4px 16px 16px' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px', letterSpacing: '0.52px', color: 'var(--text-sub)' }}>{ventText}</p>
          </div>
        </div>
        {/* Lens nav row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '1.44px', lineHeight: '20px', color: 'var(--cyan)', textTransform: 'uppercase' }}>MindShift</p>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid var(--green)', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--green)' }}>
            <Icon name="psychology" size={24} />
          </div>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '1.44px', lineHeight: '20px', color: 'var(--violet)', textTransform: 'uppercase' }}>MindShift</p>
        </div>
        {lensScroll}
      </div>
    )
  }

  // ─── Expanded — Kawaii ────────────────────────────────────────────────────
  if (isKawaii) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Full vent card */}
        <div>
          <button type="button" onClick={() => setExpanded(false)} style={{ background: 'var(--input-header-bg)', boxShadow: 'inset 4px 0 0 0 var(--green)', borderTop: 'var(--input-bt)', borderLeft: 'var(--input-bl)', borderRight: 'var(--input-br)', borderBottom: '1px solid var(--input-divider)', borderRadius: '32px 32px 0 0', padding: '8px 16px 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', cursor: 'pointer' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12, letterSpacing: '0.52px', lineHeight: '14px', color: 'var(--text-body)', textTransform: 'uppercase' }}>{titleDisplay}</p>
          </button>
          <div style={{ background: 'var(--card-bg)', boxShadow: 'inset 4px 0 0 0 var(--green)', borderLeft: 'var(--input-bl)', borderRight: 'var(--input-br)', borderBottom: 'var(--input-bb)', borderRadius: '0 0 32px 32px', padding: '4px 8px 16px 16px' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px', letterSpacing: '0.52px', color: 'var(--text-sub)' }}>{ventText}</p>
          </div>
        </div>
        {/* Lens nav row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '1.44px', lineHeight: '20px', color: 'var(--cyan)', textTransform: 'uppercase' }}>MindShift</p>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid var(--green)', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--green)' }}>
            <Icon name="psychology" size={24} />
          </div>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '1.44px', lineHeight: '20px', color: 'var(--violet)', textTransform: 'uppercase' }}>MindShift</p>
        </div>
        {lensScroll}
      </div>
    )
  }

  // ─── Expanded — Notepad ───────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Full vent card */}
      <div style={{ filter: 'var(--card-filter)' }}>
        <button type="button" onClick={() => setExpanded(false)} style={{ background: 'var(--card-bg)', borderTop: '1.5px solid var(--cyan)', borderLeft: '4px solid var(--cyan)', borderRight: '1.5px solid var(--cyan)', borderBottom: '1.5px solid var(--cyan)', borderRadius: '8px 8px 0 0', padding: '8px 16px 2px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', cursor: 'pointer' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12, letterSpacing: '0.55px', lineHeight: '14px', color: 'var(--cyan)', textTransform: 'uppercase', textAlign: 'center' }}>{titleDisplay}</p>
        </button>
        <div style={{ background: 'var(--card-bg)', borderLeft: '4px solid var(--cyan)', borderRight: '1.5px solid var(--cyan)', borderBottom: '1.5px solid var(--cyan)', borderRadius: '0 0 8px 8px', padding: '4px 16px 16px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px', letterSpacing: '0.18px', color: 'var(--text-sub)' }}>{ventText}</p>
        </div>
      </div>
      {/* Lens nav row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '1.44px', lineHeight: '20px', color: 'var(--cyan)', textTransform: 'uppercase' }}>MindShift</p>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid var(--green)', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--green)' }}>
          <Icon name="psychology" size={24} />
        </div>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '1.44px', lineHeight: '20px', color: 'var(--violet)', textTransform: 'uppercase' }}>MindShift</p>
      </div>
      {lensScroll}
    </div>
  )
}
