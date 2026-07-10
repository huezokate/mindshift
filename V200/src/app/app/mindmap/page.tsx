'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTheme } from '@/lib/theme'

export default function MindmapLanding() {
  const { setTheme } = useTheme()

  // First-deliverable scope: force notepad theme on the mindmap surface
  useEffect(() => {
    setTheme('notepad')
  }, [setTheme])

  // Has the user already built a map? Reads their saved maps from the API.
  // `null` = not yet known (avoids a first-paint flash of the wrong state).
  // On any error we fall back to "no map" so the create CTA still shows.
  const [hasMap, setHasMap] = useState<boolean | null>(null)
  useEffect(() => {
    let active = true
    fetch('/api/mindmap/maps')
      .then(r => (r.ok ? r.json() : { maps: [] }))
      .then(data => { if (active) setHasMap((data?.maps?.length ?? 0) > 0) })
      .catch(() => { if (active) setHasMap(false) })
    return () => { active = false }
  }, [])

  return (
    <div
      className="min-h-dvh flex flex-col items-center"
      style={{ padding: '64px 24px 32px', gap: 24 }}
    >
      <div
        className="w-full flex flex-col items-center"
        style={{
          maxWidth: 420,
          gap: 8,
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: 'var(--pink)',
          }}
        >
          Minds Shift · Mindmap
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 32,
            lineHeight: '36px',
            letterSpacing: '-0.5px',
            color: 'var(--text-h1)',
            margin: 0,
          }}
        >
          {hasMap ? 'Welcome back.' : 'Plan a life that’s actually yours.'}
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            lineHeight: '22px',
            color: 'var(--text-sub)',
            marginTop: 8,
          }}
        >
          {hasMap
            ? 'Browse your map, or take a few minutes to reflect on the week.'
            : 'Pick the parts of your life you want to move. Tell us what you want. We’ll draft milestones together and check in with you each week.'}
        </p>
      </div>

      {/* Before a map exists: a single create CTA. After: browse + reflect. */}
      <div className="w-full flex flex-col" style={{ maxWidth: 420, gap: 16, minHeight: 200 }}>
        {hasMap === null ? null : hasMap ? (
          <>
            <LandingCard
              href="/app/mindmap/browse"
              eyebrow="Overview"
              title="Browse the map"
              body="See every area of life, the goals stacked under each, and how far along you are."
            />
            <LandingCard
              href="/app/mindmap/reflect"
              eyebrow="This Sunday"
              title="Weekly reflection"
              body="Three questions. About seven minutes. The thing that makes the plan work."
            />
          </>
        ) : (
          <LandingCard
            href="/app/mindmap/new"
            eyebrow="Start"
            title="Create your mindmap"
            body="Set your horizon, choose the areas of life you want to move, and shape your milestones."
          />
        )}
      </div>
    </div>
  )
}

function LandingCard({
  href,
  eyebrow,
  title,
  body,
}: {
  href: string
  eyebrow: string
  title: string
  body: string
}) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: 'none',
        display: 'block',
        filter: 'var(--card-filter, none)',
      }}
    >
      <div
        style={{
          background: 'var(--card-bg)',
          borderTop: 'var(--card-bt)',
          borderLeft: 'var(--card-bl)',
          borderRight: 'var(--card-br)',
          borderBottom: 'var(--card-bb)',
          borderRadius: 'var(--card-radius)',
          padding: '20px 24px',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: 'var(--cyan)',
            margin: 0,
          }}
        >
          {eyebrow}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: '-0.3px',
            lineHeight: '28px',
            color: 'var(--text-h1)',
            margin: '6px 0 8px',
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            lineHeight: '20px',
            color: 'var(--text-body)',
            margin: 0,
          }}
        >
          {body}
        </p>
      </div>
    </Link>
  )
}
