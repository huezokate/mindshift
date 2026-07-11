# T-030-03 rn-primitives-storybook — Review

Self-assessment / handoff. Nine commits on `feat/storybook-clean`
(`4bf323b` → `866d8b4`), one per plan step. Typecheck, lint, and 57 vitest
tests green; iOS Hermes bundle exports cleanly; **all four ACs verified live
on the iPhone 16 simulator** (screenshots below).

## What changed

### Storybook infrastructure (created)
`mobile/metro.config.js` (expo default + `withStorybook`),
`mobile/.rnstorybook/` (main.ts with `deviceAddons`, preview.tsx = themed
decorator wrapping every story in the real `ThemeProvider` + shared
`ModeSwitcher` — the RN twin of the web "Mode" toolbar, persisted like the
app's; index.tsx; committed generated `storybook.requires.ts`),
`src/app/storybook.tsx` (dev-only expo-router route; release renders a
Redirect and metro can strip SB via `WITH_STORYBOOK=false`).
Deps added: storybook / @storybook/react-native / two ondevice addons @10.5,
@gorhom/bottom-sheet@5 (SB UI peer), expo-linear-gradient. Script:
`npm run storybook:stories` (requires-file regen).

### Components (all read tokens exclusively from `@/theme`; kebab-case files)
- **ui/**: `icon.tsx` (Material glyph; replaces deleted `ms-icon.tsx`, usages
  migrated), `button-logic.ts` (pure variant→family resolver +
  `SEMANTIC_VARIANT`), `button.tsx` (primary/secondary/secondary2, subtext,
  icon, icon-only square = the CircleArrow/CircularArrow replacement,
  fullWidth, disabled 0.6, Reanimated press spring), `card.tsx`
  (Card + HeadingCard), `vent-input.tsx` (+`vent-input-logic.ts` counter),
  `sheet.tsx` (bottom/fcard + center/card overlay primitive),
  `chat-bubble.tsx` (user speech-tail / lens thought-clouds + TypingDots),
  `mode-switcher.tsx` (extracted from theme-select; app + SB share it),
  `motion.ts` (`usePressScale`, `useSavePop` — the web save-pop keyframes).
- **journal/**: `lens-card.tsx` (three theme-branched chromes like web),
  `journal-preview-card.tsx` (date label, clamped vent body, footer avatar
  stack w/ share badges or "+ Lens"), `welcome-card.tsx`, `upcoming-chip.tsx`,
  `auth-banner.tsx` (reason as prop), `social-icon.tsx` + generated
  `social-svgs.ts` (12 per-theme XMLs inlined), `lens-avatar.tsx`
  (expo-linear-gradient ring; initial fallback until portraits land),
  `journal-types.ts` (+ `__fixtures__/journal.ts`).
- **mindmap/**: `area-icon.tsx` + generated `area-icon-paths.ts` (5 verbatim
  d-strings, labels, prompts), `mindmap-area-card.tsx`.
- **nav/**: `entry-auth-row.tsx`, `app-header.tsx` — both split into a
  presentational View (stories/tests) + a Clerk/router-connected wrapper.
  AppHeader does NOT self-fetch counts (props only; T-030-04 wires data).
- **stories/**: `tri-modes.tsx` (pinned-mode 3-up compare),
  `tokens.stories.tsx` (Themes/Tokens board), `smoke.stories.tsx`.
- **theme/**: `gradient.ts` (narrow linear-gradient parser, exported from
  `@/theme`), `provider.tsx` gained a `fixedMode` prop (TriModes),
  `fonts.ts` notepad → Inter statics. `lib/relative-time.ts` ported.

**Every roster component has a co-located `*.stories.tsx` (17 story files).**

### Fonts (both design best-efforts landed)
- `MaterialSymbolsRounded.ttf` re-instanced to **FILL=1 wght=700 GRAD=0
  opsz=24** (Kate's web icon spec) — glyphs now render filled like web, and
  the asset shrank 15.1MB → 1.8MB.
- **Inter** added as static instances (`Inter-Regular` 400 /
  `Inter-SemiBold` 600, from google/fonts OFL) and mapped to notepad
  body/btn/mono — closes T-030-02 review concern #1.

**No V200/web files touched.** Screens (except theme-select's refactor onto
the shared components) untouched — T-030-04 territory.

## Acceptance criteria status
1. **Every census component has an RN component + story across 3 modes** ✅ —
   the ticket's stale rows map to current web reality per design.md D1
   (CircleArrow/CircularArrow → icon-only Button story; card/input/sheet/
   chat-bubble extracted as components where web uses CSS patterns).
2. **Semantic Button accent-swap resolves per mode** ✅ — machine-checked
   (`button-logic.test.ts` asserts journal→blue-slot / mindmap→red-slot hexes
   ×3 skins, never collapsing) AND verified visually (SemanticPairAllModes
   on-sim: notepad blue/red, kawaii mint/pink, cyberpunk cyan/pink).
3. **Material glyphs + AreaIcon SVGs render; theme fonts per mode** ✅ —
   on-sim screenshots: filled Material glyphs (pinned font), all 5 area SVGs,
   SocialIcon badge on the avatar stack, Courier/Alumni vs Fredoka vs Inter.
4. **Token-only styling** ✅ — components import only `@/theme`; the few
   literal values are web-parity structure (sizing/spacing/borders the web
   also hardcodes), not colors. Scrim rgba values mirror the web literals
   (not tokens there either — see port-map note).

Simulator evidence (session scratchpad): `sb-initial.png`, `sb-semantic.png`,
`sb-preview.png`, `sb-areaicon.png`.

## Test coverage
57 tests / 12 files. New: `button-logic` (5 — the accent-swap AC),
`gradient` (4, against all three skins' real token strings), `social-svgs`
(2 — 12 XML entries + platform aliasing), `area-icon-paths` (1),
`vent-input-logic` (1), `relative-time` (2). Updated: `build.test.ts` (Inter
expectation). **Gaps:** no RN rendering assertions (no RNTL/jest rig — design
D10; stories are the visual rig and were exercised on-simulator); animations
(press spring, save-pop, typing dots, sheet reveals) compile and mount but
their motion wasn't asserted; Android untested (no emulator this session).

## Open concerns for a human reviewer
1. **Ticket-text deviations, all deliberate (design.md D1/D3):** no
   CircleArrow/CircularArrow components (web deleted them), no `tall` prop
   (primary = former tall), no Moti (unmaintained vs Reanimated 4.5 — used
   Reanimated directly), **no typewriter** (nothing on web to port; belongs
   to T-030-04's response screen).
2. **Sheet exits are instant** (entering animations only) — RN Modal unmount
   semantics; add exit choreography in the T-030-04 composites if design
   wants it.
3. **AppHeader dropdown labels** use the DS Button typography (15px/theme
   tracking) rather than the web dropdown's bespoke 14px/3px span — flag if
   pixel parity matters.
4. **LensAvatar renders initials** on the gradient — portrait assets aren't
   bundled; T-030-04 should wire `portraits/` + expo-image.
5. **Storybook story-selection doesn't persist** across reloads (needs
   AsyncStorage — deliberately not adopted; deep links cover jump-to-story).
   Theme choice DOES persist (SecureStore).
6. **fcard/sheet chrome on kawaii/notepad** inherits the muddy-scrim web
   issue (S-030 port-map note: fix as a token on web first; RN inherits via
   the fidelity-gated var maps).
7. Generated modules (`social-svgs.ts`, `area-icon-paths.ts`) will drift if
   the web assets change — regeneration notes in progress.md; consider a
   check-script ticket if these churn.

Ready for T-030-04 (screen ports) to compose these primitives.
