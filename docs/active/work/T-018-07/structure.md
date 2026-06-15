# T-018-07 — Structure: file-level changes

## Created

### `V200/supabase/migrations/004_entry_titles.sql`
Additive migration. One statement:
```sql
alter table vent_sessions add column if not exists title text;
```
Idempotent, nullable, no RLS change. Applied via Supabase SQL editor or MCP
`apply_migration`.

### `V200/src/lib/title.ts`
New module — the single source of truth for entry titles.

Public interface:
```ts
// Deterministic, synchronous, never throws.
export function deriveTitleFallback(ventText: string): string

// Async; calls Gemini, falls back to deriveTitleFallback on any failure.
export function generateVentTitle(ventText: string): Promise<string>
```

Internal:
- `const TITLE_SYSTEM_PROMPT` — instruction string (synonym vocabulary, 3–6
  words, no quotes/punctuation/first-person).
- `MAX_VENT_CHARS = 800`, `MAX_TITLE_CHARS = 60`, `TITLE_TIMEOUT_MS = 4000`.
- `cleanTitle(raw: string): string` — trim, strip wrapping quotes, collapse
  whitespace, drop trailing period, cap length.
- Lazily construct `GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)` and
  the `gemini-2.0-flash` model (module-level singleton like
  `generate-response/route.ts`).
- `generateVentTitle` wraps the call in try/catch + `Promise.race` timeout;
  empty/error → `deriveTitleFallback`.

`deriveTitleFallback` body (mirrors current component logic, centralized):
```ts
return ventText.split(/\s+/).filter(Boolean).slice(0, 6).join(' ')
```
Kept identical so existing rendered output does not regress.

### `V200/src/app/api/generate-title/route.ts`
New route handler. Thin wrapper:
- `POST` only.
- Clerk `auth()` guard → 401 if not signed in.
- Parse `{ ventText }`; 400 if missing/empty.
- `return NextResponse.json({ title: await generateVentTitle(ventText) })`.

## Modified

### `V200/src/app/api/save-response/route.ts`
- Import `generateVentTitle` from `@/lib/title`.
- In the **new-session insert branch only** (currently route.ts:32-42):
  generate `const title = await generateVentTitle(ventText)` and add `title` to
  the insert payload: `.insert({ user_id, vent_text, theme, title })`.
- The existing-session branch is untouched (title already set at creation).
- No change to the return shape (still `{ sessionId, responseId }`).

### `V200/src/lib/journal-types.ts`
- Add `title?: string | null` to `JournalEntry`.

### `V200/src/app/api/journal-v2/entries/route.ts`
- Add `title` to `RawSession` type.
- Add `title` to both `lensJoin`-bearing `.select(...)` column lists (the
  `${lensJoin}` template — prepend `title,` to the session columns).
- Add `title: s.title ?? null` to the `normalized` map object.

### `V200/src/app/app/journal-v2/[id]/page.tsx`
- Add `title` to `RawSession` type.
- Add `title` to the `.select(...)` column list.
- Add `title: s.title ?? null` to the built `entry: JournalEntry`.

### `V200/src/components/journal/JournalPreviewCard.tsx`
- Import `deriveTitleFallback` from `@/lib/title`.
- Replace line 35:
  ```ts
  const title = entry.title?.trim() || deriveTitleFallback(entry.vent_text)
  ```
- Everything else (uppercase render, line-clamp, aria-label) unchanged.

### `V200/src/components/journal/EntryDetail.tsx`
- Import `deriveTitleFallback` from `@/lib/title`.
- Replace line 64 with the same `entry.title?.trim() || deriveTitleFallback(...)`
  expression.

## Not changed (intentional)

- `V200/src/lib/journal-seed.ts` / `api/journal-v2/seed/route.ts` — demo rows
  keep `title = null`; render falls back. No Gemini calls on seed.
- `V200/src/app/app/lens/page.tsx` — its `getVentLabel`/`PREFIXES` is the
  input-card label, a separate concern; left as-is (it informed the prompt
  vocabulary but is not the persisted title).
- `V200/src/app/api/generate-response/route.ts` — unchanged; title is not its
  job.
- Legacy `/api/journal` + `/app/journal` path — out of scope (v2 is the live
  journal surface; the ticket's modified file is the v2 card).

## Module boundaries

```
src/lib/title.ts                         ← owns title logic (gen + fallback)
   ├── used by api/save-response          (persist at creation)
   ├── used by api/generate-title         (expose route)
   ├── used by components/JournalPreviewCard  (render fallback)
   └── used by components/EntryDetail         (render fallback)

vent_sessions.title (db)  ← written by save-response, read by both read paths
JournalEntry.title (type) ← carries it from read paths to components
```

The component import of `deriveTitleFallback` is client-safe: it is pure string
work with no Node/Gemini imports at module top-level. **Constraint:** the Gemini
client construction in `title.ts` must be lazy / inside `generateVentTitle`, not
at module top-level, so importing `deriveTitleFallback` into a client component
does not pull `@google/generative-ai` or `process.env` into the client bundle.

## Ordering of changes

1. Migration (schema must exist before the column is written/read).
2. `title.ts` (everything else imports it).
3. `save-response` (write path).
4. `generate-title` route.
5. Types → read paths → components (read path, top-down).
