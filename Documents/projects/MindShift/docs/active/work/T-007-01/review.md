# T-007-01 Review: UX Copy Research — Complete

## What Changed

- `research.md` — UX writing principles for emotional/reflective apps, comparisons to Calm, Reflectly, Day One, Notion
- `design.md` — Before/after copy decisions for all 6 screens (Landing, Lens Selection, Popup, Response, Create Account, Journal)
- `structure.md` — Implementation-ready copy spec organized by screen and text node
- `plan.md` — 9-step implementation sequence for the Figma push

## Key Copy Decisions

| Screen | Most Impactful Change |
|---|---|
| Landing | "Have something on your mind?" → "What's weighing on you?" (emotional load) |
| Landing | "Select the lens" → "Choose my lens →" (first-person + forward motion) |
| Landing | "Type it all out right here!" → "Start anywhere. No judgment here." (removes pressure) |
| Lens Selection | "Pick a Lens" → "Who do you want to hear from?" (conversational, personalizes choice) |
| Popup | "Select the lens" → "Choose this lens →" (contextual specificity) |
| Response | "Continue conversation" → "Go deeper" (implies depth, shorter, no truncation) |
| Response | "Socials" → "Share" (universal, unambiguous) |
| Create Account | "Create Account" (headline) → "Join MindShift" (belonging over transaction) |
| Create Account | Feature-list sub → "Save every shift. Revisit when you need it most." (benefit-led) |
| Create Account | "IDK" → "Apple" (real social auth option) |
| Journal | "Welcome to the journal feature!" → "Your MindShift Journal" (ownership language) |

## Coverage

- All 6 screens fully specified
- No placeholder copy ("Type it all out right here!", "IDK") remains in spec
- Dynamic content (user input, AI response) correctly left as [dynamic] — not in scope
- Functional UI copy (character counter "0/450 characters", theme switcher labels) unchanged per constraints

## Open Items

- None blocking. Phone field marked "(optional)" — engineering should confirm whether to include at all in v1
- Apple sign-in requires App Store compliance review before shipping
- "Go deeper" for "Continue conversation" — short enough to fit the 91px button width confirmed in Figma

## Implementation Verified

T-007-02 applied this spec to Figma node 270-1181 (CAUDE 15 page). All 6 screens rendered. Screenshot validated — no placeholder copy visible, all updated CTAs present.
