# T-007-01 Design: Copy Decisions — Before / After

## Decision Framework

All copy changes apply three filters:
1. **Emotional resonance first** — does it meet the user where they are?
2. **Action clarity** — is the next step unambiguous?
3. **Tone alignment** — cyberpunk-sharp but warm, not cold or clinical

---

## Screen 1: Landing

### Headline
- BEFORE: "Have something on your mind?"
- AFTER: "What's weighing on you?"
- WHY: More emotionally loaded. "Weighing" implies burden, which is what brings users here. Shorter.

### Sub-prompt 1
- BEFORE: "A decision, a fear, a frustration. Write it out honestly — the more you share, the richer the shift."
- AFTER: "A decision. A fear. A frustration. Write it out — the more honest you are, the richer your shift."
- WHY: Period separation adds punch, matches cyberpunk staccato aesthetic. "Your shift" creates personal ownership.

### Sub-prompt 2
- BEFORE: "Vent it out, then see it through the lens of a historical figure."
- AFTER: "Release it here. Then see it through the eyes of history's greatest minds."
- WHY: "Release" is more therapeutic/cathartic than "vent". "Eyes of history's greatest minds" is more evocative than "lens of a historical figure" — it elevates the app's proposition.

### Input Label
- BEFORE: "Vent it out..."
- AFTER: "What's on your mind?"
- WHY: Label serves as question/invitation. "Vent it out" is directive; a question is more open.

### Input Placeholder
- BEFORE: "Type it all out right here!"
- AFTER: "Start anywhere. No judgment here."
- WHY: Removes pressure ("all out"), removes direction ("right here"), adds psychological safety ("no judgment").

### Primary CTA
- BEFORE: "Select the lens"
- AFTER: "Choose my lens →"
- WHY: First-person ownership + arrow implies forward motion. "Choose" is more deliberate than "Select".

### Coming Soon Card — Label
- BEFORE: "Coming Soon"
- AFTER: "Coming Soon"
- WHY: Keep — it's a system status label, not copy.

### Coming Soon Card — Feature Name
- BEFORE: "mind-mapping tool"
- AFTER: "Mind Mapping"
- WHY: Title case, cleaner, shorter.

### Coming Soon Card — Description
- BEFORE: "You sleep better on weekends — here's why that mat" (truncated)
- AFTER: "Visualize your thoughts as a living map. Coming next."
- WHY: Teases feature value, not a sleep insight (which seems misplaced).

---

## Screen 2: Lens Selection

### Section Header
- BEFORE: "Pick a Lens"
- AFTER: "Who do you want to hear from?"
- WHY: Conversational question increases engagement. "Pick" is transactional; "who" personalizes the choice and primes emotional investment.

### User Quote Title (dynamic)
- Keep as-is — user-generated content.

### User Quote Body (dynamic)
- Keep as-is — lorem ipsum replaced by real user input at runtime.

---

## Screen 3: Popup Overlay — Lens Preview

### Back CTA
- BEFORE: "Back to selection"
- AFTER: "← Back"
- WHY: Shorter, universally understood. Saves space for primary CTA.

### Primary CTA
- BEFORE: "Select the lens"
- AFTER: "Choose this lens →"
- WHY: "This" is specific and contextual (user is looking at a specific figure). First-person on landing, contextual "this" on confirmation step.

---

## Screen 4: Response Screen

### Action Row
- "Decorate" → "Style it"
  - WHY: Active verb, playful, matches creative intent better.
- "Socials" → "Share"
  - WHY: Universal, clear, no ambiguity.

### Footer Navigation
- "Try another Lens" → "Try a different lens"
  - WHY: "Another" implies random; "different" implies intentional choice. Softer.
- "Home" → "Home" (keep)
- "Continue conversation" → "Go deeper"
  - WHY: "Continue conversation" is long (truncated in design) and clinical. "Go deeper" implies intellectual and emotional depth — fits MindShift's brand.

---

## Screen 5: Create Account

### Headline
- BEFORE: "Create Account"
- AFTER: "Join MindShift"
- WHY: "Join" implies community/belonging. "Create Account" is transactional.

### Sub-headline
- BEFORE: "Unlock 'Journal' and 'Decorate' features: save the quotes you get"
- AFTER: "Save every shift. Revisit when you need it most."
- WHY: Benefit-led copy outperforms feature-led. "When you need it most" adds emotional resonance and implies ongoing value.

### Form Field Labels
- "@nick-name" → "Username"
- "e-mail" → "Email"
- "phone" → "Phone (optional)"
  - WHY: Phone optional — users are hesitant to provide phone. Marking it optional reduces friction.
- "Password" → "Password" (keep)
- "Repeat Password" → "Confirm password"
  - WHY: "Confirm" is standard and clearer than "Repeat".

### Form Placeholders ("Type it all out right here!")
- "Username" field: "@yourname"
- "Email" field: "you@example.com"
- "Phone" field: "+1 (optional)"
- "Password" field: "8+ characters"
- "Confirm password" field: "Same as above"
- WHY: Each placeholder is contextually useful, not generic.

### Primary CTA
- BEFORE: "Create Account"
- AFTER: "Create my account"
- WHY: First-person. Lower commitment feel.

### Social Auth Divider
- BEFORE: "or"
- AFTER: "or continue with"
- WHY: Frames social login as a path forward, not fallback.

### Social Button — "IDK"
- BEFORE: "IDK"
- AFTER: "Apple"
  - WHY: "IDK" appears to be a placeholder. Apple sign-in is the logical third option alongside Google/Instagram.

### Subscription Card
- "be the first one to try" → "Early access. Unlimited everything."
- "mind-mapping tool" → "Mind Mapping + Chat with any Lens"
- Feature list: "chat with lens unlimited lenses 3 requests a day" → "Unlimited lenses · Unlimited shifts · Priority access"
- Subscribe CTA: "Subscribe" → "Unlock it all"

---

## Screen 6: Journal

### Welcome Card — Headline
- BEFORE: "Welcome to the journal feature!"
- AFTER: "Your MindShift Journal"
- WHY: More direct, less onboarding-speak. Users know where they are.

### Welcome Card — Description
- BEFORE: "your personal hub to save and share all future mindShifts"
- AFTER: "Every shift, saved. Every insight, yours."
- WHY: Short, punchy, memorable. Matches cyberpunk staccato tone.

### Welcome Card — Feature Line
- BEFORE: "Journal Set of free stickers"
- AFTER: "Free with your account: journal access + exclusive stickers"
- WHY: Clearer value prop. "Set of free stickers" sounds like a children's app.

### Footer
- "Try another Lens" → "New shift" (journal context — starting a new shift is more relevant than trying a lens)
- "Journal" → "Journal" (keep — already on journal, but tab is correct)
- "Continue conversation" → "Go deeper" (consistent with response screen)

---

## Decisions NOT Made

- Lens figure names and traits: unchanged (proper nouns, brand)
- Character counter: "0/450 characters" — functional UI, unchanged
- Theme switcher labels: "CyberPunk", "KAWAII", "NOTEPAD" — system labels, unchanged
- Watermark "Mindshift" text on share overlay: unchanged
