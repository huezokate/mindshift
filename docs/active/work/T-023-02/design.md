# T-023-02 · Design — Journal component stories

Decisions, grounded in Research. Goal: one CSF3 story file per `journal/` component
with minimal inline mock data, covering meaningful states, re-theming via the
toolbar, and firing no network.

## Decision 1 — One file per component; expand the 3 pre-existing smokes

The three T-022-04 smoke stories (JournalPreviewCard, EntryDetail, ChatScreen)
already exist and already mount cleanly. **Expand them in place** rather than
rewrite — add the missing states, keep the existing exports so nothing regresses.
Create fresh story files for the seven components that have none: LensCard,
WelcomeCard, UpcomingChip, JournalHeader, SocialIcon, ShareSheet, LensPickerSheet.
Plus one page-like smoke: JournalV2Client.

Rejected: a single combined "Journal" MDX gallery. It would fight the CSF3 idiom
T-023-01 established and make per-component controls/states harder to reach.

## Decision 2 — Mock data: shared fixture + inline extensions

Reuse `__fixtures__/journal.ts` `DEMO_ENTRY` / `DEMO_FIGURE_ID` where a full entry
is needed (JournalPreviewCard, EntryDetail, JournalV2Client, LensCard can pull a
`LensResponseV2` out of it). Where a state needs a *variant* (no-lens entry, a
share-less response, a long vent), define it **inline in the story file** by
spreading the fixture — keeps each state self-documenting and avoids bloating the
shared fixture with one-off shapes. This matches the ticket's "minimal
representative mock data defined inline".

Rejected: adding every variant to `__fixtures__/journal.ts`. The fixture is the
canonical happy-path entry; story-specific shapes belong with their story.

## Decision 3 — Coverage per component (honoring ticket intent vs. real API)

- **LensCard** — the ticket asks for "collapsed/expanded … favorited vs not", but
  the current component (Research §inventory) is a **flat card with no
  collapse/expand and does not render `is_favorite`** (star removed). Honor the
  *spirit* by covering the states that actually vary the render:
  `Default` (Lincoln, quote + response), `WithShares` (share log renders),
  `NoShares`, `DifferentFigure` (Marilyn — different quote/portrait),
  `UnknownFigure` (id not in FIGURES → name-fallback, no portrait/quote path).
  Document the deviation in a story comment + review.
- **JournalPreviewCard** — the AC-critical multi-state component. `Default`
  (DEMO_ENTRY, has lenses + a share badge), `NoLens` (empty `lens_responses` → the
  "Apply a lens →" invite footer), `LongVent` (clamped body), `ShortVent`,
  `ManyLenses` (avatar stack with several badges).
- **WelcomeCard** — `Default` (with demo button), `Seeding` (`seeding: true`,
  disabled), `WithSeedMessage` (`seedMsg` note), `NoDemoButton` (`onLoadDemo`
  omitted → button hidden).
- **UpcomingChip** — `Default` (no props).
- **JournalHeader** — `WithName`, `NoName` (fallback "Your Journal").
- **SocialIcon** — `Instagram`, `TikTok`, `Facebook`, and an `AllPlatforms` row
  rendering every `SharePlatform` for a glyph sweep.
- **ShareSheet** — `Open` (overlay + canvas card). Container decorator for room.
- **LensPickerSheet** — `Open`, `Loading`, `WithError`. Container decorator.
- **EntryDetail** — keep `Default`; add `NoLenses` (entry with empty
  `lens_responses`) to show the empty detail state.
- **ChatScreen** — keep `Anon` + `SignedIn` (already the sanctioned smoke).
- **JournalV2Client** — page-like smoke: `Populated` (initialEntries = a couple of
  entries, `initialHasMore:false` so no IO fetch) + `Empty` (`[]` → WelcomeCard).
  Not deferred — it mounts network-free with `initialHasMore:false`; documented.

## Decision 4 — Sheets get a container decorator, rendered in their real modal form

Both sheets are `position: fixed; inset: 0`. Rather than fight that, render them as
the modals they are and add a **decorator that gives the iframe a min-height
(`100dvh`)** so the backdrop + panel have full room and nothing is clipped. This
satisfies the AC ("render inside a sensible container decorator, not clipped")
without the fragile trick of establishing a containing block via `transform`, which
would distort `backdrop-filter`/`fixed` layout and misrepresent the real component.

Rejected: wrapping in a transformed, fixed-size "phone frame". It changes stacking
context and `backdrop-filter` behavior — the story would no longer reflect reality.

## Decision 5 — Handlers & args

Overlay/interactive components need callbacks (`onClose`, `onShared`, `onSelect`,
`onBack`, `onAddLens`). Pass **no-op arrow functions** in `args` (the app-build
Clerk/router paths are already mocked; these callbacks only fire on user click and
stories don't click). No `@storybook/test` `fn()` dependency introduced — keeps the
footprint identical to the T-023-01 stories. Actions are observable in the canvas;
logging isn't required by the AC.

## Decision 6 — Theming is proven by the global toolbar, not per-story

Every journal component reads tokens via `var(--…)` or `useTheme()`. The global
`withTheme` decorator already re-themes all stories from the toolbar, so no story
needs a `theme` prop (unlike Button, whose *semantic* variants had a family swap).
`LensPickerSheet` passes through `Button` which self-resolves — no forwarding
needed. Stories therefore stay theme-agnostic; the AC "re-theme across 3 themes via
the toolbar" is satisfied structurally.

## Network-safety audit (AC: no Supabase/network, no console errors)

- JournalPreviewCard/EntryDetail/JournalHeader/WelcomeCard/UpcomingChip/SocialIcon/
  LensCard — presentational; only `useRouter`/`useTheme` (mocked). ✅
- ShareSheet — `renderQuoteCard` is canvas + a `/public` portrait `<img>` (served
  by staticDirs). No fetch on mount. ✅
- LensPickerSheet — framer-motion + local state only. ✅
- ChatScreen `SignedIn` — one guarded history fetch; 404 → empty thread, no crash
  (documented in the existing story). Acceptable per T-022-04 precedent. ✅
- JournalV2Client — `initialHasMore:false` ⇒ IntersectionObserver never fetches;
  tab switch would fetch but stories don't switch tabs. ✅

## Outcome

11 story files total: 3 expanded, 8 created. All CSF3, `title: 'Journal/<Name>'`,
minimal inline/fixture data, toolbar-themed, network-free. Verified by
`build-storybook` (compile) with a documented human visual pass.
</content>
