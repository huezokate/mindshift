import type { JournalEntryLite, LensResponseLite } from '../journal-types';

/** Story/test fixtures — content style mirrors the web story fixtures. */

export const napoleonResponse: LensResponseLite = {
  figureId: 'napoleon',
  figureName: 'Napoleon Bonaparte',
  quote: 'Victory belongs to the most persevering.',
  responseText:
    'You speak of a stolen proposal as if it were Austerlitz lost. It is not. Your marshal claimed the dispatch — very well. The court remembers dispatches; the army remembers who drew the plan. Draw the next one where the credit cannot be separated from the hand that made it.',
  shares: [
    { id: 'share-1', platform: 'instagram', sharedAt: '2026-07-09T14:00:00Z' },
    { id: 'share-2', platform: 'link', sharedAt: '2026-07-10T09:30:00Z' },
  ],
};

export const cleopatraResponse: LensResponseLite = {
  figureId: 'cleopatra',
  figureName: 'Cleopatra',
  quote: 'I will not be triumphed over.',
  responseText:
    'Rome also rewrote my story an hour before telling it. Let them narrate — you hold the granary. Make yourself the one resource the next meeting cannot proceed without, and authorship returns to you.',
};

export const entryWithLenses: JournalEntryLite = {
  id: 'entry-1',
  title: 'Frustration on stolen credit',
  ventText:
    "My boss rewrote my entire proposal an hour before the meeting and presented it as a team effort. I don't even know if I'm angry at him or at myself for saying nothing while everyone nodded along.",
  createdAt: '2026-07-08T18:24:00Z',
  isPublic: true,
  lenses: [
    { figureId: 'napoleon', figureName: 'Napoleon Bonaparte', sharedTo: 'instagram' },
    { figureId: 'cleopatra', figureName: 'Cleopatra' },
  ],
};

export const entryNoLenses: JournalEntryLite = {
  id: 'entry-2',
  title: 'Unease on the quiet apartment',
  ventText:
    'The apartment is so quiet since Maya moved out. I keep making two coffees in the morning out of habit and pouring one away.',
  createdAt: '2026-07-11T08:05:00Z',
  isPublic: false,
  lenses: [],
};
