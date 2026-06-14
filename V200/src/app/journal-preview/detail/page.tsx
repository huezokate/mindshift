'use client'
// Visual QA only. Renders the Journal Entry detail page against all three
// themes without auth/DB. Toggle theme with the buttons or ?theme=.
// Safe to delete once the detail view is approved.

import { useEffect } from 'react'
import { useTheme, type Theme } from '@/lib/theme'
import EntryDetail from '@/components/journal/EntryDetail'
import type { JournalEntry } from '@/lib/journal-types'

const HOUR_AGO = '2026-06-13T11:00:00Z'
const DAY_AGO = '2026-06-12T13:00:00Z'
const TWO_DAYS_AGO = '2026-06-11T13:00:00Z'

// Rich sample: 3 lenses, a favorite, and multi-platform shares so the lens
// card header (star + share-count) and the carousel/dots are exercised.
const SAMPLE: JournalEntry = {
  id: 'detail-sample',
  vent_text:
    "Contemplating a job change. I've been at this company four years and I'm comfortable — maybe too comfortable. There's a startup offer on the table that scares me, pays a little less, but the work is the kind of thing I'd do for free. I keep telling myself I'm being responsible by staying. But I think I'm just being afraid, and dressing it up as prudence.",
  theme: 'cyberpunk',
  is_public: true,
  created_at: HOUR_AGO,
  lens_responses: [
    {
      id: 'd-l1',
      figure_id: 'a-lincoln',
      response_text:
        "Comfort is a soft chair that slowly forgets the shape of the man who sits in it. You ask whether you are prudent or afraid — but you already know, for prudence does not need to keep reminding itself that it is prudent. Sharpen the axe: learn the offer cold, the numbers, the people. Then swing without apology.",
      is_favorite: true,
      created_at: HOUR_AGO,
      shares: [
        { id: 'd-s1', platform: 'instagram', shared_at: HOUR_AGO },
        { id: 'd-s2', platform: 'tiktok', shared_at: DAY_AGO },
      ],
    },
    {
      id: 'd-l2',
      figure_id: 'dolly-parton',
      response_text:
        "Sugar, 'responsible' is a word folks use when they're too scared to say what they really want out loud. You said it yourself — you'd do this work for free. That's not a job, that's a calling, and callings don't tend to call twice. A little less money and a lot more you sounds like a raise to me.",
      is_favorite: false,
      created_at: DAY_AGO,
      shares: [{ id: 'd-s3', platform: 'instagram', shared_at: DAY_AGO }],
    },
    {
      id: 'd-l3',
      figure_id: 'socrates',
      response_text:
        "Tell me — when you imagine yourself five years hence, having stayed, what do you feel? And when you imagine having gone? You name fear as your motive for leaving, and prudence as your motive for staying. But might it not be the reverse? What is it, exactly, that you are protecting by remaining?",
      is_favorite: false,
      created_at: TWO_DAYS_AGO,
      shares: [],
    },
  ],
}

export default function JournalDetailPreviewPage() {
  // Drive the REAL ThemeProvider so EntryDetail/LensCard useTheme() (portraits,
  // per-theme branches) match the CSS theme — not just the data-theme attribute.
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('theme')
    if (p === 'kawaii' || p === 'notepad' || p === 'cyberpunk') setTheme(p)
  }, [setTheme])

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
      <div className="w-full" style={{ maxWidth: 440 }}>
        <div style={{ display: 'flex', gap: 4, padding: '16px 16px 0' }}>
          {btn('cyberpunk', 'Cyberpunk')}
          {btn('kawaii', 'Kawaii')}
          {btn('notepad', 'Notepad')}
        </div>
        <EntryDetail entry={SAMPLE} />
      </div>
    </div>
  )
}
