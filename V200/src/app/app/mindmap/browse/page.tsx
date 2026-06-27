'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTheme } from '@/lib/theme'
import { AREA_BY_ID, type AreaId } from '@/lib/mindmap-areas'
import { AreaIcon } from '@/components/mindmap/AreaIcon'
import type { SavedGoal, SavedMap } from '@/lib/mindmap'

// Overview of the user's saved map(s). One card per goal (life area); each
// lists its milestones with a done/total progress bar derived from milestone
// status. Data comes from GET /api/mindmap/maps.

export default function BrowseMapPage() {
  const { setTheme } = useTheme()
  useEffect(() => {
    setTheme('notepad')
  }, [setTheme])

  const [goals, setGoals] = useState<SavedGoal[] | null>(null) // null = loading

  useEffect(() => {
    let active = true
    fetch('/api/mindmap/maps')
      .then(r => (r.ok ? r.json() : { maps: [] }))
      .then((data: { maps?: SavedMap[] }) => {
        if (!active) return
        // Flatten goals across all active maps (v1 typically has one map).
        setGoals((data?.maps ?? []).flatMap(m => m.goals ?? []))
      })
      .catch(() => {
        if (active) setGoals([])
      })
    return () => {
      active = false
    }
  }, [])

  const areaCount = goals?.length ?? 0
  const milestoneCount = goals?.reduce((n, g) => n + g.milestones.length, 0) ?? 0

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

      <div className="flex-1 flex flex-col items-center" style={{ paddingTop: 16, width: '100%' }}>
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
              {goals === null
                ? 'Loading your map…'
                : areaCount === 0
                  ? "You haven't built a map yet."
                  : `${areaCount} ${areaCount === 1 ? 'area' : 'areas'} · ${milestoneCount} milestone${milestoneCount === 1 ? '' : 's'} in motion. Tap a goal to open the map.`}
            </p>
          </div>

          {/* Area containers (one per goal) */}
          {goals?.map(goal => (
            <AreaCard key={goal.id} goal={goal} />
          ))}

          {/* Create / add another */}
          {goals !== null && (
            <Link href="/app/mindmap/new" style={{ textDecoration: 'none', display: 'block' }}>
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
                  {areaCount === 0 ? 'Create your mindmap' : '+ Add another area of life'}
                </p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Area container (one saved goal) ─────────────────────────────────────────

function AreaCard({ goal }: { goal: SavedGoal }) {
  const area = AREA_BY_ID[goal.category as AreaId]
  const total = goal.milestones.length
  const done = goal.milestones.filter(m => m.status === 'done').length
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
      <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
        <div className="flex items-center" style={{ gap: 10 }}>
          <span aria-hidden style={{ display: 'inline-flex', color: 'var(--pink)', lineHeight: 1 }}>
            <AreaIcon id={goal.category as AreaId} size={22} />
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
            {area?.label ?? goal.category}
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
          {done}/{total}
        </span>
      </div>

      {/* Area-level progress */}
      <div
        aria-hidden
        style={{
          position: 'relative',
          height: 8,
          borderRadius: 999,
          background: 'var(--input-divider)',
          overflow: 'hidden',
          marginBottom: 14,
        }}
      >
        <div
          style={{ position: 'absolute', inset: '0 auto 0 0', width: `${pct}%`, background: 'var(--pink)', borderRadius: 999 }}
        />
      </div>

      {/* Milestones */}
      <div className="flex flex-col" style={{ gap: 10 }}>
        {goal.milestones.map(m => (
          <Link
            key={m.id}
            href="/app/mindmap/map"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'flex-start', gap: 10 }}
          >
            <span
              aria-hidden
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                flexShrink: 0,
                marginTop: 2,
                background: m.status === 'done' ? 'var(--cyan)' : 'transparent',
                border: m.status === 'done' ? 'none' : '1.5px solid var(--input-divider)',
              }}
            />
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                fontSize: 13,
                lineHeight: '18px',
                color: 'var(--text-h1)',
                margin: 0,
              }}
            >
              {m.headline || m.outcome}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
