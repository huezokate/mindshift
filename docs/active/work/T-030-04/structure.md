# T-030-04 rn-screen-port — Structure

File-level blueprint. All paths under `mobile/` unless noted. Kebab-case
files, components read tokens only from `@/theme`, screens live in route
files with presentational pieces extracted where a story/test needs them.

## New: data + state layer (`src/lib`, `src/state`)

- `src/lib/figures.ts` — port of web figures **metadata only** (D6):
  `Figure {id, name, descriptor, era, quote, bio}`, `FIGURES` (15, same
  order/ids as web), `figureById(id)`, `portraitUrl(figureId, mode)` →
  `${API_URL}/portraits/{mode}/{id}.png` (D5). Pure; unit-tested.
- `src/lib/anon-limits-logic.ts` — pure rules (D2): types
  `AnonLimits {date, ventKey, lensCount}`; `checkAnonLimits(state, today,
  vent)` → `'ok' | 'vents' | 'lenses'`; `trackAnonLens(state, today, vent)`
  → next state; `ventKeyOf(vent)` (first 100 chars). Mirrors web constants
  (1 vent/day, 3 lenses/vent). Unit-tested.
- `src/lib/anon-limits.ts` — SecureStore wrapper: `loadAnonLimits()` /
  `saveAnonLimits()` on JSON key `ms_anon_limits` (idiom copied from
  `src/theme/storage.ts`).
- `src/lib/use-api.ts` — `useApi()` hook (D3): wraps `apiFetch` with Clerk
  `getToken()` when signed in; returns `{api, isSignedIn}` where
  `api<T>(path, opts)` injects the Bearer token per call.
- `src/lib/vent-label.ts` — pure port of web `getVentLabel` (stopword
  keyword → "Contemplating/Ruminating on/Reflecting on <kw>"). Unit-tested.
- `src/lib/journal-map.ts` — pure mapping (D4): API `Session` JSON (research
  §3 shape) → `JournalEntryLite`/`LensResponseLite` from `journal-types.ts`;
  `deriveTitleFallback(ventText)` ported. Unit-tested.
- `src/lib/chat-logic.ts` — pure chat-screen reducer (D10): state
  `{messages, pending, locked, done, error, draft}`; events `loaded`,
  `send(text)` (optimistic append + turn_index), `reply(res)`, `fail`
  (rollback); mirrors web semantics (`done` soft, `locked` hard).
  Unit-tested.
- `src/lib/use-typewriter.ts` — `useTypewriter(text, {cps})`: 18ms/char
  interval slice + `done` flag; respects reduce-motion by jumping to done
  (D11). Step math in a pure helper for the test.
- `src/state/vent-flow.tsx` — `VentFlowProvider` + `useVentFlow()` (D1):
  `{vent, figureId, figureName, response, sessionId}` + `startVent(text)`
  (sets vent, clears sessionId — web parity), `setLensResult(...)`,
  `setSessionId(...)`, `reset()`. In-memory only.
- `src/state/journal-store.tsx` — `JournalStoreProvider` + hooks (D4, D9):
  `entries`, `hasMore`, `filter`, `counts {entries, lenses}`,
  `fetchPage(reset?)`, `setFilter`, `refresh`, `seedDemo()`,
  `getEntry(id)` (cache → paged fallback), `applyLensToEntry(entryId,
  figureId)` (POST generate-response with `isNewQuote:false` + save →
  optimistic upsert; ported from web `lib/add-lens.ts`), `deleteEntry(id)`,
  `toggleFavorite(responseId)`, `logShare(responseId, platform)`. All server
  calls via `useApi`. Resets on sign-out (Clerk `userId` change).

## New: components

- `src/components/journal/lens-picker-sheet.tsx` — composite of `Sheet`
  (center/card chrome): wrap-around figure carousel — portrait via
  `expo-image` (`portraitUrl`, LensAvatar-gradient placeholder), name/era/
  quote/bio fixed-height block, prev/next icon-Buttons, Back + Select
  (`selectLabel`, `loading`, `error` props — same surface as web). + story.
- `src/components/journal/limit-card.tsx` — anon/free limit state for the
  lens screen (`type: 'lenses' | 'vents' | 'quotes'`), "Create free
  account →" CTA. + story.
- `src/components/chat/chat-thread.tsx` — presentational thread: opening
  vent+seed bubbles, messages, TypingDots row, wind-down divider (`done`),
  locked closing card. Props-only so it gets a story with canned states.
- `src/components/chat/chat-composer.tsx` — auto-grow input + send Button;
  hidden when `locked`. + story (via chat-thread story states).
- `src/components/home/action-card.tsx` — pink-border hub card (eyebrow/
  title/body) from web `/app/home`. + story.

## Modified: routes (`src/app`)

- `_layout.tsx` — mount `VentFlowProvider` + `JournalStoreProvider` inside
  ThemeProvider; register `journal/[id]`, `journal/[id]/chat/[figureId]`,
  `mindmap/*` in the themed Stack (currently implicit).
- `index.tsx` — anon redirect → `/theme-select` (D13; was `/onboarding`).
- `theme-select.tsx` — add ephemeral disclaimer ack (never persisted) +
  "Enter Minds Shift" CTA → `/onboarding` (D13). Keep ModeSwitcher UI.
- `onboarding.tsx` — REAL screen: HeadingCard intro + `VentInput`
  (maxLength 800, warnAt 700) + proceed Button (≥20 trimmed chars) →
  `startVent` → `/lens`; `EntryAuthRow`; mindmap link. Replaces placeholder.
- `lens.tsx` — REAL: vent-label header, 3-col FIGURES grid (portraits,
  staggered entrance), tap → LensPickerSheet; Select → anon-limit check
  (D2) → `POST generate-response` (429 → LimitCard mapping) →
  `setLensResult` → `trackAnonLens` if anon → `/response`.
- `response.tsx` — REAL: figure header, typewriter card + caret, action
  pills on done (SAVE/NEW LENS/SHARE); signed-in auto-save →
  `POST save-response` → `setSessionId`, status pill + save-pop; anon SAVE →
  `/sign-in?reason=save`; SHARE → RN `Share.share` + `logShare('native')`
  when persisted (D8); NEW LENS → `/lens` (vent kept).
- `(tabs)/_layout.tsx` — tab bar colors from `useTheme().tokens` (D15).
- `(tabs)/home.tsx` — REAL hub: AppHeader (counts wired from journal store),
  "Welcome back, {firstName}" + "Where to today?", three `ActionCard`s
  (New vent / Visit your map / Open journal). Anon: EntryAuthRow variant.
  FoundationCheck/NavLink removed.
- `(tabs)/journal.tsx` — REAL list: AppHeader + counts, filter tabs
  (all/favorites), `FlatList` of `JournalPreviewCard` (onEndReached paging,
  RefreshControl), WelcomeCard+seed / favorites-empty states, add-lens via
  LensPickerSheet → `applyLensToEntry`, card tap → `/journal/[id]`.
  Anon: AuthBanner(`journal`) + sign-in/up Buttons.
- `journal/[id]/index.tsx` — REAL entry detail: `getEntry(id)` (spinner on
  fallback fetch), title + vent card, horizontal snap lens carousel of
  `LensCard` + page dots, per-lens row: Chat with lens → chat route,
  Decorate (disabled + UpcomingChip), Socials → `Share.share` +
  `logShare`; "+ Lens" → LensPickerSheet (optimistic).
- `journal/[id]/chat/[figureId].tsx` — REAL chat: guard signed-in (redirect
  `/sign-in?reason=journal`), load entry (vent + seed reply from the
  figure's lens) + `GET chat-with-lens/history`; `chat-logic` reducer +
  `ChatThread`/`ChatComposer`; send → `POST chat-with-lens`
  (optimistic/rollback); KeyboardAvoiding + scroll-to-end.
- `(tabs)/mindmap.tsx` — REAL landing: signed-in → `GET /api/mindmap/maps`;
  hasMap ? Browse + Reflect cards : Create card (→ `mindmap/new` stub);
  anon → AuthBanner + sign-in. User's theme kept (D7 note).
- `mindmap/browse.tsx` — REAL: `MindmapAreaCard` per saved goal (milestone
  progress in `body`/`milestones` props), from the same GET (small
  `use-mindmaps.ts` hook shared with landing, lives in `src/lib`).
- `mindmap/new.tsx`, `mindmap/map.tsx`, `mindmap/reflect.tsx` — themed
  stubs (tokens, honest "continue on the web" copy) (D7).
- `(tabs)/profile.tsx` — themed rebuild: account card (username/email/
  member-since via Clerk `useUser`), plan card (free/pro copy), ModeSwitcher
  entry, sign-out Button. Smoke-test button removed.
- `(auth)/sign-in.tsx` / `sign-up.tsx` — rebuilt on DS: Card + themed
  inputs + Buttons + `AuthBanner` fed by `?reason=` param (D15); logic
  (Clerk useSignIn/useSignUp/SSO) unchanged.

## Deleted

- `src/components/auth-form.tsx` (after auth rebuild).
- `src/components/foundation-check.tsx` usage from home; file moves to a
  story-only diagnostic (`src/stories/`) or is deleted if unused.
- `src/components/nav-link.tsx` once no route references remain (stubs use
  Buttons).

## Interfaces / boundaries

- Screens never call `fetch`/`apiFetch` directly — always `useApi` or a
  store hook. Stores own optimistic mutations; screens own navigation.
- `journal-types.ts` stays the display contract; `journal-map.ts` is the
  only place API JSON shapes are known.
- No component/screen hardcodes hex (CI-style grep in review); the last
  Phase-0 hex dies with this ticket except Storybook-only diagnostics.
- No new deps. `Share` from `react-native`; images via `expo-image`.

## Ordering (matters)

1. Libs/state (figures, anon-limits, use-api, vent-flow) — funnel deps.
2. Funnel: onboarding → lens (+ LensPickerSheet, LimitCard) → response.
3. Journal store + list + entry detail (store before screens).
4. Chat (needs entry detail's data path).
5. Mindmap landing + browse (+ use-mindmaps).
6. Home hub, profile, auth rebuild, theme-select disclaimer, tab theming.
7. Hex retirement + deletions last (nothing depends on the corpses).

Grep gate for the AC at the end: no `sessionStorage|localStorage|document.|
window.|IntersectionObserver|navigator.share` under `mobile/src`.
