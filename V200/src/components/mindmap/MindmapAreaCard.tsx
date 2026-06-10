import type { Area } from '@/lib/mindmap-areas'
import { AreaIcon } from './AreaIcon'

// Notepad mind-map card — folded (on the map) and unfolded (tap-to-open detail).
// Exact spec from Figma 541:4895 (folded) / 541:4894 (unfolded).
export type Milestone = { title: string; actions: string[] }
export type AreaDetail = {
  description: string
  done: number
  total: number
  milestones: Milestone[]
}

const SHADOW = 'drop-shadow(3px 4px 0 #d4cbbf)'
const BLUE = 'var(--cyan)' // #3a6fa8
const GREEN = 'var(--green)' // #7d9e7d

export function MindmapAreaCard({
  area,
  detail,
  unfolded = false,
  width = 331,
}: {
  area: Area
  detail: AreaDetail
  unfolded?: boolean
  width?: number
}) {
  const pct = detail.total ? Math.round((detail.done / detail.total) * 100) : 0

  return (
    <div style={{ width, background: 'var(--card-bg)', display: 'flex', flexDirection: 'column', borderRadius: 8 }}>
      {/* Header */}
      <div
        style={{
          background: 'var(--card-bg)',
          borderTop: `1.5px solid ${BLUE}`, borderLeft: `4px solid ${BLUE}`,
          borderRight: `1.5px solid ${BLUE}`, borderBottom: `1.5px solid ${BLUE}`,
          borderTopLeftRadius: 8, borderTopRightRadius: 8, filter: SHADOW,
          display: 'flex', justifyContent: 'center', padding: '8px 0 2px',
        }}
      >
        <div className="flex items-center" style={{ gap: 16 }}>
          <span aria-hidden style={{ color: BLUE, display: 'inline-flex' }}><AreaIcon id={area.id} size={24} /></span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, lineHeight: '20px', letterSpacing: 1.2, textTransform: 'uppercase', color: BLUE }}>
            {area.label}
          </span>
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          background: 'var(--card-bg)',
          borderLeft: `4px solid ${BLUE}`, borderRight: `1.5px solid ${BLUE}`, borderBottom: `1.5px solid ${BLUE}`,
          borderBottomLeftRadius: 8, borderBottomRightRadius: 8, filter: SHADOW,
        }}
      >
        <div className="flex flex-col" style={{ gap: 10, minHeight: 120, padding: '4px 16px 12px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px', letterSpacing: 0.18, color: 'var(--text-body)', margin: 0 }}>
            {detail.description}
          </p>

          {!unfolded && <ProgressBar pct={pct} />}

          {!unfolded ? (
            // Folded summary
            <div className="flex flex-col" style={{ gap: 4 }}>
              <div className="flex items-center" style={{ gap: 8 }}>
                <ChevronIcon />
                <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12, letterSpacing: 0.55, textTransform: 'uppercase', color: BLUE }}>
                  {detail.milestones.length} major milestones
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, letterSpacing: 0.18, color: 'var(--text-body)', paddingLeft: 32 }}>
                {detail.milestones.reduce((n, m) => n + m.actions.length, 0)} actions planned
              </span>
            </div>
          ) : (
            <>
              {/* Overall progress box */}
              <div style={{ background: 'var(--bg)', border: `1px solid ${GREEN}`, borderRadius: 8, padding: '13px 15px 1px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="flex items-center justify-between">
                  <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13, lineHeight: '18px', color: 'var(--text-body)' }}>Overall progress</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, lineHeight: '16.5px', color: 'rgba(30,30,64,0.55)' }}>{detail.done}/{detail.total}</span>
                </div>
                <ProgressBar pct={pct} />
              </div>

              {/* Milestone list */}
              <div className="flex flex-col" style={{ gap: 16, marginTop: 2 }}>
                {detail.milestones.map((m, i) => (
                  <div key={i} className="flex flex-col" style={{ gap: 4 }}>
                    <div className="flex items-start" style={{ gap: 8 }}>
                      <ActivityIcon />
                      <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12, lineHeight: '14px', letterSpacing: 0.55, textTransform: 'uppercase', color: BLUE }}>
                        {m.title}
                      </span>
                    </div>
                    <ul style={{ paddingLeft: 40, margin: 0, listStyle: 'disc', color: 'var(--text-body)' }}>
                      {m.actions.map((a, j) => (
                        <li key={j} style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px', letterSpacing: 0.18, marginLeft: 1 }}>{a}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div style={{ height: 8, width: '100%', borderRadius: 999, background: 'rgba(58,111,168,0.2)', overflow: 'hidden' }}>
      <div style={{ height: 8, width: `${pct}%`, borderRadius: 999, background: 'var(--green)' }} />
    </div>
  )
}

function ChevronIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden style={{ color: 'var(--green)', flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
      <path d="m8.5 10.5 3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ActivityIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden style={{ color: 'var(--green)', flexShrink: 0, marginTop: -2 }}>
      <path d="M12 3a9 9 0 1 0 9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
