# T-030-04 rn-screen-port — Research

Descriptive map of both sides of the screen port. No solutions here.
Sources: mobile/ workspace sweep, V200 screen-behavior sweep, V200 API-contract
sweep (2026-07-11), T-030-03 review handoff.

## 1. The consuming side: `mobile/` after T-030-03

The workspace is a complete foundation with placeholder screen bodies.
Expo SDK 57 / RN 0.86 (New Arch) / React 19.2 / expo-router (typed routes) /
Reanimated 4.5 (no Moti — deliberate T-030-03 decision) / Clerk Expo 2.19 /
expo-secure-store / react-native-svg / expo-image / expo-linear-gradient /
@gorhom/bottom-sheet (installed for Storybook, unused in src).
No zustand/redux/react-query — the only app-level state is `ThemeProvider`.

### Routes (`mobile/src/app`)
- `_layout.tsx` — fonts (Alumni, Nunito, Fredoka, Inter, MaterialSymbols
  pinned FILL1/wght700), `ClerkProvider` (SecureStore token cache) →
  `ThemeProvider` → themed `Stack`. Declares `(tabs)`, `(auth)`, `onboarding`,
  `lens`, `response`, `theme-select`, `storybook`.
- `index.tsx` — real: signed-in → `/home`, anon → `/onboarding`.
- `(auth)/sign-in|sign-up` — **fully implemented** (Clerk email/password +
  Google SSO via `useSSO`), but chrome is Phase-0 hardcoded hex (`auth-form.tsx`
  says "themed rebuild lands in T-030-04").
- `(tabs)/_layout.tsx` — 4 tabs (home/journal/mindmap/profile), hardcoded hex
  tab-bar colors.
- **Placeholders** (`PlaceholderScreen` + NavLinks only, no state/API):
  `(tabs)/home`, `(tabs)/journal`, `(tabs)/mindmap`, `onboarding`, `lens`,
  `response`, `journal/[id]/index`, `journal/[id]/chat/[figureId]`,
  `mindmap/{new,map,browse,reflect}`.
- **Real**: `theme-select.tsx` (ModeSwitcher + token sample card — the themed
  idiom reference), `(tabs)/profile.tsx` (partially real: Clerk state, sign-out,
  a Bearer-token smoke test against `/api/journal-v2/entries`; hex chrome),
  `storybook.tsx` (dev-only).

### Component library (all token-driven via `@/theme`, all with stories)
- `ui/`: Button (primary/secondary/secondary2, icon, subtext, press-spring),
  Icon, Card/HeadingCard, VentInput (header + counter, maxLength 1000 default,
  warnAt 700), Sheet (Modal-based, bottom/fcard + center/card, enter-only
  animations), ChatBubble + TypingDots, ModeSwitcher, `motion.ts`
  (`usePressScale`, `useSavePop`).
- `journal/`: LensCard (3 theme branches), JournalPreviewCard, WelcomeCard,
  UpcomingChip, AuthBanner (`reason` prop: lens_limit/vent_limit/save/journal),
  SocialIcon (+generated per-theme SVGs), LensAvatar (gradient ring,
  **initials fallback — portraits not bundled**), `journal-types.ts`
  (`JournalEntryLite`/`LensResponseLite`/`EntryLensLite`/`ShareRecord` +
  `formatDateLabel`) + fixtures.
- `mindmap/`: AreaIcon (+`area-icon-paths.ts`: AreaId = career/health/
  relationship/personal/finance, labels, prompts), MindmapAreaCard
  (area/body/milestones/actions/selected/width).
- `nav/`: AppHeaderView (presentational; props signedIn/username/entryCount/
  lensCount/mindmapHorizon/mindmapProgress/onNavigate/onSignOut) + AppHeader
  (Clerk/router-wired; **does NOT self-fetch counts — screens must wire data**);
  EntryAuthRowView + EntryAuthRow.
- Phase-0 hex-chrome components to retire/retheme during this ticket:
  `placeholder-screen.tsx`, `nav-link.tsx`, `auth-form.tsx`,
  `foundation-check.tsx`, tab/auth navigator options.

### Data/infra layer
- `lib/api.ts` — `apiFetch<T>(path, {token?, method?, body?})` →
  `${API_URL}${path}`, optional `Authorization: Bearer`, throws
  `ApiError(status, body)`. Smoke-tested live against journal-v2 in T-030-01.
- `lib/config.ts` — `API_URL` (`EXPO_PUBLIC_API_URL`; dev localhost:3000,
  preview/prod `https://app.minds-shift.com` via eas.json), Clerk key.
- `lib/relative-time.ts` ported. No per-resource API modules, no query cache,
  no AsyncStorage (SecureStore only, currently used for theme key `ms_theme`).
- Theme: `buildTheme` per mode, typed `Theme` slots for every family
  (card/hcard/input/btn*/fig/chat/fcard/lens/preview/mm/sw/node/radii + `raw`),
  CSS-fidelity vitest gate against real V200 CSS. `useTheme()` →
  `{mode, setMode, tokens}`; `fixedMode` for Storybook.
- Tests: vitest (node) + RN stubs; 57 tests. **No RN rendering rig** — only
  pure logic is testable.

## 2. The spec side: V200 screens (behavior to replicate)

Actual route names (ticket text is stale): journal = `/app/journal-v2`,
entry detail = `/app/journal-v2/[id]`, chat =
`/app/journal-v2/[id]/chat/[figureId]`. `/app` redirects signed-in →
`/app/home` (3-action hub: New vent / Visit your map / Open journal, pink-border
cards), anon → `/app/theme-select`.

### Flow state = web storage keys (no context/redux on web)
sessionStorage strings stitched through the funnel: `ms_vent` (written by
onboarding, read by lens+response), `ms_session_id` (cleared by onboarding, set
by response after save, read by lens for `isNewQuote`), `ms_figure_id`,
`ms_figure_name`, `ms_response` (written by lens, read by response).
localStorage: `ms_theme`; anon limits `ms_anon_date` / `ms_anon_vent_key`
(first 100 chars of vent) / `ms_anon_vent_lenses` — client-enforced only
(1 vent/day, 3 lenses/vent). `ms_chat_*` anon-chat keys are **dead code**
(chat is signed-in-only in product). RN has none of these APIs.

### Screen behaviors (essentials)
1. **Onboarding** — one `text` state; MAX 800 chars (hard slice), counter pink
   >700; proceed enabled at ≥20 trimmed chars; writes `ms_vent`, clears
   `ms_session_id`, → lens. EntryAuthRow; link to mindmap. 16px font (iOS zoom).
2. **Lens** — FIGURES 3-col grid → LensPickerSheet (wrap-around carousel:
   portrait/name/era/quote/bio, prev/next, Back/Select). Vent label derived
   keyword ("Contemplating <keyword>"). Anon localStorage gate before call;
   429 → limit card → `/sign-up?reason={lenses|vents}_limit`. POST
   generate-response `{prompt, figureId, systemPrompt, isNewQuote}`;
   `isNewQuote = !ms_session_id`. Writes figure+response keys → response.
3. **Response** — typewriter reveal 18ms/char + blinking caret; action pills
   when done: SAVE / NEW LENS (→ lens, same vent) / SHARE (ShareSheet).
   Signed-in: silent auto-save on completion (status pill Saving…/Saved/Retry)
   via POST save-response `{sessionId?, ventText, figureId, responseText,
   theme}` → stores `sessionId`. Anon: Save → `/sign-in?reason=save`.
   Chat entry is NOT here (EntryDetail only).
4. **Journal list** — web: server-rendered first page + IntersectionObserver
   infinite scroll on GET `/api/journal-v2/entries?offset&limit=10&filter`
   (`all|favorites`); WelcomeCard + demo seed (POST seed) when empty;
   add-lens per card via shared LensPickerSheet + `applyLensToEntry`;
   counts header; hard sign-in gate.
5. **Entry detail** — web is a **server component querying Supabase directly
   by id — there is NO single-entry GET endpoint**. Lens carousel (scroll-snap,
   peek, dots), + Lens (optimistic add), per-lens buttons: Chat with lens →
   chat route, Decorate (disabled + UpcomingChip), Socials (ShareSheet).
6. **Chat** — signed-in only. Mount: GET `/api/chat-with-lens/history` →
   `{messages, locked}`. Vent + seed reframe render as opening bubbles (never
   in `messages`). Send: POST `/api/chat-with-lens` `{sessionId, figureId,
   ventText, seedReply, userMessage, history}` → `{reply, done, capped,
   userTurnCount}` — optimistic user bubble, rollback on error. The whole arc
   is **server-side** (`chat-prompt.ts`): quote escalation turns 3-4 → 5+,
   soft-close `⟪END⟫` from turn ≥2 (`done` shows wind-down divider, composer
   stays open), hard cap 20 → `locked` removes composer ("found its close" +
   return). One lens-use per conversation (charged at seed; chat is untracked).
7. **Mindmap** — landing (forces notepad on web; hasMap via GET maps →
   Browse/Reflect cards or Create card); `browse` = area cards per saved goal
   with milestone progress (GET `/api/mindmap/maps`); `map` = @xyflow/react
   canvas (**no RN equivalent — biggest risk**); `new` = 6-step WOOP wizard
   (3 AI endpoints); `reflect` = mock data, no API. Ticket scope says
   "Mindmap (area cards)".
8. **Profile/auth** — profile: account/plan/sign-out (server, Clerk +
   TIER_LIMITS). Web auth = Clerk `<SignIn/>`/`<SignUp/>` + AuthBanner reading
   `?reason=`. Theme-select: carousel + ephemeral disclaimer ack (must NOT
   persist) + Enter CTA; mobile already has a real themed variant w/o
   disclaimer.
- **ShareSheet (web)** is canvas/Web-Share/deep-link heavy — everything
  browser-only; RN needs view-shot + expo-sharing/Linking equivalents.
- **figures.ts** — 15 figures `{id, name, descriptor, era, quote, bio,
  imgKawaii, imgCyberpunk, imgNotepad, systemPrompt}`; portraits are
  `/portraits/{theme}/{id}.png` public assets, **26MB total** (45 PNGs);
  server resolves persona by `figureId` (client `systemPrompt` is only a
  fallback for unknown ids).

## 3. API contracts (verified server-side)

| Route | Auth | Anon? | Notes |
|---|---|---|---|
| POST `/api/generate-response` | getUserTier | **Yes** | 200 `{response, tier}`; 429 `{error, limitType, tier}` free-tier caps; anon limits client-side ONLY; trackUsage free-only |
| POST `/api/chat-with-lens` | getUserTier | Yes (unused) | 200 `{reply, done, capped, userTurnCount}`; no usage tracking; hard cap 20 |
| GET `/api/chat-with-lens/history` | auth() | No (401) | `{messages, locked}` |
| POST `/api/save-response` | auth() | No (401) | `{sessionId, responseId}`; upsert on (session, figure) |
| GET `/api/journal-v2/entries` | auth() | No | `{sessions[], hasMore}`; offset/limit(≤50)/filter |
| DELETE `/api/journal-v2/entries/[id]` | auth() | No | cascade |
| POST `.../entries/[id]/privacy` | auth() | No | `{is_public}` |
| GET `/api/journal-v2/counts` | auth() | returns 0s | `{entries, lenses}` |
| POST `.../responses/[id]/favorite` | auth() | No | `{is_favorite}` |
| POST `.../responses/[id]/share` | auth() | No | platform: instagram/tiktok/facebook/link/native/download |
| POST `/api/journal-v2/seed` | auth() | No | 412 if migration missing |
| GET/POST `/api/mindmap/maps` | getUserTier | No (401) | POST 403 map cap (free 1/pro 3); GET `{maps: SavedMap[]}` |
| POST `/api/mindmap/generate-candidates` / `sequence-timeline` | getUserTier | No | wizard AI |
| POST `/api/generate-title`, `/api/send-email` | auth() | No | |

- **Auth transport**: all routes are cookie-based today via `clerkMiddleware`
  (`V200/src/proxy.ts`), but the middleware accepts `Authorization: Bearer`
  Clerk session tokens — the mobile profile smoke test already proved
  journal-v2 works with `getToken()` Bearer auth. No CORS headers anywhere
  (irrelevant for native; no browser CORS).
- Middleware matcher includes `/(api|trpc)(.*)`; native must call the correct
  host (`app.minds-shift.com`) to avoid 308 host redirects.
- **No single-entry GET** and **no anon server-side rate limiting** are the two
  backend-shaped gaps this client port must absorb client-side.
- Dynamic response length (T-020-01) is server-side prompt guidance
  (`lib/response-length.ts`, 40–160 words mapped from vent length) — used by
  both generate-response and every chat turn; client does nothing.

## 4. Constraints & open questions for Design

1. Web flow state is sessionStorage/localStorage strings; RN needs a
   replacement (context vs SecureStore vs AsyncStorage — AsyncStorage not
   installed) covering funnel state AND anon daily limits.
2. No single-entry endpoint: entry detail must be fed from the list data or
   paged lookup (story says reuse backend as-is).
3. Portraits: 26MB of PNGs — bundle vs remote-load via `API_URL` + expo-image
   caching; LensAvatar currently renders initials.
4. Mindmap `map` canvas (React Flow) has no RN equivalent; `new` wizard is a
   large 6-step flow; `reflect` is mock-data on web. Ticket scope line says
   "area cards" only.
5. Web ShareSheet is entirely browser APIs; native share (expo-sharing /
   RN Share, view-shot) is also listed in T-030-05 ("native share sheet
   replaces the web ShareSheet") — scope boundary needed.
6. Chat is signed-in-only on web (anon branch is dead code); ticket AC says
   "cover both anon and signed-in paths" — parity means anon chat stays out.
7. AC "no web-only APIs" — grep targets: sessionStorage, localStorage,
   document, window, IntersectionObserver, canvas, navigator.share.
8. Sheet exits are instant (T-030-03 concern #2); LensPicker/ShareSheet
   composites decide whether to add exit choreography.
9. AppHeader needs journal counts + mindmap horizon/progress wired
   (GET counts / GET maps) — web self-fetches, mobile view takes props.
10. Home hub (`/app/home`) is web-real and referenced by mobile home.tsx as
    T-030-04 work, though absent from the ticket's 8-flow list.
11. No RN rendering test rig — testing strategy limited to pure logic +
    stories + on-simulator verification.
