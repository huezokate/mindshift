'use client'
// Visual QA only. Renders the rebuilt Journal feed (personalized header +
// date-labeled preview cards + welcome card) against all three themes without
// auth/DB. Toggle theme with the buttons or ?theme=. Taps go nowhere meaningful
// here (the detail route is Clerk-gated), but the navigation wiring is real.
// Safe to delete this file once the v2 feature is approved.

import { useEffect, useState } from 'react'
import { useTheme, type Theme } from '@/lib/theme'
import JournalHeader from '@/components/journal/JournalHeader'
import JournalPreviewCard from '@/components/journal/JournalPreviewCard'
import WelcomeCard from '@/components/journal/WelcomeCard'
import type { JournalEntry, LensResponseV2 } from '@/lib/journal-types'

const HOUR_AGO = '2026-06-13T11:00:00Z'
const FEW_HOURS_AGO = '2026-06-13T07:00:00Z'
const DAY_AGO = '2026-06-12T18:00:00Z'
const TWO_DAYS_AGO = '2026-06-11T18:00:00Z'
const WEEK_AGO = '2026-06-06T18:00:00Z'

// ── Sample lens responses ──────────────────────────────────────────────────
function lens(
  id: string,
  figure_id: string,
  text: string,
  opts: { is_favorite?: boolean; shares?: LensResponseV2['shares']; created_at?: string } = {},
): LensResponseV2 {
  return {
    id,
    figure_id,
    response_text: text,
    is_favorite: opts.is_favorite ?? false,
    created_at: opts.created_at ?? HOUR_AGO,
    shares: opts.shares ?? [],
  }
}

// ── 10 entry variants ──────────────────────────────────────────────────────
const ENTRIES: JournalEntry[] = [
  // 1. Fresh post, no lens, private
  {
    id: 'v1-fresh-private',
    vent_text: "Quitting my corporate job in two weeks. Terrified. Excited. Mostly terrified.",
    theme: 'cyberpunk',
    is_public: false,
    created_at: HOUR_AGO,
    lens_responses: [],
  },
  // 2. Fresh post, no lens, public
  {
    id: 'v2-fresh-public',
    vent_text: "Posted a vulnerable thing online and now I'm regretting it. Why do I do this to myself.",
    theme: 'cyberpunk',
    is_public: true,
    created_at: FEW_HOURS_AGO,
    lens_responses: [],
  },
  // 3. Post + 1 lens, private
  {
    id: 'v3-one-lens',
    vent_text: "I can't tell if I want to leave the relationship or if I'm just bored. The thought of starting over is exhausting.",
    theme: 'cyberpunk',
    is_public: false,
    created_at: HOUR_AGO,
    lens_responses: [
      lens('v3-l1', 'maya-angelou',
        "You know the difference between bored and unwell. The body knows. Sit with the question another week before you answer it."),
    ],
  },
  // 4. Post + 2 lenses, private
  {
    id: 'v4-two-lenses',
    vent_text: "My sister borrowed money six months ago and won't bring it up. I love her but it's eating at me.",
    theme: 'cyberpunk',
    is_public: false,
    created_at: DAY_AGO,
    lens_responses: [
      lens('v4-l1', 'm-gandhi',
        "Resentment grows quietly in the soil of unspoken needs. Speak. Not in anger, but plainly."),
      lens('v4-l2', 'dolly-parton',
        "Honey, money between family is just family with an awkward room added on. Open the door before the room takes over the house."),
    ],
  },
  // 5. Post + 3 lenses, private
  {
    id: 'v5-three-lenses',
    vent_text: "Third Tuesday in a row I've worked until 11. I love the project but I'm starting to resent the team for not pulling their weight.",
    theme: 'cyberpunk',
    is_public: false,
    created_at: TWO_DAYS_AGO,
    lens_responses: [
      lens('v5-l1', 'a-lincoln',
        "A man who works himself to the bone for those who will not share the load is not a partner — he is a draft horse. Begin with one Tuesday. Just one."),
      lens('v5-l2', 'dolly-parton',
        "Honey, you can love your work and still go home at six. That isn't quitting on it — that's keeping enough of yourself to come back tomorrow."),
      lens('v5-l3', 'm-gandhi',
        "Resentment grows quietly in the soil of unspoken needs. Speak. Not in anger, but plainly."),
    ],
  },
  // 6. Post + 1 lens + 1 share (Instagram)
  {
    id: 'v6-one-share',
    vent_text: "Friend cancelled last minute again. Trying to decide if I should say something or just stop initiating.",
    theme: 'cyberpunk',
    is_public: false,
    created_at: DAY_AGO,
    lens_responses: [
      lens('v6-l1', 'maya-angelou',
        "When someone shows you who they are, believe them the first time. But also: ask, before you assume what they're showing.",
        {
          shares: [{ id: 'v6-s1', platform: 'instagram', shared_at: HOUR_AGO }],
        }),
    ],
  },
  // 7. Post + 2 lenses + 1 share on one of them
  {
    id: 'v7-two-lenses-one-share',
    vent_text: "Trying to break the scroll habit and I'm losing. Three hours yesterday on nothing.",
    theme: 'cyberpunk',
    is_public: false,
    created_at: TWO_DAYS_AGO,
    lens_responses: [
      lens('v7-l1', 'frida-kahlo',
        "The phone is not your enemy. The hollow it's filling is. Find the hollow.",
        { is_favorite: true,
          shares: [{ id: 'v7-s1', platform: 'instagram', shared_at: DAY_AGO }] }),
      lens('v7-l2', 'socrates',
        "What is it you sought when you opened the application? Did you find it? If not, what would?"),
    ],
  },
  // 8. Post + 3 lenses + multi-platform shares
  {
    id: 'v8-multi-share',
    vent_text: "Mom called crying about Dad again. I'm 2000 miles away and there's nothing I can do.",
    theme: 'cyberpunk',
    is_public: true,
    created_at: TWO_DAYS_AGO,
    lens_responses: [
      lens('v8-l1', 'n-mandela',
        "Distance does not absolve us, but it does refocus what we are able to give. Your presence is the call itself.",
        { shares: [{ id: 'v8-s1', platform: 'instagram', shared_at: DAY_AGO }] }),
      lens('v8-l2', 'maya-angelou',
        "You cannot lift the weight from across the country. You can lift the loneliness of carrying it alone.",
        { is_favorite: true,
          shares: [
            { id: 'v8-s2', platform: 'tiktok', shared_at: DAY_AGO },
            { id: 'v8-s3', platform: 'instagram', shared_at: HOUR_AGO },
          ] }),
      lens('v8-l3', 'rosa-parks',
        "The hardest seat is the one beside someone you love when you cannot fix what hurts them. Sit there anyway.",
        { shares: [{ id: 'v8-s4', platform: 'facebook', shared_at: HOUR_AGO }] }),
    ],
  },
  // 9. Post + 2 lenses + many shares (popular)
  {
    id: 'v9-popular',
    vent_text: "Got the promotion and I'm not happy about it. What's wrong with me.",
    theme: 'cyberpunk',
    is_public: true,
    created_at: WEEK_AGO,
    lens_responses: [
      lens('v9-l1', 'salvador-dali',
        "Nothing is wrong with you. The shape of what you wanted shifted while you were running toward it. Stop. Look at the new shape.",
        { is_favorite: true,
          shares: [
            { id: 'v9-s1', platform: 'instagram', shared_at: WEEK_AGO },
            { id: 'v9-s2', platform: 'tiktok', shared_at: TWO_DAYS_AGO },
          ] }),
      lens('v9-l2', 'maya-angelou',
        "The summit is rarely as windless as we promised ourselves at the base.",
        { shares: [{ id: 'v9-s4', platform: 'facebook', shared_at: DAY_AGO }] }),
    ],
  },
  // 10. Post + 1 lens + cross-posted single share
  {
    id: 'v10-cross-post',
    vent_text: "I keep saying yes to things I don't want to do. Then I'm exhausted and resentful.",
    theme: 'cyberpunk',
    is_public: true,
    created_at: WEEK_AGO,
    lens_responses: [
      lens('v10-l1', 'dolly-parton',
        "Sweetheart, 'no' is a complete sentence. You don't owe anybody the rest of the paragraph.",
        { is_favorite: true,
          shares: [{ id: 'v10-s1', platform: 'tiktok', shared_at: WEEK_AGO }] }),
    ],
  },
]

export default function JournalPreviewPage() {
  // Drive the REAL ThemeProvider (not a local attribute toggle) so child
  // components' useTheme() — portrait selection, per-theme layout branches —
  // matches the CSS theme. Setting only data-theme would switch CSS vars while
  // leaving every JS theme branch stuck on the default. This was the bug.
  const { theme, setTheme } = useTheme()
  const [showWelcome, setShowWelcome] = useState(false)

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
        minHeight: 44,
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
      <div className="w-full" style={{ maxWidth: 440, padding: '16px 20px 80px' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          {btn('cyberpunk', 'Cyberpunk')}
          {btn('kawaii', 'Kawaii')}
          {btn('notepad', 'Notepad')}
        </div>
        <button
          type="button"
          onClick={() => setShowWelcome(s => !s)}
          style={{
            width: '100%', marginBottom: 16, minHeight: 44,
            padding: '8px 12px', background: 'transparent',
            border: '1px dashed rgba(127,127,127,0.4)', color: 'var(--text-meta)',
            fontFamily: 'var(--font-btn)', fontWeight: 600, fontSize: 10,
            letterSpacing: '1.2px', textTransform: 'uppercase', cursor: 'pointer',
          }}
        >
          {showWelcome ? 'Show populated feed' : 'Show first-run / welcome state'}
        </button>

        {/* Personalized header — QA uses the "Kate" sample. */}
        <JournalHeader firstName="Kate" />

        {showWelcome ? (
          <div style={{ marginTop: 16 }}>
            <WelcomeCard />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
            {ENTRIES.map(entry => (
              <JournalPreviewCard
                key={entry.id}
                entry={entry}
                onAddLens={(id) => {
                  // eslint-disable-next-line no-console
                  console.log('[journal-preview] add lens', id)
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
