'use client'
import Link from 'next/link'
import { useEffect } from 'react'
import { useTheme } from '@/lib/theme'

export default function MindmapLanding() {
  const { setTheme } = useTheme()

  // First-deliverable scope: force notepad theme on the mindmap surface
  useEffect(() => {
    setTheme('notepad')
  }, [setTheme])

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
          MindShift · Mindmap
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
          Plan a year that&rsquo;s actually yours.
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
          Pick one part of your life. Tell us what you want. We&rsquo;ll draft milestones together
          and check in with you each week.
        </p>
      </div>

      <div className="w-full flex flex-col" style={{ maxWidth: 420, gap: 16 }}>
        <LandingCard
          href="/app/mindmap/new"
          eyebrow="Start"
          title="Begin a year"
          body="Choose a life area, share your wish, and shape your year of milestones."
        />
        <LandingCard
          href="/app/mindmap/reflect"
          eyebrow="This Sunday"
          title="Weekly reflection"
          body="Three questions. About seven minutes. The thing that makes the plan work."
        />
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
