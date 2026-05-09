'use client'
import { FIGURES } from '@/lib/figures'

type Props = {
  figureId: string
  responseText: string
  createdAt: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function LensResponseCard({ figureId, responseText, createdAt }: Props) {
  const fig = FIGURES.find(f => f.id === figureId)

  return (
    <div
      style={{
        background: 'var(--card-bg)',
        borderTop: 'var(--card-bt)',
        borderLeft: 'var(--card-bl)',
        borderRight: 'var(--card-br)',
        borderBottom: 'var(--card-bb)',
        borderRadius: 'var(--card-radius)',
        overflow: 'hidden',
        boxShadow: 'var(--card-shadow)',
        marginLeft: 16,
      }}
    >
      <div
        className="flex items-center gap-2"
        style={{ padding: '8px 16px', borderBottom: '1px solid var(--input-divider)' }}
      >
        <p
          className="uppercase"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: 1,
            color: 'var(--fig-name-unsel)',
          }}
        >
          {fig?.name ?? figureId}
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-sub)', marginLeft: 'auto' }}>
          {formatDate(createdAt)}
        </p>
      </div>
      <div style={{ padding: '12px 16px' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', color: 'var(--text-body)' }}>
          {responseText}
        </p>
      </div>
    </div>
  )
}
