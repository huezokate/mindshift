# Journal Feature — Isolated Work Area

All new code for the journal feature is namespaced so the existing `/app/journal/` route keeps working untouched. Review here before merging.

## Files written in this build

### Docs
- `journal/JOURNAL_RESEARCH.md` — Phase 1 research + decision log
- `journal/README.md` — this file

### Database
- `supabase/migrations/002_journal_v2.sql` — adds `vent_sessions.is_public`, `lens_responses.is_favorite`, and the `lens_shares` table. Idempotent (`if not exists`).

### Library
- `src/lib/journal-types.ts` — types shared by client + server
- `src/lib/journal-seed.ts` — 10 demo entries (private/public mix, lens responses, share state, favorites)

### Routes (App Router)
- `src/app/app/journal-v2/page.tsx` — server component, mounts at `/app/journal-v2`
- `src/app/api/journal-v2/entries/route.ts` — `GET` with pagination + `?filter=all|favorites`
- `src/app/api/journal-v2/entries/[id]/privacy/route.ts` — `POST { is_public }`
- `src/app/api/journal-v2/responses/[id]/favorite/route.ts` — `POST { is_favorite }`
- `src/app/api/journal-v2/responses/[id]/share/route.ts` — `POST { platform }`
- `src/app/api/journal-v2/seed/route.ts` — `POST` — wipes + reseeds the current user's entries from `journal-seed.ts`

### Components (`src/components/journal/`)
- `JournalV2Client.tsx` — list, tab filter (All / Favorites), infinite scroll, seed button
- `EntryCard.tsx` — collapsed + expanded variants, privacy toggle, share-count dot
- `LensCard.tsx` — favorite star + share button + per-platform share badges
- `ShareSheet.tsx` — modal that renders a quote-card PNG via `QuoteCardCanvas` and offers native/IG/TikTok/FB/copy/download
- `QuoteCardCanvas.ts` — 1080×1350 canvas renderer, returns a PNG Blob

## How to try it locally

1. Run the SQL: paste `supabase/migrations/002_journal_v2.sql` into the Supabase SQL editor.
2. `cd V200 && npm run dev`
3. Sign in, visit `http://localhost:3000/app/journal-v2`
4. Hit **Seed 10 demo entries** in the empty state. Reload — you'll see all 10.

## What was deliberately *not* changed

- `src/app/app/journal/page.tsx` — the existing journal route is untouched.
- `src/components/SessionCard.tsx`, `LensResponseCard.tsx`, `JournalClient.tsx` — untouched.
- `src/lib/figures.ts`, `theme.tsx`, `supabase.ts`, `user-tier.ts` — untouched.
- `src/app/api/journal/route.ts`, `save-response/route.ts`, `generate-response/route.ts` — untouched.

Once approved, the v2 route + components can replace the v1 ones with a single rename pass.

## Open follow-ups

- IG Stories deep link with a real Facebook App ID + base64 image arg (requires app registration; current flow downloads the PNG and opens IG).
- OG-image route handler for shared `public` entries (schema already supports it).
- Tags / mood / search across entries (out of scope for v1).
- Public feed / discover page (out of scope — `is_public` is plumbing for it).
