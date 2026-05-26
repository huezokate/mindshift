'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import EntryCard from './EntryCard'
import type { JournalEntry, JournalFilter } from '@/lib/journal-types'

const PAGE_SIZE = 10

type Props = {
  initialEntries: JournalEntry[]
  initialHasMore: boolean
}

type TabBtnProps = {
  value: JournalFilter
  label: string
  current: JournalFilter
  onSelect: (v: JournalFilter) => void
}

function TabBtn({ value, label, current, onSelect }: TabBtnProps) {
  const active = current === value
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      style={{
        flex: 1,
        padding: '8px 12px',
        background: 'transparent',
        border: 'none',
        borderBottom: active ? '2px solid var(--cyan)' : '2px solid transparent',
        color: active ? 'var(--cyan)' : 'var(--text-meta)',
        fontFamily: 'var(--font-btn)',
        fontWeight: 600,
        fontSize: 12,
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}

export default function JournalV2Client({ initialEntries, initialHasMore }: Props) {
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [filter, setFilter] = useState<JournalFilter>('all')
  const [loading, setLoading] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [seedMsg, setSeedMsg] = useState<string | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)

  const fetchPage = useCallback(async (nextFilter: JournalFilter, offset: number, replace: boolean) => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    try {
      const res = await fetch(`/api/journal-v2/entries?offset=${offset}&limit=${PAGE_SIZE}&filter=${nextFilter}`)
      const data = await res.json()
      const next = (data.sessions ?? []) as JournalEntry[]
      setEntries(prev => (replace ? next : [...prev, ...next]))
      setHasMore(!!data.hasMore)
    } catch {
      // ignore — user can retry by scrolling
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [])

  const handleSelectFilter = useCallback((next: JournalFilter) => {
    if (next === filter) return
    setFilter(next)
    fetchPage(next, 0, true)
  }, [filter, fetchPage])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore) return
    const obs = new IntersectionObserver(
      ioEntries => {
        if (ioEntries[0].isIntersecting) fetchPage(filter, entries.length, false)
      },
      { rootMargin: '300px' }
    )
    obs.observe(sentinel)
    return () => obs.disconnect()
  }, [hasMore, filter, fetchPage, entries.length])

  async function runSeed() {
    if (seeding) return
    setSeeding(true)
    setSeedMsg(null)
    try {
      const res = await fetch('/api/journal-v2/seed', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setSeedMsg(data?.error ?? 'Seed failed.')
      } else {
        setSeedMsg(`Loaded ${data.createdEntries} demo entries.`)
        await fetchPage(filter, 0, true)
      }
    } catch {
      setSeedMsg('Seed failed.')
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(127,127,127,0.15)' }}>
        <TabBtn value="all" label="All entries" current={filter} onSelect={handleSelectFilter} />
        <TabBtn value="favorites" label="Favorites" current={filter} onSelect={handleSelectFilter} />
      </div>

      {entries.length === 0 && !loading && (
        <div className="flex flex-col items-center gap-4 text-center" style={{ paddingTop: 24 }}>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-sub)',
            lineHeight: '20px', letterSpacing: '0.52px',
          }}>
            {filter === 'favorites'
              ? 'Nothing saved yet. Tap the star on a lens response to keep it here.'
              : 'Nothing here yet. Save your first perspective, or load a demo to look around.'}
          </p>
          {filter === 'all' && (
            <button
              type="button"
              onClick={runSeed}
              disabled={seeding}
              style={{
                fontFamily: 'var(--font-btn)', fontWeight: 600, fontSize: 13,
                letterSpacing: 'var(--btn-letter-spacing, 3px)',
                color: 'var(--btn-color)', background: 'var(--btn-bg)',
                borderTop: 'var(--btn-bt)', borderLeft: 'var(--btn-bl)',
                borderRight: 'var(--btn-br)', borderBottom: 'var(--btn-bb)',
                borderRadius: 'var(--btn-radius)', padding: '14px 28px',
                boxShadow: 'var(--btn-shadow)', cursor: seeding ? 'wait' : 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {seeding ? 'Loading demo…' : 'Load 10-entry demo'}
            </button>
          )}
          {seedMsg && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-meta)' }}>
              {seedMsg}
            </p>
          )}
        </div>
      )}

      {entries.map(entry => (
        <EntryCard key={entry.id} entry={entry} />
      ))}

      {hasMore && (
        <div ref={sentinelRef} style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
          {loading && (
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)',
              letterSpacing: '0.52px', textTransform: 'uppercase',
            }}>
              Loading…
            </p>
          )}
        </div>
      )}

      {entries.length > 0 && (
        <button
          type="button"
          onClick={runSeed}
          disabled={seeding}
          style={{
            marginTop: 8,
            fontFamily: 'var(--font-btn)', fontWeight: 600, fontSize: 11,
            letterSpacing: '1.5px', color: 'var(--text-meta)',
            background: 'transparent', border: '1px dashed rgba(127,127,127,0.3)',
            borderRadius: 2, padding: '8px 12px', cursor: seeding ? 'wait' : 'pointer',
            textTransform: 'uppercase',
          }}
        >
          {seeding ? 'Resetting…' : 'Reset demo entries'}
        </button>
      )}
      {seedMsg && entries.length > 0 && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-meta)', textAlign: 'center' }}>
          {seedMsg}
        </p>
      )}
    </div>
  )
}
