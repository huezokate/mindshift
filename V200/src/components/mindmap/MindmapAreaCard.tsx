import type { Area } from '@/lib/mindmap-areas'
import { AreaIcon } from './AreaIcon'

// Themed area card for the mind-map canvas. Spun off the app's input/card
// surface — everything is a CSS custom property, so kawaii / cyberpunk /
// notepad inherit their own coordinated colors with no hardcoded hex.
export function MindmapAreaCard({
  area,
  body,
  milestones,
  actions,
  selected = false,
  width = 331,
}: {
  area: Area
  body?: string
  milestones: number
  actions: number
  selected?: boolean
  width?: number
}) {
  return (
    <div
      style={{
        width,
        background: selected ? 'var(--mm-card-bg-selected, #eef3ec)' : 'var(--card-bg)',
        border: `1.5px solid ${selected ? 'var(--green)' : 'var(--pink)'}`,
        borderLeft: `4px solid ${selected ? 'var(--green)' : 'var(--pink)'}`,
        borderRadius: 'var(--card-radius)',
        padding: '14px 16px',
        // Notepad hard-offset shadow — matches the journal cards.
        filter: 'drop-shadow(3px 4px 0 var(--mm-shadow, #d4cbbf))',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      {/* Header — icon + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          aria-hidden
          style={{
            color: selected ? 'var(--green)' : 'var(--cyan)',
            display: 'inline-flex',
            lineHeight: 1,
          }}
        >
          <AreaIcon id={area.id} size={22} />
        </span>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 18,
            letterSpacing: '-0.3px',
            color: 'var(--text-h1)',
          }}
        >
          {area.label}
        </span>
      </div>

      {/* Body */}
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          lineHeight: '19px',
          color: 'var(--text-sub)',
          margin: 0,
        }}
      >
        {body ?? area.prompt}
      </p>

      {/* Footer — milestone + action counts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2 }}>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            color: 'var(--cyan)',
          }}
        >
          {milestones} major milestone{milestones === 1 ? '' : 's'}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 12,
            color: 'var(--text-sub)',
          }}
        >
          {actions} actions planned
        </span>
      </div>
    </div>
  )
}
