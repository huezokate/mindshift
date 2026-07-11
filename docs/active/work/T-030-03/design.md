# T-030-03 rn-primitives-storybook — Design

Decisions grounded in research.md. Each Dn lists options, choice, rationale.

## D1 — Port target: current web reality, not the ticket's stale list

**Options:** (a) build the ticket text literally (CircleArrow, CircularArrow,
`tall` Button, semantic `journal`/`mindmap` Button variants, typewriter);
(b) port what the web actually ships today.

**Choice: (b).** The port map's own rule is "fix on web first, port clean" —
web is the visual spec. Concretely:
- CircleArrow/CircularArrow → **icon-only `<Button>`** (their web replacement).
  The Button story shows the chevron pair so the census row is still covered.
- `tall` → role-based sizing exactly like web (primary 56 / secondary 45
  minHeight). No `tall` prop.
- Semantic accent-swap → **stays caller-side** (AppHeader maps Journal rows →
  `secondary`, Mind Map rows → `secondary2`), same as web. The AC ("semantic
  Button accent-swap resolves correctly per mode") is verified by the AppHeader
  story + an explicit `SemanticPair` Button story rendering the Journal/Mind
  Map pair — the exact web bug-class surface.
- Typewriter → **not built** (no web implementation exists to port; response
  reveal design belongs to T-030-04's response screen). Flagged in review.md.

**Rejected (a):** porting components web deleted reintroduces drift the S-027
census was created to kill.

## D2 — Extract real RN components where web uses CSS token patterns

Web's Card/hcard/Input/Sheet/ChatBubble are CSS-var patterns applied inline.
RN has no cascade, so every callsite would re-spread token styles. **Extract
components:** `Card`, `HeadingCard`, `VentInput`, `Sheet`, `ChatBubble`.
They are thin: read one token family, expose children + a few props. This is
the ticket's own framing ("shared surfaces") and prevents the inline-spread
copy-paste that T-030-04's eight screens would otherwise multiply.

`Sheet` is ONE component with `position: 'bottom' | 'center'` and `chrome:
'card' | 'fcard'` — covering both web implementations (ShareSheet = bottom +
fcard; LensPicker overlay = center + card). The full LensPickerSheet/ShareSheet
composites (carousel, quote canvas) are T-030-04 screen work; this ticket
ships the overlay surface primitive they'll compose.

## D3 — Animation: Reanimated 4 directly; Moti rejected

Ticket says "Reanimated 3 + Moti", but the repo ships **Reanimated 4.5**
(pinned by RN 0.86 / worklets 0.10 peer ranges — Reanimated 3 does not support
RN 0.86) and Moti 0.30 hasn't been published since 2025-01, predating
Reanimated 4 and the New-Arch-only world. Adding an unmaintained
compat-uncertain layer to save a few lines is a bad trade.

**Built with Reanimated 4:** Button press spring (scale 0.93 in / spring back
~1, mirroring web's 180ms overshoot bezier), **save-pop** (`useSavePop()` hook
→ `withSequence` scale 1→1.3→0.92→1, exported from `ui/motion.ts`),
**TypingDots** (3 dots, `withRepeat` opacity 0.3↔1 + y 0↔−2, 0.18s stagger),
**Sheet reveal** (overlay `FadeIn`/`FadeOut` 180ms + panel `FadeInDown`/
`SlideInDown` for bottom, `ZoomIn`-style scale 0.94 + y 8 for center — the web
LensPicker values). All honor `useReducedMotion()`.

## D4 — Storybook: `@storybook/react-native` 10.5, on-device, expo-router entry

- Deps added: `storybook@^10.5`, `@storybook/react-native@^10.5`,
  `@storybook/addon-ondevice-controls`, `@storybook/addon-ondevice-actions`,
  `@gorhom/bottom-sheet@^5` (hard peer of the SB UI; reanimated-4 compatible).
- Config in `mobile/.rnstorybook/` (main.ts: stories glob
  `../src/**/*.stories.@(ts|tsx)`, both ondevice addons; index.tsx:
  `getStorybookUI` wrapped in GestureHandlerRootView + SafeAreaProvider).
- **metro.config.js created** (expo default + `withStorybook`, enabled unless
  `WITH_STORYBOOK=false`) — requires-file generation is dev-cheap.
- **Entry = expo-router route `src/app/storybook.tsx`**, renders the SB UI only
  when `__DEV__` (production renders a redirect home). No separate entrypoint /
  app.json fork; one `npm run storybook` script (`expo start`) documents it.

**Mode "toolbar" (RN Storybook has no web toolbar):** a `withTheme` decorator
in `.rnstorybook/preview.tsx` wraps every story in the real `ThemeProvider`,
paints `tokens.palette.bg` behind the story, and renders a compact persistent
**ModeBar** (the three MODES chips, reusing `sw` tokens — extracted from
theme-select's ModeSwitcher into `ui/mode-switcher.tsx` so app + Storybook
share one implementation). Mode persists via the provider's SecureStore
storage, so the choice survives reloads. This satisfies "story renders across
all three modes" with live in-story switching, mirroring web's toolbar
semantics. A small `<TriModes>` helper (renders children 3× under fixed
`buildTheme(mode)` contexts) gives web's "Compare all 3" for the key stories
(Button semantic pair, tokens page).

**Rejected:** separate Storybook app entrypoint (drifts from app providers);
addon-ondevice-backgrounds (paints colors only, can't re-theme components).

## D5 — Icon: pinned static font instance; runtime axes dropped

RN 0.86 has no `fontVariationSettings`, so web Icon's `fill/weight/grade`
props are unimplementable at runtime. The bundled variable TTF renders at
default axes (FILL 0, wght 400) — visibly wrong vs web default (FILL 1,
wght 700): outlined vs filled glyphs.

**Choice:** pin the font asset itself — implement step runs `fonttools
varLib.instancer` (pip, best-effort) to bake `FILL=1 wght=700 GRAD=0` into
`MaterialSymbolsRounded.ttf`. Icon API is `name/size/color` only (no fake
axis props). **Fallback** if fonttools is unavailable offline: keep the
variable TTF (glyphs render, satisfying the AC) and record the fidelity gap in
review.md. Existing `ms-icon.tsx` is replaced by `ui/icon.tsx` (token default
color via `useTheme`, callers migrated, old file deleted).

**Rejected:** two bundled fonts (filled+outline) — doubles asset weight for an
axis the app never toggles (web default is always FILL 1 in practice).

## D6 — Notepad Inter font: best-effort asset add

T-030-02 handed this gap here. Implement step downloads Inter
Regular/SemiBold TTFs (rsms/inter release) into `assets/fonts`, registers in
`_layout.tsx` + `fonts.ts` (notepad body/btn/mono). **Fallback:** offline →
keep system-sans (already the accepted T-030-02 behavior), note in review.md.
AC "theme fonts apply per mode" is about tokens driving font selection, which
holds either way.

## D7 — SVG strategy
- **AreaIcon:** `react-native-svg` `<Svg><Path d>` with the five d-strings
  copied verbatim from web `AreaIcon.tsx` (24×24, currentColor → `color`
  prop). Same `AreaId` union as `lib/mindmap-areas.ts`.
- **SocialIcon:** the 12 per-theme SVGs (`V200/public/social/*.svg`) inlined
  as XML strings in a generated `social-svgs.ts` module, rendered with
  `SvgXml`. Rejected metro asset `require()` of .svg — expo-image SVG support
  and metro assetExts behavior are platform-uncertain; inline XML is
  deterministic and keeps the per-theme lookup (`{theme}-{brand}`) in typed
  code. Platform→brand mapping copied from web (link/native/download → sms).

## D8 — Avatar gradient: expo-linear-gradient + narrow CSS parser

`fig.avatar.gradientCss` is a raw `linear-gradient(...)` string. Add
`expo-linear-gradient` (SDK 57) + `theme/gradient.ts` parsing exactly the
grammar the three skins use (`linear-gradient(<deg>, <color> [pos], ...)`) →
`{ colors, start, end, locations }` for `<LinearGradient>`. Parser is pure →
vitest-tested against all three skins' actual token strings. Used by the
avatar ring in LensCard/JournalPreviewCard.

## D9 — Clerk-coupled components: presentational split

`EntryAuthRow` and `AppHeader` read Clerk on web; web Storybook mocks Clerk at
the bundler level. RN Storybook metro aliasing is fragile. **Choice:**
presentational core + thin connected wrapper:
- `entry-auth-row.tsx` exports `EntryAuthRowView({ signedIn, handle, on* })`
  (stories/tests target this) + default `EntryAuthRow` wiring `useUser()`.
- `app-header.tsx`: `AppHeaderView({ signedIn, counts, onNavigate, ... })` +
  connected `AppHeader`. **No self-fetching** in the RN version — counts are
  props; data wiring belongs to T-030-04 screens (`lib/api.ts` exists there).
This also unlocks story controls for both auth states (web parity:
`parameters.clerk.signedIn`).

## D10 — Testing: pure logic in vitest; stories are the visual rig

No RN render rig exists (node vitest + stubs). Adding jest+RNTL is out of
scope. **Tested in vitest:** gradient parser (3 skins), Button
variant→family/sizing resolution (extracted as pure `resolveButtonStyle`
covering the accent-swap AC in code, per mode), AreaIcon path map
completeness vs AreaId union, SocialIcon map completeness (12 XML entries,
platform aliasing), VentInput counter color logic. **Stories** carry visual
verification across modes (the AC's actual subject); manual pass documented in
review.md.

## Out of scope (recorded for T-030-04/05)
- Full LensPickerSheet carousel + ShareSheet quote-canvas composites (screens).
- ThemedBackground textures (scanlines/dots/ruled paper) — T-030-04 with
  screens; stories paint flat `palette.bg`.
- Typewriter response reveal (D1); AsyncStorage swap; RNTL rig.

## Component roster (deliverable checklist)
Primitives: Button, Icon. Surfaces: Card, HeadingCard, VentInput, Sheet,
ChatBubble (+TypingDots). Composed: LensCard, JournalPreviewCard, WelcomeCard,
AppHeaderView(+AppHeader), EntryAuthRowView(+EntryAuthRow), MindmapAreaCard,
AreaIcon, UpcomingChip, SocialIcon, AuthBanner. Shared: ModeSwitcher (extracted),
motion utils (save-pop, press spring), TriModes story helper, Themes/Tokens
reference story. Every roster item ships with a `*.stories.tsx`.
