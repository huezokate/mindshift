# T-018-05 — Research

Flow correction #9 (FigJam 95:2236): tapping **Save** on a response should
pop-animate, then navigate to the newly-saved entry's detail page
(`/app/journal-v2/[id]`).

## Relevant files

| File | Role |
|---|---|
| `V200/src/app/app/response/page.tsx` | The response screen. Owns `handleSave`, `saveState`, the Save (bookmark) button, and the footer action bar. **Primary change site.** |
| `V200/src/app/api/save-response/route.ts` | `POST /api/save-response`. Upserts `vent_sessions` + `lens_responses`. Returns `{ sessionId, responseId }`. |
| `V200/src/app/app/journal-v2/[id]/page.tsx` | Server component detail page. `[id]` is the **vent_sessions.id** (= `sessionId` from save). Redirects to `/sign-in` if not signed in; `notFound()` if no row. |
| `V200/src/components/journal/JournalPreviewCard.tsx:107` | Canonical nav pattern: `router.push(\`/app/journal-v2/${entry.id}\`)`. Confirms route shape + id semantics. |
| `V200/src/app/globals.css:53` | Existing `@keyframes` (`glow-pulse`, `fadeSlideUp`). Where a CSS pop keyframe would live if not using framer. |

## Current Save behavior (`response/page.tsx`)

`saveState: 'idle' | 'saving' | 'saved' | 'error'` (line 78).

`handleSave()` (lines 108–135):
1. If `!isSignedIn` → `router.push('/sign-in?reason=save&redirect_url=' + encodeURIComponent('/app/response'))` and return. (Anon path.)
2. Guard: ignore if already `saving`/`saved`.
3. `setSaveState('saving')`.
4. POST `/api/save-response` with optional `sessionId` (from `sessionStorage 'ms_session_id'`), `ventText`, `figureId`, `responseText`, `theme`.
5. On success: store `data.sessionId` into `sessionStorage 'ms_session_id'`, `setSaveState('saved')`. **Stays on the page** — this is what the ticket changes.
6. On failure: `setSaveState('error')`.

The Save button (lines 290–292) is a plain `<button onClick={handleSave}>` inside a
framer `motion.div` (the quick-action row, rendered only when `done`). Active style
(`iconBtn(true)`, cyan fill) is applied when `saveState === 'saved'`. Error renders a
pink message (lines 308–312).

## Session/data flow

- `figure`, `vent`, `response` are hydrated from `sessionStorage` in `useEffect`
  (`ms_figure_id`, `ms_response`, `ms_vent`); fall back to DEMO_* constants.
- `ms_session_id` persists across saves so re-saving the same vent upserts rather
  than creating a duplicate session. `handleNew()` removes it.
- The save endpoint returns the `sessionId` we need for navigation. **No new
  backend work is required** — the id to route to already comes back from the
  existing POST.

## Detail page contract

- Route: `/app/journal-v2/[id]` where `id` = `vent_sessions.id`.
- **Clerk-protected**: server component calls `auth()`, redirects to `/sign-in`
  if no `userId`. Loads the session + nested `lens_responses` + `lens_shares`
  scoped to `user_id`, else `notFound()`.
- Because save only succeeds for signed-in users (API returns 401 otherwise), by
  the time we have a `sessionId` to navigate to, the user is authenticated — the
  detail page's auth guard will pass.

## Animation conventions in the codebase

- `framer-motion` is already imported in `response/page.tsx` (`motion`) and used
  across `lens`, `theme-select`, `onboarding`, `mindmap/new` (incl. `whileTap={{ scale: 0.95 }}`, `AnimatePresence`).
- Global keyframes exist for opacity pulses / fade-slide; no "pop"/scale keyframe yet.
- Either approach (framer `animate` controls, or a CSS `@keyframes pop`) fits
  existing patterns. Framer is already in-module and is used for tap feedback.

## Two flows in the acceptance criteria

1. **signed-in**: tap Save → POST → pop → navigate to detail. Single tap.
2. **anon→saved**: tap Save while anon → redirect to `/sign-in?reason=save&redirect_url=/app/response` → after auth, user lands back on `/app/response` → taps Save again → now signed in → POST → pop → navigate. The pop+navigate behavior must trigger on the *successful* save, regardless of how many taps preceded it.

## Constraints / assumptions

- Next.js 16 App Router (see `V200/AGENTS.md` — verify APIs against bundled docs before writing code).
- Theming: 3 themes via `data-theme`; tokens only, no hardcoded hex. Pop animation
  uses geometry (scale), so it is theme-agnostic, but QA still required in all 3.
- `tsc` must stay clean.
- `router.push` is the established navigation primitive (no full reload needed;
  the detail page is a fresh server-component fetch).
- Open question for Design: should navigation happen on the *original* tap that
  triggers sign-in (no — user isn't saved yet), or only after a real successful
  POST (yes). Pop must not fire on `error`.
