# T-018-07 — Review: Gemini-generated entry titles

## What changed

Journal entry headers are now Gemini-generated "<synonym> on <topic>" summaries
of the vent, persisted to a new `vent_sessions.title` column and rendered on both
the feed card and the detail view, with a deterministic first-words fallback at
every layer.

### Created
- **`V200/supabase/migrations/004_entry_titles.sql`** — `add column if not
  exists title text` on `vent_sessions`. Applied live to project
  `wwszertnwbsdwbkzrupk` via Supabase MCP; `list_tables` confirms the column
  (`title text, nullable`).
- **`V200/src/lib/title.ts`** — `deriveTitleFallback(ventText)` (pure, first 6
  words) + `generateVentTitle(ventText)` (Gemini `gemini-2.0-flash`, dynamic
  import, 4s timeout, output cleaning, fallback on any failure). Never throws.
- **`V200/src/app/api/generate-title/route.ts`** — `POST`, Clerk-guarded,
  `{ ventText } → { title }`. Satisfies AC1's "Gemini route returns a title".

### Modified
- **`V200/src/app/api/save-response/route.ts`** — new-session insert branch
  generates and persists `title`. Existing-session branch and response shape
  unchanged.
- **`V200/src/lib/journal-types.ts`** — `JournalEntry.title?: string | null`.
- **`V200/src/app/api/journal-v2/entries/route.ts`** — `title` added to
  `RawSession`, the select column list, and the normalized map.
- **`V200/src/app/app/journal-v2/[id]/page.tsx`** — same three additions for the
  detail read path.
- **`V200/src/components/journal/JournalPreviewCard.tsx`** and
  **`EntryDetail.tsx`** — title now `entry.title?.trim() ||
  deriveTitleFallback(entry.vent_text)`; uppercase render unchanged.

## How it satisfies the acceptance criteria

- **AC1 — "Gemini route returns a short '<synonym> on <topic>' title"**:
  `generateVentTitle` + `POST /api/generate-title`. System prompt pins the
  contemplation verb vocabulary (Contemplating / Ruminating on / Reflecting on /
  Thinking about / Wrestling with / Processing / …) and a 3–6 word bound.
- **AC2 — "Title persisted and shown on feed cards + detail header; graceful
  fallback"**: persisted at save into `vent_sessions.title`; read through the
  feed GET and the detail server component into `JournalEntry.title`; rendered on
  `JournalPreviewCard` and `EntryDetail`. Fallback is three independent layers:
  (1) Gemini error/timeout/empty → `deriveTitleFallback` inside the generator;
  (2) `title` column null (pre-migration rows, demo entries) → derived at render;
  (3) any null/blank at the component → derived at render.

## Test coverage

- **Type safety:** `npx tsc --noEmit` → exit 0. This is the real guard here — it
  proves the `title` field threads consistently from the two read paths through
  `JournalEntry` into both components.
- **Lint:** `npm run lint` reports 12 errors / 24 warnings, **all pre-existing**
  in untouched files (lens, mindmap, response, theme-select, library, and the
  `<img>` warnings). The files this ticket changed introduce **no new errors**.
- **No automated tests** were added — the repo has no test harness (no
  jest/vitest config, no `__tests__`). Gap is intentional but flagged below.

### Gaps / manual QA the human should run
1. **End-to-end Save flow** (needs a signed-in browser + `GOOGLE_GEMINI_API_KEY`):
   vent → lens → Save → detail page header shows a Gemini title (uppercased);
   reload feed → same persisted title on the card.
2. **Graceful-fallback path:** unset/break the Gemini key → Save still succeeds
   and the header shows the first-words fallback. (Logic-verified via the
   `process.env` guard + try/catch; not exercised live.)
3. **Demo entries:** "Load demo" → cards render first-words fallback, no Gemini
   calls fired.

## Open concerns / notes for the reviewer

- **Save latency:** `save-response` now awaits a Gemini call on first save of a
  session, capped at 4s by a `Promise.race` timeout, then falls back. The Save
  button already animates, so the added wait is masked. If this proves too slow
  in practice, the `/api/generate-title` route exists to move generation to an
  async/after-save patch without reworking the data model.
- **Timeout cleanup:** the `Promise.race` timeout uses a `setTimeout` that isn't
  cleared when `generateContent` wins — a benign dangling timer, not a leak of
  consequence. Could be tidied with a cleared handle if desired.
- **Client-bundle safety:** the Gemini SDK is loaded via dynamic
  `import('@google/generative-ai')` *inside* `generateVentTitle`, so the two
  client components importing `deriveTitleFallback` don't pull server-only deps
  into the client bundle. tsc compiles them clean; worth a sanity check in a real
  `next build` if paranoid.
- **Demo/legacy rows** keep `title = null` by design and render the derived
  title — visually identical to pre-ticket behavior. A future backfill can POST
  existing vents to `/api/generate-title` if real titles are wanted there.
- **Not committed:** changes are staged in the working tree only. The branch
  already carried unrelated in-flight work at session start, so commit bundling
  is left to the human. Per-step commit messages are in `plan.md` if wanted.
- **Scope boundary:** the legacy `/api/journal` + `/app/journal` surface was left
  untouched — the live journal is the v2 path (the card in the session's initial
  git status). If the legacy surface is still reachable, it will show its own
  (unchanged) title logic.
