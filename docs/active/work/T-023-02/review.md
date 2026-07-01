# T-023-02 · Review — Journal component stories

Handoff summary for a human reviewer. Adds Storybook coverage for every component
in `V200/src/components/journal/`. Purely additive Storybook files — no app source,
config, or runtime touched.

## What changed

### Story files created (8)
- `journal/UpcomingChip.stories.tsx` — Default.
- `journal/JournalHeader.stories.tsx` — WithName, NoName.
- `journal/SocialIcon.stories.tsx` — Instagram, TikTok, Facebook, AllPlatforms sweep.
- `journal/LensCard.stories.tsx` — Default, WithShares, NoShares, DifferentFigure,
  UnknownFigure.
- `journal/WelcomeCard.stories.tsx` — Default, Seeding, WithSeedMessage, NoDemoButton.
- `journal/ShareSheet.stories.tsx` — Open (overlay, container decorator).
- `journal/LensPickerSheet.stories.tsx` — Open, Loading, WithError (container decorator).
- `journal/JournalV2Client.stories.tsx` — Populated, Empty (page-like smoke).

### Story files expanded (3, pre-existing from T-022-04)
- `journal/JournalPreviewCard.stories.tsx` — +NoLens, LongVent, ShortVent, ManyLenses
  (kept Default).
- `journal/EntryDetail.stories.tsx` — +NoLenses (kept Default).
- `journal/ChatScreen.stories.tsx` — committed unchanged (Anon + SignedIn smoke;
  it was untracked before this ticket).

### Not changed
- No component source, no `__fixtures__/journal.ts`, no `.storybook/*` config.
  Every story-specific data shape is built inline by spreading the shared
  `DEMO_ENTRY` fixture with real figure ids from `src/lib/figures.ts`.

## Acceptance-criteria assessment

| AC | Status | Evidence |
|---|---|---|
| Every listed journal component has ≥1 story (or documented defer) | ✅ | 11 components, 11 story files; none deferred |
| Multi-state esp. LensCard & JournalPreviewCard | ✅ | LensCard ×5, JournalPreviewCard ×5 |
| Re-theme across 3 themes via toolbar | ✅ (build) / ⚠ (visual) | global `withTheme` decorator applies to all; not eyeballed headless |
| Sheets in a container decorator, not clipped | ✅ | `min-height:100dvh` decorator on ShareSheet + LensPickerSheet |
| No Supabase/network; no console errors | ✅ (analyzed) | see network-safety below; build clean |

## Test coverage & verification

- **Automated:** `npm run build-storybook` → *"Storybook build completed
  successfully."* Vite compiled every `*.stories.tsx`; a broken import/prop shape
  would have failed the build. This is the objective gate that every story mounts at
  the type/compile level.
- **No unit tests** added — stories are the deliverable; there is no new logic to
  unit-test (the vitest `lib/` suite is untouched).
- **Network safety (per Design audit, no code triggers a fetch on mount):**
  - Presentational cards (LensCard, WelcomeCard, JournalHeader, UpcomingChip,
    SocialIcon, JournalPreviewCard, EntryDetail) use only `useTheme`/`useRouter`
    (both mocked). ✅
  - ShareSheet builds its PNG via `<canvas>` + a `/public` portrait `<img>` served
    by `staticDirs`; `responseId` omitted so no share-log POST. ✅
  - LensPickerSheet — framer-motion + local state only. ✅
  - JournalV2Client — `initialHasMore:false` disarms the IntersectionObserver, so
    no page fetch fires on mount. ✅
  - ChatScreen `SignedIn` — one history fetch that 404s in Storybook but is guarded
    (`r.ok` → empty thread), so no crash (sanctioned T-022-04 behavior). ✅

## Deviations / notes for reviewer

1. **LensCard suggested states don't match the current component.** The ticket
   asked for "collapsed/expanded … favorited vs not", but today's `LensCard` is a
   flat card that neither expands nor renders `is_favorite` (the star was removed;
   see `LensCard.tsx` L29-32). Coverage instead varies the states that actually
   change the render — shares, figure identity, unknown-figure fallback — and the
   deviation is called out in the story's header comment. **No code was changed to
   re-add those states** (out of scope for a stories ticket); flag if the removed
   favorite affordance was unintentional.
2. **ChatScreen was untracked.** It shipped in T-022-04 but was never committed;
   this ticket committed it. Content unchanged.
3. **Overlay decorator, not a phone frame.** Sheets render as real `position:fixed`
   modals inside a `100dvh` wrapper rather than a transformed fixed-size frame — a
   transform would establish a containing block and distort `fixed`/`backdrop-filter`
   layout, misrepresenting the component. Trade-off: the overlay fills the canvas
   (that's its true behavior), it is not clipped.

## Open concerns / human sign-off

- **Visual/theme pass not run headless.** Worth ~2 min: `npm run storybook`, open
  the Journal/* stories, cycle the Theme toolbar (Cyberpunk/Kawaii/Notepad) and
  confirm (a) all cards re-skin, (b) SocialIcon glyphs render as brand marks not
  solid squares, (c) ShareSheet + LensPickerSheet aren't clipped, (d) no red console
  errors. Build-verified but not eyeballed this session (no browser driven).
- **JournalV2Client tab switch** would trigger a caught (silent) fetch if a reviewer
  clicks "Favorites" in the story — expected, non-fatal, no data appears.

## Risk

Low. Additive Storybook-only files; nothing in the app bundle imports `*.stories.tsx`,
so `next build`/runtime are untouched. Worst case a single story regresses →
revert that one file.
</content>
