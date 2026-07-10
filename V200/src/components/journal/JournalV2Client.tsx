'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import JournalPreviewCard from './JournalPreviewCard'
import JournalHeader from './JournalHeader'
import LensPickerSheet from './LensPickerSheet'
import AppHeader from '@/components/nav/AppHeader'
import Button from '@/components/ui/Button'
import { useTheme } from '@/lib/theme'
import { applyLensToEntry } from '@/lib/add-lens'
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
  const { theme } = useTheme()
  const router = useRouter()
  const isCyberpunk = theme === 'cyberpunk'
  const isKawaii = theme === 'kawaii'
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

  // Add-a-lens picker (T-018-04): the lens footer opens the shared picker; on
  // Select we generate + append the lens, then optimistically show it. Back
  // returns to the journal.
  const [pickerEntryId, setPickerEntryId] = useState<string | null>(null)
  const [addingLens, setAddingLens] = useState(false)
  const [addLensError, setAddLensError] = useState<string | null>(null)

  const handleAddLens = useCallback((entryId: string) => {
    setAddLensError(null)
    setPickerEntryId(entryId)
  }, [])

  const handlePickLens = useCallback(async (figureId: string) => {
    if (!pickerEntryId || addingLens) return
    const entry = entries.find(e => e.id === pickerEntryId)
    if (!entry) return
    setAddingLens(true)
    setAddLensError(null)
    try {
      const { lens } = await applyLensToEntry({
        sessionId: entry.id, ventText: entry.vent_text, figureId, theme,
      })
      setEntries(prev => prev.map(e =>
        e.id === entry.id
          // upsert: replace if this figure already had a lens, else append
          ? { ...e, lens_responses: [...e.lens_responses.filter(l => l.figure_id !== lens.figure_id), lens] }
          : e
      ))
      setPickerEntryId(null)
    } catch (err) {
      setAddLensError(err instanceof Error ? err.message : 'Could not add the lens.')
    } finally {
      setAddingLens(false)
    }
  }, [pickerEntryId, addingLens, entries, theme])

  return (
    <div className="flex flex-col gap-4">
      <AppHeader
        entryCount={entries.length}
        lensCount={entries.reduce((n, e) => n + e.lens_responses.length, 0)}
      />
      <JournalHeader name={firstName ?? 'user'} />

      <div style={{ display: 'flex', borderBottom: '1px solid rgba(127,127,127,0.15)' }}>
        <TabBtn value="all" label="All entries" current={filter} onSelect={handleSelectFilter} />
        <TabBtn value="favorites" label="Favorites" current={filter} onSelect={handleSelectFilter} />
      </div>

      {/* "Vent it out" — THE primary CTA (Kate 2026-07-10): the way to add a
          vent from inside the journal without rerunning the entry flow. Lives
          up here under the tabs, NOT the screen footer (the account menu
          already carries "New" down there). */}
      <Button variant="primary" icon="add" fullWidth onClick={() => router.push('/app/onboarding')}>
        Vent it out
      </Button>

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

      {/* Add-a-lens picker — shared carousel; Back returns to the journal. */}
      <LensPickerSheet
        open={pickerEntryId !== null}
        startIndex={0}
        loading={addingLens}
        error={addLensError}
        selectLabel="Add lens"
        onBack={() => { setPickerEntryId(null); setAddLensError(null) }}
        onSelect={handlePickLens}
      />
    </div>
  )
}
