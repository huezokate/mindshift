# Journal Feature — Research Findings

Phase 1 deliverable for the MindShift journal build. Started 6:32 PM, written 6:39 PM, 25 May 2026.

The goal of this doc is to converge on the *minimum* model and UX patterns we need to ship a credible journal + share flow on top of MindShift's existing lens system — not to catalog every journal app on the App Store.

---

## 1. Journal entry models (LiveJournal + modern apps)

### LiveJournal — the original privacy model
LiveJournal exposes four security levels per entry: **Public**, **Friends-only**, **Private**, and **Custom** (visible to a friends sub-group). Users can set a *minimum* security level on the whole journal, and bulk-edit privacy across many entries at once. Crucially, the privacy lives **on the entry**, not on the account.

Sources:
- [How do I make all my journal entries Friends-Only, Private, or Public? (LiveJournal FAQ 120)](https://www.livejournal.com/support/faq/120.html)
- [LiveJournal Security FAQ category](https://www.livejournal.com/support/faq/cat/security.html)

### Day One / Journey / Penzu — modern entry shape
Recurring features across these apps:
- **Star / favorite** a specific entry (Day One)
- **Tags** for organization, search across entries
- **Auto-metadata** (date, location, weather) on every entry
- **Calendar / on-this-day** retrieval views
- **Per-entry encryption / password** (Penzu Pro)
- **Free-form body** + optional structured fields (mood, prompts)

Sources:
- [Best Journaling Apps for 2026 — Holstee](https://www.holstee.com/blogs/mindful-matter/best-journaling-apps)
- [Day One vs Penzu — Reflection.app](https://www.reflection.app/best-journaling-apps-compared/day-one-vs-penzu)
- [Best Diary App of 2026 — Journey blog](https://blog.journey.cloud/best-diary-app-2026/)

### Implications for MindShift
MindShift has no friends graph yet, so **"friends-only" is out of scope** — `private` vs `public` is the right starting set. A `public` entry is *shareable by URL but not surfaced in any feed* (since there's no global feed yet) — this keeps the toggle meaningful without inventing social plumbing we won't ship today.

Favorites in MindShift should be applied at the **lens response** level, not the entry level — the user's spec is "save a great Lincoln quote + anecdote about their bad Tuesday and revisit it." The journal entry is the container; the lens response is the unit of insight worth pinning. This also matches Day One's "star a moment" pattern but pushed one level deeper.

---

## 2. Social sharing — "hot take" quote cards

### Platform reality (the constraints that actually matter)

| Platform | Direct share path | Constraint |
|---|---|---|
| **Instagram Stories** | `instagram-stories://share?source_application=<APP_ID>&backgroundImage=<base64>` deep link (iOS/Android) | Needs a registered Facebook App ID; iOS requires `LSApplicationQueriesSchemes`. Works only with the app installed. No web fallback. |
| **Instagram Feed** | No direct text/image share API for third parties. Best path: download image + open app. | User has to manually attach. |
| **TikTok** | No direct image-share intent. The Share Kit exists for video only. | For an image share you basically have to copy/download the image and let the user upload. |
| **Facebook** | `https://www.facebook.com/sharer/sharer.php?u=<URL>` — link share only, not image | Works in browser, no app required. Image is fetched via Open Graph tags on the shared URL. |
| **Native (mobile)** | `navigator.share({ files: [pngBlob], text, url })` | Works on iOS Safari + Chrome Android; falls back to URL share if `files` unsupported. **Best baseline.** |

Sources:
- [Universal Share API patterns — Shareaholic](https://www.shareapi.com/)
- [HTML2Canvas — image generation](https://html2canvas.org/)
- [Instagram Stories graphic generator with fabric.js (technique)](https://medium.com/@renduh/making-an-instagram-stories-graphic-generator-with-fabric-js-part-1-eca51d1e8b5d)
- [Free Deep Link Generator — Reco.to](https://reco.to/generate/deeplink)

### What a good share looks like

The share artifact should be a **portable PNG**, not a link, because:
1. Instagram and TikTok don't render OG images for arbitrary domains in-feed.
2. A PNG works regardless of whether the app supports our scheme.
3. PNG via `navigator.share({ files })` gives the user the platform picker for free.

**Dimensions:** 1080×1350 (4:5) is the right default — fits Instagram feed *and* Stories without cropping. Square 1080×1080 is the second option if we ever want a feed-first variant.

**Card composition** (minimum to feel intentional):
- Figure portrait avatar (top-left)
- Figure name + era (small caps)
- The lens response text (the actual hot take), wrapped, leading aligned
- Bottom: small "minds-shift.com" wordmark + the user's vent prompt in 1 line as context (optional, off by default to respect privacy)

### Render approach for MindShift
Canvas API directly (no `html2canvas` dep — we control the layout). Render server-side via a route handler that returns `image/png` would be cleanest for OG/SEO but isn't required for the share flow itself. **Client-side `<canvas>` is enough** for v1: render → `toBlob()` → `navigator.share({ files: [blob] })`.

Fallback chain:
1. `navigator.canShare({ files })` → native share sheet (mobile)
2. Platform-specific deep link button (IG Stories / FB sharer URL)
3. "Download image" button (always works, user uploads manually)

This means **TikTok** support is necessarily "download + upload manually" — we'll be honest about that in the UI and not pretend we have a direct path.

---

## 3. Where to mark "shared to [platform]" — judgment call

**Decision: mark on the entry AND show a small badge in the feed.**

Three options were on the table:

| Option | Pro | Con |
|---|---|---|
| Mark only inside the expanded entry | Cleanest feed visually | User can't tell at a glance which entries already went out — they'll re-share by accident, or scroll forever looking for "the one I posted to IG" |
| Mark only in the feed | Discoverable | Loses per-lens detail — an entry has 0–3 lenses, each potentially shared elsewhere |
| **Mark in both, at the right granularity** | Feed shows "this entry has shares" indicator (one small dot + count); expanded view shows per-lens platform badges (IG / TikTok / FB icons under each lens response) | Slightly more UI work — but it's the only one that supports the real use case |

The user's intent for shared content is *retrieval, not analytics*. They want to find "the Maya Angelou one I posted to Instagram last week." That requires the indicator to live where scanning happens (the feed), and the precise platform/lens linkage to live where decisions are made (inside the expanded entry).

We will:
- Feed card: small share-out arrow icon next to the lens avatars when *any* lens on the entry has been shared anywhere.
- Expanded entry: under each lens response card, show a tiny row of platform icons for whatever it was shared to (IG / TikTok / FB / link).
- **Timestamp** the share so we can later show "Shared to Instagram 3 days ago" without another schema change.

---

## 4. Data model implications

Existing tables (`vent_sessions`, `lens_responses`) need additive changes only:

```sql
alter table vent_sessions
  add column if not exists is_public boolean not null default false;

alter table lens_responses
  add column if not exists is_favorite boolean not null default false;

create table if not exists lens_shares (
  id            uuid primary key default gen_random_uuid(),
  response_id   uuid not null references lens_responses(id) on delete cascade,
  user_id       text not null,
  platform      text not null check (platform in ('instagram','tiktok','facebook','link','native')),
  shared_at     timestamptz not null default now()
);
```

- `is_public` on the entry → satisfies the public/private toggle without a new table.
- `is_favorite` on the lens response → satisfies "save this Lincoln response."
- `lens_shares` as its own table → supports multiple shares of the same lens to different platforms (or the same platform twice), preserves timestamps, and avoids cramming a JSON column.

RLS policies follow the same `user_id = requesting_user_id()` pattern as the existing tables. Public reads of `is_public=true` entries are out of scope for v1 (no public feed page yet).

---

## 5. Scope boundary for this build

In scope:
- Public / private toggle per entry
- 0–3 lens responses per entry (reuse existing `lens_responses` table)
- Favorite a lens response + favorites view
- Generate a quote-card PNG client-side
- Share via Web Share API; deep-link buttons for IG Stories + FB; download fallback for TikTok
- "Shared" indicators in feed (entry-level) and expanded view (lens-level)
- Seeded 10-entry demo flow

Out of scope (call out so we don't accidentally scope-creep):
- A public feed / discover page
- Friends-only privacy
- OG image route for shared `public` entries (could come later — schema supports it)
- Tags, mood, location auto-metadata
- Mass privacy editing

---

## 6. Build plan handoff to Phase 2

1. SQL migration `002_journal_v2.sql` with the schema deltas above
2. New route `/app/journal-v2/` (kept separate from existing `/app/journal/` so user can compare before approving)
3. New API routes under `/api/journal-v2/` for: fetch, set privacy, toggle favorite, log share
4. New components under `src/components/journal/`:
   - `JournalV2Page` (server)
   - `JournalV2Client` (infinite scroll + filter tabs: All / Favorites)
   - `EntryCard` (collapsed + expanded; extends existing SessionCard logic but adds privacy badge + share count)
   - `LensCard` (extends LensResponseCard; adds favorite star + share row)
   - `ShareSheet` (modal: generates PNG, lists platform buttons)
   - `QuoteCardCanvas` (the actual PNG renderer)
5. All themes (cyberpunk / kawaii / notepad) styled from existing tokens — no new colors
6. Seed script for 10 demo entries via `getSupabaseAdmin()`
