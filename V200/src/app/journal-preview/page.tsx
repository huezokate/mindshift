'use client'
// Visual QA only. Renders sample entries against all three themes
// without auth/DB. Toggle theme with the buttons; copy goes nowhere.
// Safe to delete this file once the v2 feature is approved.

import { useEffect, useState } from 'react'
import EntryCard from '@/components/journal/EntryCard'
import type { JournalEntry } from '@/lib/journal-types'

const NOW = '2026-05-25T18:00:00Z'
const HOUR_AGO = '2026-05-25T17:00:00Z'
const DAY_AGO = '2026-05-24T18:00:00Z'

const ENTRIES: JournalEntry[] = [
  {
    id: 'preview-1',
    vent_text:
      "Third Tuesday in a row I've worked until 11. I love the project but I'm starting to resent the team for not pulling their weight.",
    theme: 'cyberpunk',
    is_public: false,
    created_at: HOUR_AGO,
    lens_responses: [
      {
        id: 'preview-1-r1',
        figure_id: 'a-lincoln',
        response_text:
          "A man who works himself to the bone for those who will not share the load is not a partner — he is a draft horse. Begin with one Tuesday. Just one.",
        is_favorite: true,
        created_at: HOUR_AGO,
        shares: [
          { id: 'preview-share-1', platform: 'instagram', shared_at: DAY_AGO },
        ],
      },
      {
        id: 'preview-1-r2',
        figure_id: 'dolly-parton',
        response_text:
          "Honey, you can love your work and still go home at six. That isn't quitting on it — that's keeping enough of yourself to come back tomorrow.",
        is_favorite: false,
        created_at: HOUR_AGO,
        shares: [],
      },
    ],
  },
  {
    id: 'preview-2',
    vent_text:
      "Quitting my corporate job in two weeks. Terrified. Excited. Mostly terrified.",
    theme: 'cyberpunk',
    is_public: true,
    created_at: DAY_AGO,
    lens_responses: [],
  },
]

type Theme = 'cyberpunk' | 'kawaii' | 'notepad'

function readThemeFromURL(): Theme {
  if (typeof window === 'undefined') return 'cyberpunk'
  const p = new URLSearchParams(window.location.search).get('theme')
  if (p === 'kawaii' || p === 'notepad') return p
  return 'cyberpunk'
}

export default function JournalPreviewPage() {
  const [theme, setTheme] = useState<Theme>('cyberpunk')

  useEffect(() => {
    setTheme(readThemeFromURL())
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const btn = (t: Theme, label: string) => (
    <button
      key={t}
      type="button"
      onClick={() => setTheme(t)}
      style={{
        flex: 1,
        padding: '8px 12px',
        background: theme === t ? 'var(--cyan)' : 'transparent',
        color: theme === t ? 'var(--bg)' : 'var(--cyan)',
        border: '1px solid var(--cyan)',
        fontFamily: 'var(--font-btn)',
        fontWeight: 600,
        fontSize: 11,
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )

  return (
    <div className="min-h-dvh flex flex-col items-center" style={{ background: 'var(--bg)' }}>
      <div className="w-full" style={{ maxWidth: 440, padding: '24px 20px 80px' }}>
        <p style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22,
          color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: 2,
          marginBottom: 4, textAlign: 'center',
        }}>
          Journal v2 · Visual QA
        </p>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-meta)',
          marginBottom: 16, textAlign: 'center',
        }}>
          Public route. No auth. No database. Share/favorite buttons fire but the
          API calls will 401 — that's expected here.
        </p>

        <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
          {btn('cyberpunk', 'Cyberpunk')}
          {btn('kawaii', 'Kawaii')}
          {btn('notepad', 'Notepad')}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {ENTRIES.map(entry => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>

        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-meta)',
          marginTop: 32, textAlign: 'center', letterSpacing: '0.5px',
        }}>
          Tap an entry to see the expanded view, the favorite star, the share
          history, and the share-sheet modal. None of those mutate state on
          this preview route.
        </p>
      </div>
    </div>
  )
}
