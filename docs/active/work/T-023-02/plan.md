# T-023-02 · Plan — ordered implementation steps

Each step is independently verifiable and small enough to commit atomically.
Working dir: `V200/`. All steps are additive story files + 2 edits.

## Testing strategy

- **Automated gate:** `npm run build-storybook` after all files are written. Vite
  compiles every `*.stories.tsx`; a type error, bad import, or bad prop shape fails
  the build. This is the objective "no story is broken" proof.
- **No unit tests** — stories are the artifact; there is no logic to unit-test here.
  (The repo's vitest suite covers `lib/`, untouched by this ticket.)
- **Manual/visual pass (documented, not headless):** `npm run storybook`, cycle the
  Theme toolbar across cyberpunk/kawaii/notepad on each Journal story; confirm
  sheets aren't clipped and no red console errors. Recorded in review.md as a
  human-sign-off item (mirrors T-023-01).
- **Type check:** `npx tsc --noEmit` if build output is ambiguous.

## Steps

1. **Pure presentational stories** — `UpcomingChip`, `JournalHeader`, `SocialIcon`.
   No mock entry needed; JournalHeader `WithName/NoName`; SocialIcon per-platform +
   `AllPlatforms` sweep. → commit.

2. **Themed presentational** — `LensCard`, `WelcomeCard`.
   LensCard pulls `LensResponseV2` from `DEMO_ENTRY.lens_responses`; states per
   Design (Default/WithShares/NoShares/DifferentFigure/UnknownFigure). WelcomeCard
   Default/Seeding/WithSeedMessage/NoDemoButton. → commit.

3. **Expand existing smokes** — `JournalPreviewCard` (+NoLens/LongVent/ShortVent/
   ManyLenses), `EntryDetail` (+NoLenses). Keep existing `Default`. → commit.

4. **Overlays** — `ShareSheet`, `LensPickerSheet`, each with the min-height
   container decorator. ShareSheet `Open`; LensPickerSheet `Open/Loading/WithError`.
   → commit.

5. **Page-like smoke** — `JournalV2Client` `Populated` + `Empty`. Inline entries
   with `initialHasMore:false` (network-free). → commit.

6. **Compile-verify** — `npm run build-storybook`. Fix any story that fails to
   compile. Re-run until clean. → commit any fixes.

7. **Review** — write `review.md`: files touched, coverage vs AC, network-safety
   confirmation, deviations (LensCard favorite/expand), and the human visual pass as
   an open item.

## Acceptance-criteria trace

| AC | Covered by |
|---|---|
| Every listed component has ≥1 story (or documented defer) | Steps 1–5; none deferred |
| Multi-state esp. LensCard & JournalPreviewCard | Steps 2–3 |
| Re-theme across 3 themes via toolbar | global `withTheme` decorator (all stories) |
| Sheets in a container decorator, not clipped | Step 4 min-height decorator |
| No Supabase/network; no console errors | Design network audit; verified in Step 6 |

## Risk & rollback

Low — purely additive Storybook files; nothing in the app bundle imports them, so
`next build` and runtime are untouched. Worst case a single story fails to compile
→ revert that one file. Commit per-step keeps blast radius to one group.

## Commit messages (convention from T-023-01)

- `test(storybook): journal presentational stories — UpcomingChip/JournalHeader/SocialIcon (T-023-02)`
- `test(storybook): LensCard + WelcomeCard stories (T-023-02)`
- `test(storybook): expand JournalPreviewCard + EntryDetail state coverage (T-023-02)`
- `test(storybook): ShareSheet + LensPickerSheet overlay stories (T-023-02)`
- `test(storybook): JournalV2Client happy-path smoke (T-023-02)`
</content>
