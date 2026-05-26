# Journal Feature Build — Session Summary

Build window: 18:32 → 18:57 PDT, Mon May 25 2026 (~25 min plus iteration cycles to 8:30 PM). Branch: `v200`. Local commits only — not pushed, per instruction.

## What shipped

### Phase 1 — Research (`journal/JOURNAL_RESEARCH.md`)
- Surveyed LiveJournal entry privacy model (public / friends-only / private / custom) and modern apps (Day One, Journey, Penzu) for entry shape, favorites, and tagging
- Surveyed share-card patterns for Instagram Stories / TikTok / Facebook + Web Share API constraints
- Made the judgment call on where to mark "shared to X": **both** in the feed (entry-level count chip) and inside the expanded view (per-lens platform + timestamp lines), because the real use case is retrieval, not analytics

### Phase 2 — Implementation
- **Schema delta** (`supabase/migrations/002_journal_v2.sql`): `vent_sessions.is_public`, `lens_responses.is_favorite`, new `lens_shares` table with RLS following the existing `requesting_user_id()` pattern
- **5 API routes** under `/api/journal-v2/*`: paginated entries with `?filter=all|favorites`, privacy toggle, favorite toggle, share log, seed, and (cycle 4) delete entry
- **6 UI components** under `src/components/journal/`:
  - `JournalV2Client` — tab filter, infinite scroll, seed button
  - `EntryCard` — collapsed + expanded per-theme, privacy badge subtle when private (default) / prominent when public, share-count chip in the title row, two-step delete confirm
  - `LensCard` — favorite star + share button + per-platform "Instagram · 3d ago" share history
  - `ShareSheet` — Esc-to-close modal, body-scroll lock, theme-aware quote-card preview, six platform actions with sub-line expectations
  - `QuoteCardCanvas` — 1080×1350 PNG renderer in pure Canvas API (no html2canvas), portrait + name/era + response body + wordmark, theme-aware palette + fonts
- **Page** at `/app/journal-v2/` (separate from the existing `/app/journal` so it can be reviewed before swap)
- **Seed data** (`src/lib/journal-seed.ts`): all 10 entries from the spec — realistic vents + in-voice lens responses, mix of private/public × 0-3 lenses × shared-to-platform × favorited

### Phase 3 — QA against Figma
- Pulled `469:4155/4156/4157` (preview cards in all three themes), `469:4224` (detail view), and `469:4431` (full journal) from Figma via MCP
- Built `/journal-preview` (no-auth, no-DB) and screenshot-tested all three themes with headless Chrome — cyberpunk, kawaii, and notepad all render cleanly, asymmetric borders correct, privacy badges adaptive, share count chip visible
- Confirmed the v2 layout matches the Figma design system (token usage, type scale, card structure, avatar stack)

### Phase 4 — Microcopy
- "Save it. Star what helps. Share what's worth saying out loud." (header)
- "Public · tap to make private" / "Private · tap to make public" (toggle)
- "Make a quote card" (share sheet title)
- Per-button sub-lines: "your device's share sheet", "saves image, opens app", "opens sharer in new tab", "public entries only", "save the PNG"
- Empty states distinguished for All vs Favorites
- "Load 10-entry demo" / "Reset demo entries" (demo controls)

## Improvement cycles (after first scope completion)

- **Cycle 2** — replaced the entry-level share dot with a count chip ("↗ 2"); made the private badge quiet (default state shouldn't shout); added timestamps to share badges ("Instagram · 3d ago"); added Esc-to-close + body-scroll lock + focus-on-mount to ShareSheet; added per-button sub-line expectations
- **Cycle 3** — fixed an IntersectionObserver variable shadow that broke pagination offset; added a Postgres schema probe to the seed route that returns 412 with a clear "run the migration" message instead of silently inserting zero rows; typed Supabase query shapes instead of `any`; download filename now includes figure id + timestamp; refactored `TabBtn` out of render-time component creation
- **Cycle 4** — added DELETE endpoint + two-step inline confirm UI (kept out of the collapsed feed to avoid accidental taps); built `/journal-preview` and visually verified all three themes end-to-end
- **Cycle 5** — adaptive font scaling in QuoteCardCanvas so long responses fit without ellipsis; portrait load timeout so a slow CDN can't hang the share flow; Tab focus trap on ShareSheet
- **Cycle 6** (post self-review by an outside subagent) — **blocker fixes**: the seed used to wipe ALL user entries (now uses an `is_demo` flag and only deletes demo rows); favorites filter was applied after pagination and silently killed infinite scroll (now an INNER join in SQL); Copy-link and Facebook share pointed at a URL that just redirects to sign-in (now honest copy + downloads the PNG alongside the FB sharer); titleDisplay ellipsis only when truncated; `crypto.randomUUID` for share keys to avoid double-tap collisions; ShareSheet revokes every Blob URL it minted, not just the last one; switched schema-probe to Postgres error code 42703 instead of message substring

## What's incomplete

- **No real authed walkthrough.** The dev server is up but I can't sign in headlessly — the preview route validates layout/themes but not the API round-trips. First real test will be: sign in → visit `/app/journal-v2` → run "Load 10-entry demo" → expand entries → toggle favorites → share.
- **Migration must be run manually.** Paste `supabase/migrations/002_journal_v2.sql` into the Supabase SQL editor before the seed will work. The seed route now fails loudly if it hasn't been run (returns 412 with a clear message).
- **Instagram Stories deep link is a half-step.** Current behavior: save PNG → open Instagram app. To get a true "→ direct to Story" experience we'd need a registered Facebook App ID + the `instagram-stories://` scheme with base64 image — out of scope today (noted in the research doc).
- **No public feed for `is_public=true` entries.** `is_public` is plumbing for a future discover page; v2 only uses it to gate the "Copy link" button.
- **Three `<img>` lint warnings** for the figure portrait images. Consistent with the existing v1 SessionCard / LensResponseCard pattern; switching to `next/image` would be inconsistent and require an LCP cost/benefit conversation. Left as-is.

## What I'd do next

1. **Real authed pass** — sign in, run the migration + seed, click through every flow on a real device with the share sheet open (Instagram + native share are mobile-only)
2. **OG image route** — a server `image/png` endpoint for shared `public` entries (so Facebook/iMessage previews render a real card, not just a domain)
3. **IG Stories deep link** — register the Facebook App ID, switch the IG button from "save + open app" to the direct Story-share scheme
4. **Swap v1 → v2** — once approved, rename `journal-v2` routes to `journal` and delete the old `SessionCard` / `LensResponseCard` / `JournalClient` / `/api/journal/route.ts`. Diff should be small.
5. **Delete `/journal-preview`** — was only for visual QA; not for production

## Commit list (local, not pushed — 10 commits)

```
fix(journal-v2): blockers from self-review            ← seed wipes only is_demo rows, fav filter in SQL, etc.
polish(journal-v2): adaptive font, image timeout, Tab focus trap
docs(journal-v2): preview-route footer
docs(journal-v2): session summary
chore(journal-v2): visual-QA preview route (no auth, no DB)
feat(journal-v2): delete entry endpoint + inline confirm UI
fix(journal-v2): lint cleanup + observer shadow + schema probe in seed
feat(journal-v2): UI + share quote card + research doc
feat(journal-v2): API routes for entries, privacy, favorites, share log, seed
feat(journal-v2): schema + types + 10-entry demo seed
```

## How to try it locally

1. **Run the migration**: paste `V200/supabase/migrations/002_journal_v2.sql` into the Supabase SQL editor.
2. **Dev server is already running** on `http://localhost:3000` (PID in `b18waly61.output`).
3. **Visual QA without auth**: `http://localhost:3000/journal-preview` and toggle Cyberpunk / Kawaii / Notepad.
4. **Full feature** (requires sign-in): `http://localhost:3000/app/journal-v2`. On the empty state, hit "Load 10-entry demo" → reload → click around. Try favoriting a response, sharing one to "Native share" or "Download", then collapse the entry to see the share-count chip appear in the title row.
