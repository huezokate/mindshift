# T-018-07 — Research: Gemini-generated entry titles

## Ticket recap

Flow correction #11 (FigJam 95:2256): journal entry headers should be
Gemini-generated summaries of the vent in the form
"Contemplating / Ruminating / Thinking about XYZ". Currently the feed and detail
views derive a title from the first words of the vent. The ticket defers the
real implementation to the backend: a Gemini route + a `title` column on
`vent_sessions`.

## Where titles are produced today

The title is derived **client-side**, identically, in two places:

- `V200/src/components/journal/JournalPreviewCard.tsx:35`
  ```ts
  const title = entry.vent_text.split(/\s+/).filter(Boolean).slice(0, 6).join(' ')
  ```
- `V200/src/components/journal/EntryDetail.tsx:64` — same expression.

Both render it UPPERCASE via `textTransform: 'uppercase'` (Figma billboard
treatment — JournalPreviewCard.tsx:107, EntryDetail.tsx:124). So whatever string
we feed in is uppercased by CSS at render time.

A *related but separate* helper already produces the target form on the lens
screen: `V200/src/app/app/lens/page.tsx:36-44`
```ts
const PREFIXES = ['Contemplating', 'Ruminating on', 'Reflecting on']
function getVentLabel(vent) { /* picks first non-stopword keyword */ }
```
This is a heuristic placeholder for the input-card label — NOT persisted, NOT
the journal title. It confirms the desired phrasing ("<synonym> on <topic>") and
the synonym vocabulary the design expects.

## The data model

`vent_sessions` (migrations `001_journal.sql`, extended by `002_journal_v2.sql`):
```
id, user_id, vent_text, theme, created_at, is_public, is_demo
```
There is **no `title` column**. RLS is owner-scoped via `requesting_user_id()`.
`lens_responses` hangs off `session_id`; `lens_shares` off `response_id`.

Migrations are applied manually in the Supabase SQL editor or via the Supabase
MCP `apply_migration`. Files live in `V200/supabase/migrations/`. Next file in
sequence is `004_*`.

## The save flow (where a session is born)

`V200/src/app/app/response/page.tsx:109-142` `handleSave()`:
1. Requires sign-in (anon users are bounced to `/sign-in`).
2. POSTs `{ sessionId?, ventText, figureId, responseText, theme }` to
   `/api/save-response`.
3. On success stores `ms_session_id` and routes to
   `/app/journal-v2/${data.sessionId}` (the detail page).

`V200/src/app/api/save-response/route.ts`:
- Auth via Clerk `auth()`.
- If `sessionId` present → verify ownership, reuse it.
- Else → **insert a new `vent_sessions` row** (route.ts:32-42) with
  `{ user_id, vent_text, theme }`. **This is the single point where a session is
  created** — the natural home for title generation.
- Then upserts the `lens_responses` row (onConflict `session_id,figure_id`).
- Returns `{ sessionId, responseId }`.

The same session is re-saved when another lens is applied (sessionId is passed),
so the insert branch runs **exactly once per session** — title should be
generated there.

## How Gemini is called today

`V200/src/app/api/generate-response/route.ts`:
```ts
import { GoogleGenerativeAI } from '@google/generative-ai'   // v0.24.1
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  systemInstruction: systemPrompt ?? '…',
})
const result = await model.generateContent(prompt)
const text = result.response.text()
```
This is the only Gemini call site. Pattern to reuse: construct model with a
`systemInstruction`, call `generateContent(prompt)`, read `.response.text()`.
No streaming, no tool use. Env var `GOOGLE_GEMINI_API_KEY`.

## How entries are read back

The `JournalEntry` type (`V200/src/lib/journal-types.ts:24-31`) has **no title
field**:
```ts
type JournalEntry = { id, vent_text, theme, is_public, created_at, lens_responses }
```

Two read paths build `JournalEntry` from a `vent_sessions` select:
- **Feed:** `V200/src/app/api/journal-v2/entries/route.ts` — paginated GET,
  selects `id, vent_text, theme, is_public, created_at, <lens join>`, normalizes
  into `sessions[]`. Consumed by the feed client → `JournalPreviewCard`.
- **Detail:** `V200/src/app/app/journal-v2/[id]/page.tsx` (server component) —
  selects the same columns for one session, builds one `JournalEntry`, renders
  `EntryDetail`.

Both would need `title` added to the select + the mapped object. (The old
`/api/journal` + `/app/journal` path is legacy; the v2 path is what
JournalPreviewCard/EntryDetail use — the modified file in git status.)

## Seed / demo data

`V200/src/lib/journal-seed.ts` — `DEMO_ENTRIES` (10 entries) with `vent_text`
but no titles. `V200/src/app/api/journal-v2/seed/route.ts` inserts them with
`is_demo: true`, probing for the v2 schema (error code `42703` → migration
missing). Demo entries would fall back to derived titles unless we also generate
for them.

## Constraints & assumptions

- **Only signed-in users persist** — title generation lives behind auth, no anon
  cost. Anon users never reach `save-response`.
- **Gemini can fail / be slow.** Save is a foreground action (pop animation then
  redirect). A blocking title call adds ~0.5–1s. A robust fallback to the
  first-words derivation is mandatory (AC: "graceful fallback").
- **Title is per-vent, not per-lens.** It must be generated once, at session
  creation, from `vent_text` only — independent of which figure was chosen.
- **CSS uppercases the title** — generator output can be sentence-case.
- **Next.js 16** — heed `V200/AGENTS.md`: APIs differ; route handlers already
  follow the established pattern, so no new framework surface is needed.
- The lens-screen `PREFIXES` give the canonical synonym set to anchor the prompt.

## Open questions for Design

1. Generate at save time (server, blocking) vs. a separate client-called route?
2. Backfill existing rows / demo entries, or fallback-only for them?
3. Where does the fallback derivation live now that two components + the server
   may all need it (extract a shared util)?
