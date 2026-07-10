# T-023-03 · Review — Nav & Mindmap component stories

Handoff doc. What changed, how it was verified, and what a human reviewer should
check. Commit: `133d074 test(storybook): nav + mindmap component stories (T-023-03)`.

## What changed

**Created**
- `V200/src/components/__fixtures__/mindmap.ts` — `AREA_DETAILS: Record<AreaId,
  AreaDetail>`, one short detail (description + done/total + 2–3 milestones) per
  life area. Stories-only import → tree-shaken from `next build` (mirrors
  `__fixtures__/journal.ts`).
- `V200/src/components/mindmap/MindmapAreaCard.stories.tsx` — `Folded`,
  `Unfolded`, `Gallery` (3 folded cards: career/health/relationship). Padded
  decorator so the corner sticker icon isn't clipped.
- `V200/src/components/mindmap/AreaIcon.stories.tsx` — `Single` (arg-controlled
  id/size) + `AllAreas` (full 5-glyph labeled grid). Both inside a `var(--cyan)`
  wrapper so `currentColor` glyphs are visible + recolor per theme.
- `V200/src/components/ThemeSwitcher.stories.tsx` — single `Default` smoke render.

**Modified**
- `V200/src/components/nav/AppHeader.stories.tsx` — added `MenuOpen` (play-function
  click on the "Account menu" trigger via bundled `storybook/test`) so the
  dropdown's design-system Button variants render for cross-theme review. Kept
  `SignedIn`/`SignedOut`.

**Committed as-is (pre-existing untracked T-022-04 smoke stories this ticket owns)**
- `nav/EntryAuthRow.stories.tsx` — `SignedOut`/`SignedIn`.
- `AuthBanner.stories.tsx` — `Default`/`WithReason`.
- `nav/AppHeader.stories.tsx` — was untracked; now tracked + expanded.

No app/runtime source changed. No config or `package.json` changes.

## Acceptance-criteria mapping

| AC | Status | Evidence |
|---|---|---|
| Each listed nav/mindmap component has ≥1 story; EntryAuthRow both auth states | ✅ | 9 stories indexed (below); EntryAuthRow SignedIn+SignedOut |
| MindmapAreaCard multiple area variants; AreaIcon full set | ✅ | `Gallery` (3 areas) + `AllAreas` (all 5 icons) |
| All stories re-theme across the 3 themes | ✅ (1 caveat) | Global `withTheme` toolbar; all components token-driven — see caveat |
| Router/Clerk components mount without error using T-022-04 mocks | ✅ | AppHeader (router+Clerk) builds + MenuOpen play clicks cleanly; counts props avoid the fetch |
| No console errors | ⚠ eyeball pending | Build clean; visual/console pass not run headless (see Open concerns) |

Stories indexed by `build-storybook` (`storybook-static/index.json`):
`nav-appheader--{signed-in,signed-out,menu-open}`,
`mindmap-mindmapareacard--{folded,unfolded,gallery}`,
`mindmap-areaicon--{single,all-areas}`, `components-themeswitcher--default`,
plus the pre-existing EntryAuthRow + AuthBanner stories.

## Verification performed

- **`npm run build-storybook` → success.** Every story (incl. the new fixture and
  the `storybook/test` play import) compiled and type-checked under the Vite
  builder. All 9 new/edited story IDs present in the built index (grep-confirmed).
- **`npx eslint` on all 5 touched files → exit 0.** No new lint errors.
- The play-function import uses `storybook/test` (a bundled export of the existing
  `storybook@^10` dep — `require.resolve` confirmed), NOT the un-installed
  `@storybook/test`, so no dependency was added.

## Test coverage & gaps

- These are Storybook coverage stories; the "test" is the build-time compile +
  render. No component-behavior unit tests or snapshots were added (out of scope).
- The app bundle is untouched — nothing imports `*.stories.tsx`, so `next build`
  and runtime are unaffected. Fixtures are tree-shaken.
- `AppHeader.MenuOpen` is the only story with a `play` interaction; the rest are
  static render / arg-driven.

## Open concerns / human sign-off

1. **Visual + console pass not run headless.** Worth ~2 min: `npm run storybook`,
   open Mindmap/*, Nav/AppHeader, Components/ThemeSwitcher; cycle the Theme toolbar
   (Cyberpunk/Kawaii/Notepad) and confirm (a) AreaIcon glyphs paint as symbols and
   recolor, (b) MindmapAreaCard chrome re-skins, (c) AppHeader dropdown opens with
   no red console output, (d) ThemeSwitcher buttons show per-theme fills. Build-
   verified but not eyeballed this session (no browser driven).
2. **MindmapAreaCard is notepad-first — one cosmetic token gap.** Its structural
   accents (`--cyan`/`--green`/`--pink`/`--card-bg`/fonts) DO re-theme, but the
   paper drop-shadow (`#d4cbbf`) and one `rgba(30,30,64,0.55)` sub-label are
   hardcoded in the component and stay notepad-colored on cyberpunk/kawaii. This is
   pre-existing component behavior; **no component code was changed** (a stories
   ticket doesn't refactor internals). Flag if the card is expected to be fully
   theme-agnostic — that's a separate component ticket.
3. **ThemeSwitcher story is intentionally inert.** No ThemeProvider in the preview
   cascade, so `useTheme()` uses the context default: cyberpunk shows active and
   clicks are noops. Documented in the story header so "clicking does nothing"
   isn't mistaken for a bug; the Theme toolbar is the real control.
4. **AppHeader.SignedIn / MenuOpen counts fetch.** Passing `entryCount`/`lensCount`
   short-circuits the `/api/journal-v2/counts` effect entirely, so no network is
   attempted. If a future edit drops those props on a signed-in story, the guarded
   fetch would 404 silently (caught) — non-fatal but avoid it.

## Risk

Low. Additive Storybook-only files + one fixture; the app bundle is untouched.
Worst case a single story regresses → revert that one file; everything else is
unaffected.
