'use client'
import Link from 'next/link'
import { useEffect } from 'react'
import { useTheme } from '@/lib/theme'

// ─── Sample data ───────────────────────────────────────────────────────────
// One container per life area the user is working on. Each holds stacked goals
// with a progress value (0–1). In iteration 2 this comes from Supabase
// (goals + milestones), with progress derived from completed milestones.

type Goal = {
  id: string
  title: string
  done: number
  total: number
}

type AreaContainer = {
  id: string
  label: string
  mark: string
  goals: Goal[]
}

const SAMPLE_MAP: AreaContainer[] = [
  {
    id: 'career',
    label: 'Career',
    mark: '✎',
    goals: [
      { id: 'g1', title: 'Become someone who ships product thinking', done: 5, total: 12 },
      { id: 'g2', title: 'Talk to users every week', done: 9, total: 30 },
    ],
  },
  {
    id: 'health',
    label: 'Health & Fitness',
    mark: '⌇',
    goals: [
      { id: 'g3', title: 'Move my body four days a week', done: 18, total: 48 },
      { id: 'g4', title: 'Sleep before midnight', done: 22, total: 52 },
    ],
  },
  {
    id: 'relationships',
    label: 'Relationships',
    mark: '✦',
    goals: [
      { id: 'g5', title: 'Reach out to one person I miss each week', done: 7, total: 26 },
    ],
  },
]

// ─── Page ──────────────────────────────────────────────────────────────────

export default function BrowseMapPage() {
  const { setTheme } = useTheme()
  useEffect(() => { setTheme('notepad') }, [setTheme])

  const totalGoals = SAMPLE_MAP.reduce((n, a) => n + a.goals.length, 0)

  return (
    <div className="min-h-dvh flex flex-col" style={{ padding: '24px 20px 40px' }}>
      {/* Top bar */}
      <div
        className="flex items-center justify-between"
        style={{ width: '100%', maxWidth: 560, alignSelf: 'center' }}
      >
        <Link
          href="/app/mindmap"
          style={{
            color: 'var(--text-sub)',
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            textDecoration: 'none',
            padding: 4,
          }}
        >
          ← Back
        </Link>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: 'var(--text-sub)',
            margin: 0,
          }}
        >
          Overview
        </p>
        <div style={{ width: 48 }} aria-hidden />
      </div>

      <div
        className="flex-1 flex flex-col items-center"
        style={{ paddingTop: 16, width: '100%' }}
      >
        <div className="w-full flex flex-col" style={{ maxWidth: 560, gap: 20 }}>
          {/* Header */}
          <div className="flex flex-col" style={{ gap: 4 }}>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: 'var(--pink)',
                margin: 0,
              }}
            >
              Your mindmap
            </p>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 28,
                lineHeight: '32px',
                letterSpacing: '-0.5px',
                color: 'var(--text-h1)',
                margin: 0,
              }}
            >
              The whole picture.
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                lineHeight: '20px',
                color: 'var(--text-sub)',
                margin: '4px 0 0',
              }}
            >
              {SAMPLE_MAP.length} areas · {totalGoals} goals in motion. Tap a goal to open its timeline.
            </p>
          </div>

          {/* Area containers */}
          {SAMPLE_MAP.map(area => (
            <AreaCard key={area.id} area={area} />
          ))}

          {/* Add another area */}
          <Link
            href="/app/mindmap/new"
            style={{ textDecoration: 'none', display: 'block' }}
          >
            <div
              style={{
                border: '1.5px dashed var(--input-divider)',
                borderRadius: 'var(--card-radius)',
                padding: '16px 18px',
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 15,
                  letterSpacing: '-0.2px',
                  color: 'var(--text-sub)',
                  margin: 0,
                }}
              >
                + Add another area of life
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Area container ────────────────────────────────────────────────────────

function AreaCard({ area }: { area: AreaContainer }) {
  const done = area.goals.reduce((n, g) => n + g.done, 0)
  const total = area.goals.reduce((n, g) => n + g.total, 0)
  const pct = total ? Math.round((done / total) * 100) : 0

  return (
    <div
      style={{
        background: 'var(--card-bg)',
        borderTop: 'var(--card-bt)',
        borderLeft: 'var(--card-bl)',
        borderRight: 'var(--card-br)',
        borderBottom: 'var(--card-bb)',
        borderRadius: 'var(--card-radius)',
        padding: '16px 18px',
        filter: 'var(--card-filter, none)',
      }}
    >
      {/* Area header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
        <div className="flex items-center" style={{ gap: 10 }}>
          <span
            aria-hidden
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              lineHeight: 1,
              color: 'var(--pink)',
            }}
          >
            {area.mark}
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
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: 0.5,
            color: 'var(--cyan)',
          }}
        >
          {pct}%
        </span>
      </div>

      {/* Stacked goals */}
      <div className="flex flex-col" style={{ gap: 12 }}>
        {area.goals.map(g => (
          <GoalRow key={g.id} goal={g} />
        ))}
      </div>
    </div>
  )
}

function GoalRow({ goal }: { goal: Goal }) {
  const pct = goal.total ? Math.round((goal.done / goal.total) * 100) : 0
  return (
    <Link
      href="/app/mindmap/new"
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <div
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--input-divider)',
          borderRadius: 8,
          padding: '12px 14px',
        }}
      >
        <div
          className="flex items-start justify-between"
          style={{ gap: 12, marginBottom: 10 }}
        >
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
              fontSize: 13,
              lineHeight: '18px',
              color: 'var(--text-h1)',
              margin: 0,
              flex: 1,
            }}
          >
            {goal.title}
          </p>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 11,
              color: 'var(--text-sub)',
              whiteSpace: 'nowrap',
              marginTop: 1,
            }}
          >
            {goal.done}/{goal.total}
          </span>
        </div>

        {/* Progress bar */}
        <div
          aria-hidden
          style={{
            position: 'relative',
            height: 8,
            borderRadius: 999,
            background: 'var(--input-divider)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: '0 auto 0 0',
              width: `${pct}%`,
              background: 'var(--pink)',
              borderRadius: 999,
            }}
          />
        </div>
      </div>
    </Link>
  )
}
