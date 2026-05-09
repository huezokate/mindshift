'use client'
import { useState } from 'react'
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function truncate(text: string, max = 120) {
  return text.length <= max ? text : text.slice(0, max).trimEnd() + '…'
}

export default function SessionCard({ ventText, createdAt, lensResponses }: Props) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="flex flex-col gap-3">
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
        }}
      >
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full flex items-center justify-between text-left"
          style={{
            background: 'var(--input-header-bg)',
            padding: '8px 16px',
            borderBottom: '1px solid var(--input-divider)',
            cursor: 'pointer',
          }}
        >
          <p
            className="uppercase"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 10, letterSpacing: 1, color: 'var(--text-body)' }}
          >
            {formatDate(createdAt)}
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--cyan)' }}>
            {lensResponses.length} {lensResponses.length === 1 ? 'lens' : 'lenses'} {expanded ? '▲' : '▼'}
          </p>
        </button>
        <div style={{ padding: '12px 16px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', color: 'var(--text-body)' }}>
            {truncate(ventText)}
          </p>
        </div>
      </div>

      {expanded && lensResponses.map(lr => (
        <LensResponseCard
          key={lr.id}
          figureId={lr.figure_id}
          responseText={lr.response_text}
          createdAt={lr.created_at}
        />
      ))}
    </div>
  )
}
