'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import SessionCard from './SessionCard'
import Link from 'next/link'

const PAGE_SIZE = 10

type LensResponse = {
  id: string
  figure_id: string
  response_text: string
  created_at: string
}

type Session = {
  id: string
  vent_text: string
  theme: string
  created_at: string
  lens_responses: LensResponse[]
}

type Props = {
  initialSessions: Session[]
  initialHasMore: boolean
}

function WelcomeCard() {
  return (
    <div style={{
      background: 'var(--hcard-bg)',
      borderTop: 'var(--hcard-bt)',
      borderLeft: 'var(--hcard-bl)',
      borderRight: 'var(--hcard-br)',
      borderBottom: 'var(--hcard-bb)',
      borderRadius: 'var(--hcard-radius)',
      padding: 'var(--hcard-padding)',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      alignItems: 'center',
    }}>
      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, lineHeight: '20px', letterSpacing: '1.44px', color: 'var(--text-h1)', textTransform: 'uppercase', textAlign: 'center', width: '100%' }}>
        Welcome to the journal feature!
      </p>
      <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12, lineHeight: '14px', letterSpacing: '1.32px', color: 'var(--cyan)', textTransform: 'uppercase', textAlign: 'center', width: '100%' }}>
        Your personal hub to save and share all future MindShifts
      </p>
      <ul style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
        {['Journal your thoughts', 'Share your perspectives'].map(item => (
          <li key={item} style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px', letterSpacing: '0.52px', color: 'var(--cyan)' }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function JournalClient({ initialSessions, initialHasMore }: Props) {
  const [sessions, setSessions] = useState<Session[]>(initialSessions)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)
  const loadingRef = useRef(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const fetchMore = useCallback(async (offset: number) => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    try {
      const res = await fetch(`/api/journal?offset=${offset}&limit=${PAGE_SIZE}`)
      const data = await res.json()
      setSessions(prev => [...prev, ...(data.sessions ?? [])])
      setHasMore(data.hasMore ?? false)
    } catch {
      // silently fail — user can scroll again to retry
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchMore(sessions.length)
        }
      },
      { rootMargin: '300px' }  // start loading before the bottom is reached
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [sessions.length, hasMore, fetchMore])

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 text-center" style={{ paddingTop: 32 }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-sub)', lineHeight: '20px', letterSpacing: '0.52px' }}>
          No entries yet. Vent something and save your first perspective.
        </p>
        <Link
          href="/app/vent"
          className="uppercase"
          style={{ fontFamily: 'var(--font-btn)', fontWeight: 600, fontSize: 13, letterSpacing: 'var(--btn-letter-spacing, 3px)', color: 'var(--btn-color)', background: 'var(--btn-bg)', borderTop: 'var(--btn-bt)', borderLeft: 'var(--btn-bl)', borderRight: 'var(--btn-br)', borderBottom: 'var(--btn-bb)', borderRadius: 'var(--btn-radius)', padding: '14px 28px', boxShadow: 'var(--btn-shadow)', display: 'inline-block' }}
        >
          Start now →
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {sessions.map(session => (
        <SessionCard
          key={session.id}
          ventText={session.vent_text}
          createdAt={session.created_at}
          lensResponses={session.lens_responses ?? []}
        />
      ))}

      {/* Welcome card — only after the very first saved entry */}
      {sessions.length === 1 && !hasMore && <WelcomeCard />}

      {/* Infinite scroll sentinel */}
      {hasMore && (
        <div ref={sentinelRef} style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
          {loading && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.52px', textTransform: 'uppercase' }}>
              Loading...
            </p>
          )}
        </div>
      )}
    </div>
  )
}
