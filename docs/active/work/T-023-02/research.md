# T-023-02 · Research — Journal component stories

Descriptive map of the `V200/src/components/journal/` surface and the Storybook
infrastructure the stories plug into. No solutions here — just what exists and how
it connects.

## Storybook infra already in place (deps: S-022, T-023-01)

- `.storybook/main.ts` — globs `../src/**/*.stories.@(tsx|mdx)`; framework
  `@storybook/nextjs-vite`; `staticDirs: ['../public']` (so `/portraits/**` load);
  Tailwind v4 wired via `@tailwindcss/vite`; **aliases the bare `@clerk/nextjs`
  import** (exact-match regex) to `.storybook/mocks/clerk.tsx`.
- `.storybook/preview.tsx` — two global decorators:
  - `withClerkState` — pushes `parameters.clerk` into the Clerk mock singleton
    before render. Default `{ signedIn: true }`.
  - `withTheme` — sets `data-theme` on the iframe `<html>` from the Theme toolbar
    (cyberpunk / kawaii / notepad). Token skins are scoped `html[data-theme="…"]`;
    cyberpunk is bare `:root`. **A wrapper `<div data-theme>` does NOT re-theme** —
    the attribute must be on `<html>`, which the decorator handles globally.
  - `parameters.nextjs.appDirectory: true` — opts every story into the framework's
    `next/navigation` mock, so `useRouter()/usePathname()/useSearchParams()` return
    spies instead of throwing. No per-story router setup needed.
- `.storybook/mocks/clerk.tsx` — module-singleton mock exposing `useUser`,
  `useAuth`, `useClerk`, `ClerkProvider`, `SignedIn/Out`, `UserButton`, etc.
  Default user = "Ada Lovelace". Flip per story via `parameters: { clerk: {...} }`.
- `src/components/__fixtures__/journal.ts` — canonical `DEMO_ENTRY: JournalEntry`
  (figures `a-lincoln` + `marilyn-monroe`, one favorited, one share) and
  `DEMO_FIGURE_ID = 'a-lincoln'`. Tree-shaken from the app build (only imported by
  stories). Both figures have all-three-theme portraits present on disk.

## Existing story precedent

- Full-coverage exemplar: `src/components/ui/Button.stories.tsx` (T-023-01) — CSF3,
  `title: 'UI/Button'`, per-state named exports + an `AllVariants` matrix story that
  reads `ctx.globals.theme`. This is the pattern to mirror.
- Auth-state exemplar: `src/components/nav/EntryAuthRow.stories.tsx` — `SignedOut` /
  `SignedIn` via `parameters.clerk`.
- **Pre-existing journal smoke stories (from T-022-04, untracked)** — these already
  exist and must be *expanded*, not recreated:
  - `journal/JournalPreviewCard.stories.tsx` — single `Default` (DEMO_ENTRY).
  - `journal/EntryDetail.stories.tsx` — single `Default` (DEMO_ENTRY).
  - `journal/ChatScreen.stories.tsx` — `Anon` + `SignedIn` smoke (mount-safe).

## Component inventory (`V200/src/components/journal/`)

| Component | Key props | Runtime deps | Notes for stories |
|---|---|---|---|
| `LensCard` | `response: LensResponseV2`, `ventText`, `isEntryPublic` | `useTheme`, `FIGURES`, portraits | Flat card. Renders figure avatar+name, optional `fig.quote` (cyberpunk/kawaii only), response text, and a "SHARED …" log when `response.shares` non-empty. **Does NOT render `is_favorite`** (star was removed — see comment L29-32). No collapse/expand. |
| `JournalPreviewCard` | `entry: JournalEntry`, `onAddLens?` | `useRouter`, portraits, `SocialIcon`, `Icon` | Date label + vent body (title/derived) + footer. Footer shows avatar stack **with per-avatar share badge** when lenses exist, else an "Apply a lens →" invite. Tap → `router.push` (nav mock swallows it). |
| `WelcomeCard` | `onLoadDemo?`, `seeding?`, `seedMsg?` | `useTheme` | Empty-state card. Demo button only rendered when `onLoadDemo` supplied; `seeding` disables it; `seedMsg` shows a note. |
| `UpcomingChip` | none | `Icon` | Pink pill, `release_alert` glyph + "UPCOMING". Pure. |
| `JournalHeader` | `firstName?` | none | `"{name}'s Journal"` or fallback `"Your Journal"`. Pure. |
| `SocialIcon` | `platform: SharePlatform`, `size?` | `useTheme` | Inline brand glyph (instagram/tiktok/facebook + sms fallback for link/native/download) on a 16px badge in the theme accent. |
| `ShareSheet` | `responseId?`, `figureId`, `responseText`, `ventText`, `isEntryPublic`, `onClose`, `onShared` | `useTheme`, `renderQuoteCard` (canvas), body-scroll lock, focus trap | **Fixed inset-0 overlay.** On mount renders a PNG quote card via canvas (loads a portrait from `/public`; no network). Share handlers only fire on click (not on mount). |
| `LensPickerSheet` | `open`, `startIndex?`, `loading?`, `selectLabel?`, `error?`, `onSelect`, `onBack` | `useTheme`, `framer-motion`, `FIGURES`, `CircularArrow`, `Button` | **Fixed inset-0 overlay**, gated on `open`. Figure carousel. Presentational (parent owns select/back). |
| `EntryDetail` | `entry: JournalEntry` | `useRouter`, `useState`, nests `AppHeader` (Clerk), `LensCard`, `ShareSheet`, `LensPickerSheet` | Populated detail page. Proves the Clerk alias reaches nested imports. |
| `ChatScreen` | `figureId`, `ventText`, `seedReply`, `sessionId` | `useRouter`, `useUser`, mount-time history fetch when signed-in | Larger/stateful. Signed-in variant fires `/api/chat-with-lens/history` fetch — guarded with `r.ok`, so a Storybook 404 degrades to empty thread (no crash). |
| `JournalV2Client` | `initialEntries`, `initialHasMore`, `firstName?` | `useRouter/useTheme`, nests `AppHeader`, `JournalPreviewCard`, `WelcomeCard`, `LensPickerSheet` | Page-like list client. **No fetch on mount** when `initialHasMore=false` (IntersectionObserver only observes when `hasMore`). Tab switch triggers a fetch that fails silently (caught). |

Not story targets (support modules, not components): `QuoteCardCanvas.ts` (canvas
renderer, imported by ShareSheet), `SocialIcon` is a target above.

## Types & data

- `src/lib/journal-types.ts` — `JournalEntry`, `LensResponseV2`, `LensShare`,
  `SharePlatform` (`instagram|tiktok|facebook|link|native|download`), `JournalFilter`.
- `src/lib/figures.ts` — `FIGURES[]` (15 ids incl. `socrates`, `a-lincoln`,
  `marilyn-monroe`, …), `portraitFor(fig, theme)`, `getFigureImg`. Each figure has
  `name/era/quote/bio` + three theme portraits.

## Constraints / assumptions surfaced

1. **No Supabase/network in stories** (AC). Achieved by feeding props/fixtures and
   never triggering the click/scroll paths that fetch. ShareSheet's canvas render
   and ChatScreen's guarded history-fetch are the only mount-time async — both are
   local/degrade-safe.
2. **Re-theme via toolbar only** — never a `data-theme` wrapper (won't cascade).
3. **The ticket's suggested states pre-date the current component API** in two
   places: LensCard has no collapse/expand and does not show favorited state; the
   `favorited vs not` and `collapsed/expanded` states cannot be rendered by today's
   `LensCard`. This is a Design-phase decision to resolve (honor spirit, document).
4. Sheets are `position: fixed` overlays — a decorator can give them viewport room
   but cannot "contain" fixed positioning without establishing a containing block.
5. Verification path: `npm run build-storybook` compiles every story (build-time
   proof); `npm run storybook` for the human visual/theme pass.
</content>
</invoke>
