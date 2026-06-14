'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import JournalPreviewCard from './JournalPreviewCard'
import JournalHeader from './JournalHeader'
import WelcomeCard from './WelcomeCard'
import type { JournalEntry, JournalFilter } from '@/lib/journal-types'

const PAGE_SIZE = 10

type Props = {
  initialEntries: JournalEntry[]
  initialHasMore: boolean
  // First name for the personalized header. Route passes the Clerk user's name;
  // QA harness passes a sample. Falls back to "Your Journal" when absent.
  firstName?: string | null
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
        padding: '10px 12px',
        minHeight: 44,
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

export default function JournalV2Client({ initialEntries, initialHasMore, firstName }: Props) {
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

  const runSeed = useCallback(async () => {
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
  }, [seeding, filter, fetchPage])

  // Tapping the lens footer opens the lens picker — stubbed for now. The real
  // popup is the next task; this hook is where it drops in.
  const handleAddLens = useCallback((entryId: string) => {
    // eslint-disable-next-line no-console
    console.log('[journal] add lens to entry', entryId)
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <JournalHeader firstName={firstName} />

      <div style={{ display: 'flex', borderBottom: '1px solid rgba(127,127,127,0.15)' }}>
        <TabBtn value="all" label="All entries" current={filter} onSelect={handleSelectFilter} />
        <TabBtn value="favorites" label="Favorites" current={filter} onSelect={handleSelectFilter} />
      </div>

      {entries.length === 0 && !loading && (
        filter === 'favorites' ? (
          <div className="flex flex-col items-center gap-4 text-center" style={{ paddingTop: 24 }}>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-sub)',
              lineHeight: '20px', letterSpacing: '0.52px',
            }}>
              Nothing saved yet. Tap the star on a lens response to keep it here.
            </p>
          </div>
        ) : (
          // First-run / empty state — welcome card per Figma, demo-seed preserved.
          <WelcomeCard onLoadDemo={runSeed} seeding={seeding} seedMsg={seedMsg} />
        )
      )}

      {entries.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {entries.map(entry => (
            <JournalPreviewCard
              key={entry.id}
              entry={entry}
              onAddLens={handleAddLens}
            />
          ))}
        </div>
      )}

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
            textTransform: 'uppercase', minHeight: 44,
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
