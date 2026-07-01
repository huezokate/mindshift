// Story fixtures (T-022-04). One canonical JournalEntry reused by the journal
// smoke stories (JournalPreviewCard, EntryDetail, ChatScreen). Kept minimal — this
// is a mount smoke test, not the rich coverage of S-023. Ids/dates are hardcoded
// so snapshots stay deterministic. Only imported by `*.stories.tsx`, so it's
// tree-shaken out of the app build.
import type { JournalEntry } from '@/lib/journal-types'

// Figure id present in src/lib/figures.ts — used by ChatScreen's story.
export const DEMO_FIGURE_ID = 'a-lincoln'

export const DEMO_ENTRY: JournalEntry = {
  id: 'entry_demo_1',
  vent_text:
    "Third Tuesday in a row I've worked until 11. I love the project but I'm starting to resent the team for not pulling their weight.",
  title: 'Resentment on overwork',
  theme: 'cyberpunk',
  is_public: false,
  created_at: '2026-06-02T22:14:00.000Z',
  lens_responses: [
    {
      id: 'lens_demo_1',
      figure_id: 'a-lincoln',
      response_text:
        'A man who works himself to the bone for those who will not share the load is not a partner — he is a draft horse. Begin with one Tuesday. Just one.',
      is_favorite: true,
      created_at: '2026-06-02T22:15:00.000Z',
      shares: [
        { id: 'share_demo_1', platform: 'instagram', shared_at: '2026-06-03T09:00:00.000Z' },
      ],
    },
    {
      id: 'lens_demo_2',
      figure_id: 'marilyn-monroe',
      response_text:
        "They'll take every hour you hand them and call it devotion. Loving the work doesn't mean disappearing into it. Go home at six.",
      is_favorite: false,
      created_at: '2026-06-02T22:16:00.000Z',
      shares: [],
    },
  ],
}
