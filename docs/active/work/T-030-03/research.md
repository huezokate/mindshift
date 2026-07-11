# T-030-03 rn-primitives-storybook — Research

Descriptive map of what exists on both sides of the port. No solutions here.

## 1. The consuming side: `mobile/` (Expo SDK 57)

### Workspace state (after T-030-01/T-030-02)
- Expo 57 / RN **0.86** (New Architecture) / React 19.2 / expo-router v57, typed
  routes, React Compiler experiment on. TypeScript strict; `@/*` → `src/*`,
  `@/assets/*` → `assets/*`.
- Installed and relevant: `react-native-reanimated` **4.5.0** (+
  `react-native-worklets` 0.10.0), `react-native-gesture-handler` 2.32,
  `react-native-safe-area-context` 5.7, `react-native-svg` 15.15,
  `expo-font`, `expo-image`. **No** metro.config.js, **no** babel.config.js
  (Expo defaults; babel-preset-expo wires the worklets plugin automatically).
- Screens are placeholder stubs (`src/app/*`); the only real UI is
  `theme-select.tsx`, which demonstrates the intended component idiom:
  everything styled from `useTheme().tokens`, `borderStyle()`/`sideStyle()`
  spreads, RN `boxShadow`/`filter` string props (New Arch), zero hardcoded hex.
- Existing components: `ms-icon.tsx` (Material Symbols by ligature name,
  default font instance, hardcoded default color `#e8f6f8`), `nav-link.tsx`
  (hardcoded Phase-0 colors), `auth-form.tsx`, `placeholder-screen.tsx`,
  `foundation-check.tsx`. None token-driven except the theme-select demo.

### Token layer (T-030-02) — the contract this ticket consumes
- Public API `@/theme`: `ThemeProvider`, `useTheme()` → `{ mode, setMode,
  tokens: Theme }`, `MODES` (Light·Notepad / Cheerful·Kawaii / Dark·Cyberpunk,
  same labels/order as web Storybook), `buildTheme`, `themes`,
  `borderStyle`/`sideStyle`, types.
- `Theme` has typed slots for every family this ticket needs: `palette`,
  `text`, `glow`, `fonts` (display/body/btn/mono as loaded RN families),
  `card`, `hcard` (incl. padding), `fig` (lens-figure chrome incl.
  `avatar.gradientCss` — raw CSS gradient string), `input`, `btn` /
  `btnSecondary` / `btnSecondary2` (**the accent-swap is data**: secondary =
  positive/blue, secondary2 = negative/red, per-skin), `logo`, `chat`
  (userAccent/lensAccent), `fcard` (ShareSheet chrome), `lens`, `preview`,
  `shareAccent`, `focusRing`, `mmCardBgSelected`, `sw` (switcher), `node`,
  `radii`, `glass`, plus `raw` escape hatch for any resolved token.
- A CSS-fidelity vitest gate diffs the var maps against the real V200 CSS —
  token drift is a CI failure.
- Fonts loaded in `src/app/_layout.tsx` via `useFonts`: AlumniSansSC
  (SemiBold/Bold), NunitoSans (Regular/Bold), Fredoka (Medium/SemiBold),
  MaterialSymbolsRounded. **Known gap:** notepad's web body/btn/mono font is
  Inter; no Inter asset exists, falls back to system sans (T-030-02 review
  concern #1, suggested for this ticket).
- Other carried concerns (T-030-02 review): body surface textures
  (scanlines/polka dots/ruled paper) are CSS rules, not tokens — no RN
  equivalent yet; `fig.avatar.gradientCss` needs a gradient renderer;
  SecureStore-based mode persistence is a semantic misuse but isolated.

### Test setup
- vitest (node) with hand stubs for `react-native` and `expo-secure-store`
  (`src/test/stubs/`). 42 tests pass. There is **no RN rendering test rig**
  (no jest, no RNTL); only pure logic is testable today.

## 2. The spec side: V200 web components + Storybook (S-027 census)

Full inventory (paths under `V200/src`). The ticket's component list is
partially stale relative to current web code — divergences flagged **[≠]**.

### Primitives
- **Button** — `components/ui/Button.tsx` + stories. Variants
  `primary | secondary | secondary2`; modifiers `subtext`, `fullWidth`,
  `disabled` (opacity .6), `icon` (Material name) + `iconSize`. Icon-only =
  `icon` without children → square button. **[≠] CircleArrow/CircularArrow no
  longer exist** — replaced by icon-only Button (LensPicker chevrons use
  `<Button variant="secondary" icon="chevron_left">`). **[≠] no `tall`
  modifier** — role-based sizing: primary minHeight 56 / pad 12×16, secondaries
  minHeight 45 / pad 8×12. **[≠] no semantic journal/mindmap variants on the
  component** — the mapping (journal→secondary, mindmap→secondary2) lives in
  callers (AppHeader rows). Tokens: full `--btn*` families + `--font-btn`,
  letter-spacing/subtext-tracking. Animation: CSS press spring (hover 1.04,
  active 0.93, 180ms overshoot bezier), `--focus-ring` on focus-visible.
- **Icon** — `components/ui/Icon.tsx` + stories. Material Symbols Rounded
  webfont with variable axes; props `name/size/fill(0|1, default 1)/weight
  (default 700)/grade`; color via currentColor. **RN 0.86 has no
  `fontVariationSettings` style** (only `fontVariant` OpenType features) — the
  bundled TTF renders at its default instance; web default look is FILL 1
  wght 700.

### Shared surfaces (mostly token patterns, not components on web)
- **Card / hcard** — **[≠] no React component**; inline `--card-*` / `--hcard-*`
  usage at callsites (AuthBanner, WelcomeCard, onboarding heading card).
- **Input/textarea** — **[≠] no component**; the onboarding vent input is an
  `--input-*` card: header row + textarea + char counter (turns `--pink` past
  700), overlay placeholder. Reused shapes in JournalPreviewCard and the chat
  composer.
- **Sheet** — **[≠] two separate implementations, no shared abstraction**:
  `journal/LensPickerSheet.tsx` (centered modal, `--card-*` chrome, figure
  carousel, framer-motion overlay fade 0.18s + per-figure card swap
  opacity/scale/y 0.16s; props open/startIndex/loading/selectLabel/error/
  onSelect/onBack) and `journal/ShareSheet.tsx` (true bottom sheet, `--fcard-*`
  chrome, quote canvas + icon-only share Buttons, no motion).
- **ChatBubble** — **[≠] inline helper** in `journal/ChatScreen.tsx` (lines
  ~148–197): `user` (speech bubble, tail, `--chat-user-accent`, bg
  `--btn-secondary-bg`) vs `lens` (thought bubble, two cloud dots,
  `--chat-lens-accent`, bg `--card-bg`); 1.5px accent border, `--input-radius`.
  Typing indicator: three framer-motion dots (opacity 0.3→1→0.3, y 0→-2→0,
  stagger 0.18s, infinite).

### Composed
- **LensCard** = `journal/LensResponseCard.tsx` (avatar+name header, quote,
  response, share log; fully theme-branched JSX; `--lens-*`, `--fig-avatar-*`,
  `--card-*`, `--input-*`).
- **JournalPreviewCard** — date label, vent body w/ header, footer = avatar
  stack (SocialIcon) or `<Button icon="add">Lens</Button>`; `--preview-*`,
  `--input-*` chrome; heavy per-theme branching.
- **WelcomeCard** — pink-accent empty state; props onLoadDemo/seeding/seedMsg.
- **AppHeader** — brand badge + wordmark + menu trigger (primary `--btn-*`),
  dropdown rows are `<Button fullWidth>`; **the semantic mapping lives here**:
  Profile/Logout→primary, Journal group→secondary, MindMap group→secondary2.
  Self-fetches counts; anon → sign-in funnels.
- **EntryAuthRow** — signed-in: primary Button w/ subtext @handle; signed-out:
  secondary "Log in" + secondary2 "Sign up". Uses Clerk `useUser`.
- **MindmapAreaCard** — props area/body/milestones/actions/selected/width;
  selected swaps border→`--green`, bg→`--mm-card-bg-selected`; uses AreaIcon.
- **AreaIcon** — inline SVG `<path>` d-strings in a `PATHS: Record<AreaId,
  string>` map (24×24, currentColor). Five areas (`lib/mindmap-areas.ts`):
  career, health, relationship, personal, finance.
- **UpcomingChip** — no props; `release_alert` icon 12px + "UPCOMING", pink
  pill.
- **SocialIcon** — props platform/size; loads per-theme brand SVGs from
  `public/social/{theme}-{brand}.svg` (12 files exist: 3 themes ×
  facebook/instagram/sms/tiktok); link/native/download map to sms.
- **AuthBanner** — no props; reads `?reason=` (lens_limit/vent_limit/save/
  journal); `--card-*` chrome, cyan accents.

### Animations actually present on web (for the ticket's "typewriter,
save-pop, bubble reveals")
- **Save-pop**: response page — `useAnimationControls().start({ scale:
  [1, 1.3, 0.92, 1] })` on Save; icon bookmark→bookmark_added.
- **Bubble reveals**: ChatScreen typing dots (above); LensPickerSheet
  overlay/card enter-exit.
- **Typewriter**: **[≠] no typewriter exists in web code** — grep confirms; the
  census/ticket text is aspirational here.
- Button press spring + `fadeSlideUp` page entrances (framer-motion opacity/y).

### Web Storybook (the setup to mirror)
- `.storybook/preview.tsx`: global toolbar `theme` (3 MODES, same labels as
  mobile `MODES`) + `compare` (single vs 3-up grid); decorator sets
  `data-theme` on `<html>` and wraps in real ThemeProvider; Clerk mock
  singleton via `parameters.clerk`; `initialGlobals: cyberpunk`.
- Reference pages: `src/stories/Themes.mdx` + `TokenBoard.tsx` (palette/text/
  type/buttons/radii ×3 themes), `Backgrounds.stories.tsx`.

## 3. RN Storybook landscape (verified against npm, 2026-07)
- `@storybook/react-native` latest **10.5.0**. Peer deps: `storybook >=10`,
  `@gorhom/bottom-sheet >=4` (5.2.14 current; its reanimated peer allows
  >=4.0), gesture-handler ≥2, reanimated ≥2, safe-area-context — all but
  bottom-sheet/storybook already installed. On-device addons
  (`@storybook/addon-ondevice-controls`, `-actions`) ship at matching 10.5.0.
  Config lives in `.rnstorybook/` (main.ts + index.tsx + preview);
  metro must be wrapped with `withStorybook` (generates the requires file).
  RN Storybook has **no web-style toolbar** — globals/mode switching must be a
  decorator-rendered UI.
- **Moti**: 0.30.0, last published 2025-01 — predates Reanimated 4 /
  RN 0.86; unmaintained risk. Reanimated 4.5 (installed) natively provides
  keyframe/entering-exiting animations and `withSequence` worklets, plus
  CSS-like transitions on New Arch.
- `expo-linear-gradient` v57 exists for SDK 57 (for `fig.avatar.gradientCss`).

## 4. Constraints & open questions for Design
1. Ticket text vs web reality: CircleArrow/CircularArrow, `tall`, semantic
   Button variants, and the typewriter don't exist on web anymore — port
   the *current* spec or resurrect the census list?
2. Material Symbols axis fidelity (FILL 1 / wght 700) unreachable via RN
   styles; options live at the font-asset level.
3. Web has no Card/Input/Sheet/ChatBubble abstractions — RN must decide what
   to extract (mobile wants real components; web patterns are CSS classes).
4. Clerk-dependent components (EntryAuthRow, AppHeader) need a story-safe
   strategy (web mocks Clerk at the bundler level).
5. SocialIcon SVGs are per-theme static assets on web; RN needs a
   bundling/rendering choice (react-native-svg is installed).
6. No RN rendering test rig exists; vitest stubs cover pure logic only.
7. Storybook entry must coexist with expo-router (typed routes) and not ship
   in production bundles.
