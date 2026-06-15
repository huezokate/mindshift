# T-018-07 — Design: Gemini-generated entry titles

## Decision summary

Generate the title **server-side, synchronously, at session creation** inside
`/api/save-response`, via a shared `src/lib/title.ts` helper that wraps Gemini
and falls back to a deterministic first-words derivation on any failure. Persist
it in a new nullable `vent_sessions.title` column. A thin
`POST /api/generate-title` route exposes the helper to satisfy the AC's "Gemini
route returns a title" literally and to enable backfill/testing. Read paths add
`title` to their selects; components prefer `entry.title` and fall back to the
shared derivation.

## Where to generate the title

### Option A — synchronously in `save-response` (CHOSEN)
At the new-session insert branch (the one place a session is born), call
`generateVentTitle(ventText)` and write the result into `title` on insert.

- **Pros:** Single code path; title is persisted before the client redirects to
  the detail page, so the entry shows its real title immediately. No extra
  client round-trip, no client state. The insert branch already runs exactly
  once per session.
- **Cons:** Adds one Gemini call (~0.5–1s) to the Save action latency.
  Mitigated: Save already shows a pop animation; the fallback returns instantly
  if Gemini is slow/errors (we cap the wait — see Reliability).

### Option B — separate client-called `/api/generate-title`, store via client
Client calls the route after/around save and the title is patched in.

- **Pros:** Save stays fast; title can stream in.
- **Cons:** Two round-trips, extra client state, a window where the entry has no
  title, and a second write. More moving parts for a low-priority ticket.
  **Rejected** as primary, but the route itself is cheap and useful, so we keep
  it as a thin wrapper (backfill, tests, future async path).

### Option C — piggyback on `/api/generate-response`
Generate the title in the same call that produces the lens response.

- **Cons:** `generate-response` runs **per lens** and for **anonymous** users
  who never save — wasted Gemini calls, title coupled to lens choice, and it
  returns to a screen that doesn't persist. **Rejected** — wrong layer.

**Chosen: A** (with the B route kept as a thin wrapper). Title belongs to the
vent and must be generated once, at the auth-gated moment the vent becomes a
persisted session — that is exactly the `save-response` insert branch.

## The title generator (`src/lib/title.ts`)

Two exports:

```ts
// Deterministic, never throws. Extracted from the components' current logic,
// upgraded to drop the trailing slice ambiguity. Returns a short label.
export function deriveTitleFallback(ventText: string): string

// Calls Gemini for a "<synonym> on <topic>" title; on ANY error or empty
// result returns deriveTitleFallback(ventText). Never throws.
export async function generateVentTitle(ventText: string): Promise<string>
```

### `generateVentTitle` design
- Model: `gemini-2.0-flash` (same as the existing call site).
- `systemInstruction`: instruct a 3–6 word title beginning with a contemplation
  verb drawn from the design vocabulary (Contemplating / Ruminating on /
  Reflecting on / Thinking about / Wrestling with / Processing), summarizing the
  vent's topic; no quotes, no trailing punctuation, no first person.
- `prompt`: the vent text (truncated to a sane bound, e.g. 800 chars — matches
  `MAX_CHARS`).
- Post-process: `trim()`, strip wrapping quotes, collapse whitespace, cap length
  (e.g. 60 chars), drop trailing period. If empty after cleanup → fallback.
- Reliability: wrap the call so a thrown error, an empty string, or a timeout
  resolves to `deriveTitleFallback`. Use `Promise.race` with a timeout (~4s) so
  a hung Gemini call can't stall Save indefinitely.

### `deriveTitleFallback` design
Keep it close to today's behavior so nothing regresses, but make it a single
source of truth: first 6 meaningful words of the vent, joined. (Components
already uppercase via CSS.) This replaces the inline `slice(0, 6)` in both
components.

## Schema change

`004_entry_titles.sql`:
```sql
alter table vent_sessions add column if not exists title text;
```
Nullable — existing rows and any row written before the column existed read as
`null` and fall back to the derived title at render. Additive, idempotent,
matches the project's migration conventions (002/003 use `add column if not
exists`). No RLS change (inherits `vent_sessions` owner policy).

## Type + read-path changes

- `JournalEntry` gains `title?: string | null`.
- Feed GET (`api/journal-v2/entries/route.ts`) and detail page
  (`journal-v2/[id]/page.tsx`) add `title` to the `select` and to the mapped
  object (and to their `RawSession` types).
- `JournalPreviewCard` and `EntryDetail`:
  ```ts
  const title = entry.title?.trim() || deriveTitleFallback(entry.vent_text)
  ```
  Rendering (uppercase, clamp) is unchanged.

## The `/api/generate-title` route

`POST /api/generate-title` — Clerk-auth-gated (consistent with other write-ish
routes; title generation costs a Gemini call). Body `{ ventText }` →
`{ title }`. Body is just `return NextResponse.json({ title: await
generateVentTitle(ventText) })`. Satisfies the AC's literal "Gemini route
returns a title" and gives a backfill/test handle without duplicating logic.

## Seed / demo entries

Leave `DEMO_ENTRIES` title-less; the seed insert does **not** call Gemini (avoid
10 API calls on every "Load demo"). Demo rows get `title = null` and render via
`deriveTitleFallback` — visually identical to today's demo. Documented as an
intentional non-goal; a future backfill can use `/api/generate-title`.

## What "graceful fallback" means here (AC)

Three layers, each independent:
1. Gemini error/timeout/empty → `deriveTitleFallback` inside `generateVentTitle`.
2. Column missing or write before migration → `title` is `null` →
   `deriveTitleFallback` at render.
3. Old rows with `null` title → `deriveTitleFallback` at render.
The user never sees a blank header.

## Rejected alternatives recap

- **Per-lens / anon generation (Option C):** wrong layer, wasteful.
- **Client-orchestrated generation (Option B as primary):** extra round-trips,
  empty-title window. Kept only as a thin route.
- **Backfilling demo data with live Gemini calls:** 10 calls per demo load,
  no user value. Rejected.
- **Storing the synonym/prefix separately:** over-engineering; one `title`
  string is enough and keeps the render trivial.
