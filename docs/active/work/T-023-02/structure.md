# T-023-02 · Structure — file-level blueprint

Shape of the change. All work is additive story files (+ minor edits to 3 existing
smoke stories). No app/runtime/source component is modified. No fixtures change is
required, but one optional helper is noted.

## Files created (8)

```
V200/src/components/journal/LensCard.stories.tsx
V200/src/components/journal/WelcomeCard.stories.tsx
V200/src/components/journal/UpcomingChip.stories.tsx
V200/src/components/journal/JournalHeader.stories.tsx
V200/src/components/journal/SocialIcon.stories.tsx
V200/src/components/journal/ShareSheet.stories.tsx
V200/src/components/journal/LensPickerSheet.stories.tsx
V200/src/components/journal/JournalV2Client.stories.tsx
```

## Files modified (3 — expand existing smokes)

```
V200/src/components/journal/JournalPreviewCard.stories.tsx   (add NoLens, LongVent, ShortVent, ManyLenses)
V200/src/components/journal/EntryDetail.stories.tsx          (add NoLenses)
V200/src/components/journal/ChatScreen.stories.tsx           (unchanged — already Anon + SignedIn; leave as-is)
```

ChatScreen already satisfies the AC (single happy-path smoke ×2 states); no edit
planned unless build surfaces an issue.

## Files NOT changed

- No source component under `journal/` is touched.
- `__fixtures__/journal.ts` — reused as-is. Story-specific variants are built inline
  by spreading `DEMO_ENTRY` / its `lens_responses[n]`.
- `.storybook/*` — no config change; existing decorators/mocks cover every need.

## Common conventions (every file)

- CSF3: `import type { Meta, StoryObj } from '@storybook/nextjs-vite'`.
- `const meta: Meta<typeof C> = { title: 'Journal/<Name>', component: C, args: {…} }`
  then `export default meta`; `type Story = StoryObj<typeof C>`.
- Named exports per state. Top-of-file comment stating what the stories prove and
  any deviation from the ticket's suggested states.
- Mock shapes typed against `@/lib/journal-types` (`JournalEntry`,
  `LensResponseV2`) and figure ids from `@/lib/figures` (real ids only).
- No `theme` prop plumbing — the global toolbar decorator re-themes.

## Per-file interface sketch

### LensCard.stories.tsx
- import `LensCard`, `LensResponseV2`, `DEMO_ENTRY`.
- Base response = `DEMO_ENTRY.lens_responses[0]` (a-lincoln, favorited, 1 share).
- meta.args: `{ response: base, ventText: DEMO_ENTRY.vent_text, isEntryPublic:false }`.
- Stories: `Default`, `WithShares`, `NoShares` (`{...base, shares:[]}`),
  `DifferentFigure` (`lens_responses[1]`, marilyn), `UnknownFigure`
  (`{...base, figure_id:'not-a-figure'}`).
- Comment: notes the removed favorite/expand states.

### JournalPreviewCard.stories.tsx (expand)
- Keep `Default`. Add:
  - `NoLens`: `{ ...DEMO_ENTRY, lens_responses: [] }`.
  - `LongVent`: `{ ...DEMO_ENTRY, vent_text: <~3+ line string> }`.
  - `ShortVent`: `{ ...DEMO_ENTRY, vent_text: 'Quick note.', lens_responses: [] }`.
  - `ManyLenses`: entry with 4 lens_responses (varied figures, some shared).
- `onAddLens` optional; omit (component logs to console via stub — acceptable) or
  pass `() => {}`. Pass `() => {}` to avoid the console.log noise (AC: no console
  errors — a log isn't an error, but keep it clean).

### WelcomeCard.stories.tsx
- meta.args: `{ onLoadDemo: () => {} }`.
- Stories: `Default`, `Seeding` (`seeding:true`), `WithSeedMessage`
  (`seedMsg:'Loaded 10 demo entries.'`), `NoDemoButton` (`onLoadDemo: undefined`).

### UpcomingChip.stories.tsx
- No props. `Default: Story = {}`.

### JournalHeader.stories.tsx
- Stories: `WithName` (`firstName:'Ada'`), `NoName` (`firstName: null`).

### SocialIcon.stories.tsx
- meta.args: `{ platform: 'instagram', size: 32 }` (bump size for visibility).
- Stories: `Instagram`, `TikTok`, `Facebook`, and `AllPlatforms` — a `render` that
  maps every `SharePlatform` into a labeled row.

### ShareSheet.stories.tsx
- meta.args: `{ figureId: DEMO_FIGURE_ID, responseText, ventText, isEntryPublic:
  false, onClose: () => {}, onShared: () => {} }` (no `responseId` → share logging
  is skipped, no fetch).
- Decorator: `(S) => <div style={{ minHeight:'100dvh' }}><S/></div>`.
- Stories: `Open: Story = {}`.

### LensPickerSheet.stories.tsx
- meta.args: `{ open:true, onSelect:()=>{}, onBack:()=>{} }`.
- Decorator: same min-height wrapper.
- Stories: `Open`, `Loading` (`loading:true`), `WithError`
  (`error:'You've used all 3 free lenses today.'`).

### JournalV2Client.stories.tsx
- Build 2–3 inline `JournalEntry` objects (reuse DEMO_ENTRY + a spread variant).
- meta.args baseline: `{ initialEntries: [...], initialHasMore:false,
  firstName:'Ada' }`.
- Stories: `Populated` (entries), `Empty` (`initialEntries: [], initialHasMore:
  false` → WelcomeCard). `parameters.clerk` default signed-in (AppHeader nested).
- Comment: documents why it's a safe smoke (no mount fetch when hasMore=false).

### EntryDetail.stories.tsx (expand)
- Keep `Default`. Add `NoLenses`: `{ ...DEMO_ENTRY, lens_responses: [] }`.

## Ordering

Independent files — order is only for incremental commit hygiene:
1. Pure/presentational, no deps: UpcomingChip, JournalHeader, SocialIcon.
2. Themed presentational: LensCard, WelcomeCard.
3. Expand existing: JournalPreviewCard, EntryDetail.
4. Overlays: ShareSheet, LensPickerSheet.
5. Page-like smoke: JournalV2Client.
6. `build-storybook` to compile-verify the whole set; then review.

## Verification hooks

- `npm run build-storybook` (in `V200/`) — compiles every `*.stories.tsx`; a broken
  story fails the build. Primary automated gate.
- `npm run storybook` — human visual/theme pass (documented as a follow-up, not run
  headless this session).
</content>
