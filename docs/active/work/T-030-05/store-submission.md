# T-030-05 — App Store submission package

Everything needed to take the build from this repo to a submitted iOS app.
Code items are done; **K-items need Kate's accounts** and are the only
blockers. Free-first v1: no IAP anywhere (S-030 decision).

## 1. Build & submit runbook (EAS)

```bash
cd mobile
npx eas login                    # K1 — Kate's Expo account
npx eas init                     # writes extra.eas.projectId into app.json → commit it
npx eas build --profile development --platform ios   # dev client (simulator-capable)
# verify push + Apple sign-in on the dev build (section 5), then:
npx eas build --profile preview --platform ios       # internal device build
npx eas build --profile production --platform ios    # store build (auto-increments)
npx eas submit --platform ios                        # K3 — Apple credentials
```
- `eas credentials` handles signing (K3: Apple Developer *individual*
  enrollment — the S-030 decision; no LLC/DUNS needed).
- Push needs an APNs key: `eas credentials` → iOS → Push Notifications →
  let EAS manage (one click once the Apple account is linked).
- **K2**: Clerk dashboard → SSO connections → enable **Apple** (the
  sign-in button ships and errors cleanly until this is on).
- **K4**: apply `V200/supabase/migrations/009_push_tokens.sql` via the
  Supabase MCP when releasing the PR (gated process), then confirm with
  `list_migrations`.

## 2. App Store listing

- **Name**: Minds Shift — perspective journal. **Subtitle**: Vent it, see
  it through history's eyes.
- **Category**: Lifestyle (primary), Health & Fitness (secondary).
- **Description opener**: "Vent what's on your mind, pick a historical
  lens, and read your problem the way Socrates, Maya Angelou, or Muhammad
  Ali would." Mention: 3 visual worlds, private journal with Face ID lock,
  weekly mindmap nudge. Do NOT promise therapy or advice.
- **Keywords**: journal, venting, perspective, reframe, stoic, historical,
  mindmap, reflection.
- **Support URL**: https://minds-shift.com · **Marketing URL**: same.
- **Privacy policy URL** (REQUIRED, K5): publish one at
  minds-shift.com/privacy before submission — none exists today.

## 3. App Privacy labels (data collection declaration)

| Data | Collected? | Linked to identity | Tracking |
|---|---|---|---|
| Email address | Yes (Clerk accounts) | Yes | No |
| Name | Yes, optional (Clerk profile) | Yes | No |
| User content (vents, responses, chats, mindmaps) | Yes (Supabase) | Yes | No |
| Identifiers (user ID, push token) | Yes | Yes | No |
| Usage data / diagnostics | No (no analytics SDK in the app) | — | No |

No third-party advertising, no tracking across apps → answer **"No"** to
the ATT/tracking question. Third parties processing data: Clerk (auth),
Supabase (storage), Groq/Google (AI text, content only), Expo (push
delivery), Resend (email). Anonymous use: the vent→lens→response flow
works without an account; say so in the review notes.

## 4. Age rating questionnaire

Frequent/Intense: none. **Infrequent/Mild: Mature/Suggestive Themes** —
users vent about real-life problems and figures respond frankly. Medical/
Treatment Information: None (the app explicitly disclaims advice). Result
lands at **12+**. Do not tick "Unrestricted Web Access" (no browser).

## 5. Review notes (App Review box)

- Demo account: create a fresh reviewer account (K6) and paste creds.
- Explain the anon path: "The core flow works signed out; the journal
  requires an account because it persists content."
- 4.2 minimum functionality: native value-adds = Face ID journal lock,
  weekly push nudge, native share sheet, haptics — all on device.
- 3.1.1 watch-item: the app is free with NO purchase flow; Profile
  mentions "manage your plan on the web" without linking to checkout or
  naming prices. If Review objects, drop that sentence (one string).
- Mental wellness positioning: point to the in-app disclaimer (theme-select
  entry ack + Profile crisis note): perspective, not care.

## 6. Screenshot shot-list (6.9" + 6.5" required; use the sim)

1. Theme-select (cyberpunk) — "Pick your reality".
2. Onboarding vent input (kawaii) — "Get it off your chest".
3. Lens grid with portraits (cyberpunk) — "Choose your lens".
4. Response with action pills (notepad) — "See it their way".
5. Journal list with entries (cyberpunk) — "Your private journal".
6. Chat with a lens (kawaii) — "Keep the conversation going".
7. Share sheet quote card — "Share the shift".

## 7. Disclaimer & crisis resources (shipped copy)

- Entry ack (theme-select, T-030-04): "Minds Shift offers perspective, not
  professional advice…" (unchanged).
- **Profile crisis note (added this ticket)**: "If you're in crisis or
  thinking about harming yourself, this app isn't the right tool — in the
  US, call or text 988 (Suicide & Crisis Lifeline); elsewhere, find local
  lines at findahelpline.com."
- Repeat both in the App Review notes.

## 8. K-item checklist (Kate)

- [ ] K1 `eas login` + `eas init` (commit the projectId) + dev build
- [ ] K2 Enable Apple SSO connection in Clerk
- [ ] K3 Apple Developer enrollment + `eas credentials` (incl. APNs key)
- [ ] K4 Apply migration 009 via Supabase MCP at PR release
- [ ] K5 Publish minds-shift.com/privacy
- [ ] K6 Reviewer demo account
- [ ] Dev-build verification: push toggle end-to-end (register → Sunday
      cron dry-run → nudge tap routes to mindmap), Apple sign-in
      completes, Face ID on a real device, share saves to Photos
- [ ] TestFlight internal test → production build → `eas submit`
