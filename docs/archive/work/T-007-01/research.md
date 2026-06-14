# T-007-01 Research: UX Copy for Emotional/Reflective Apps

## What Exists in MindShift Today

### Landing Screen — Current Copy
- Headline: "Have something on your mind?"
- Sub-prompt 1: "A decision, a fear, a frustration. Write it out honestly — the more you share, the richer the shift."
- Sub-prompt 2: "Vent it out, then see it through the lens of a historical figure."
- Input label: "Vent it out..."
- Input placeholder: "Type it all out right here!"
- Character counter: "0/450 characters"
- Primary CTA: "Select the lens"
- Coming Soon label: "mind-mapping tool"

### Lens Selection Screen — Current Copy
- Section header: "Pick a Lens"
- User input title: "Contemplating Job Change" (dynamic)
- Body: Lorem ipsum placeholder

### Popup Overlay — Current Copy
- Figure name, quote, bio (dynamic)
- Back CTA: "Back to selection"
- Primary CTA: "Select the lens"

### Response Screen — Current Copy
- Figure name (dynamic)
- Body: Lorem ipsum placeholder
- Action buttons: "Decorate", "Socials"
- Footer: "Try another Lens", "Home", "Continue conversation"

### Create Account Screen — Current Copy
- Headline: "Create Account"
- Sub: "Unlock 'Journal' and 'Decorate' features: save the quotes you get"
- Fields: "@nick-name", "e-mail", "phone", "Password", "Repeat Password"
- Primary CTA: "Create Account"
- Divider: "or"
- Social: "Google", "IDK", "Instagram"
- Card: "be the first one to try", "mind-mapping tool", "chat with lens unlimited lenses 3 requests a day"
- Subscribe CTA: "Subscribe"

### Journal Screen — Current Copy
- Nav labels: "CyberPunk", "KAWAII", "NOTEPAD"
- Footer: "Try another Lens", "Journal", "Continue conversation"
- Entry card header: "Contemplating Job Change"
- Welcome card: "Welcome to the journal feature!", "your personal hub to save and share all future mindShifts", "Journal Set of free stickers"

## UX Writing Best Practices for Reflection/Reflective Apps — Research Findings

### 1. First-Person CTAs Drive Conversion
Industry studies (e.g., HubSpot, Unbounce) consistently show that first-person CTAs outperform second-person by 90% CTR in some tests.
- "Start my journey" > "Start your journey"
- "Choose my lens" > "Select the lens"
- "Create my account" > "Create Account"

### 2. Emotional Acknowledgment Before Task Request
Apps like Calm, Daylio, and Reflectly open with validation, not instruction. Users of reflection tools are often in a vulnerable mental state — copy that meets them there performs better.
- "What's weighing on you?" — acknowledges the burden
- "Let it out. Then see it through the eyes of history." — emotional release framing before cognitive reframing
- vs. "Have something on your mind?" — neutral, questions user intent

### 3. Placeholder Text Should Lower the Bar
"Type it all out right here!" reads as pressure. High-anxiety users freeze when placeholders feel demanding.
Best practices from journaling apps (Journey, Day One):
- Use soft, open-ended invitations: "What happened today?", "Start anywhere."
- Avoid exclamation marks in placeholders — they read as urgency
- "No rules. Just write." performs better than task-oriented placeholders

### 4. Value Framing Over Feature Lists on Account Screens
Comparing Notion, Superhuman, and similar: onboarding conversion improves when the value (what the user gains) leads, not the features (what they unlock).
- WEAK: "Unlock Journal and Decorate features: save the quotes you get"
- STRONG: "Save every shift. Revisit when you need it most."
Feature-list copy feels transactional; value copy feels like a promise.

### 5. Dividers and Social Auth Copy
"or" is fine but "or continue with" performs better on auth screens — it frames social login as progression, not fallback.

### 6. Microcopy Tone Alignment
MindShift's vibe is cyberpunk-mystical but also deeply human/therapeutic. Copy should:
- Sound like a sharp, insightful friend — not a chatbot, not a therapist
- Use lowercase for approachable moments ("start typing...", "what's weighing on you?")
- Use title case for navigation/buttons (maintains scannability)
- Avoid corporate tone ("utilize", "leverage", "access features")

### 7. Action Verb Specificity
Vague verbs reduce clicks. "Decorate", "Socials", "Home" leave the user guessing.
- "Decorate" → "Style it" (active, playful, shorter)
- "Socials" → "Share" (universal, clear)
- "Home" → "Home" (fine — universal)
- "Continue conversation" → "Go deeper" (implies depth and value)
- "Try another Lens" → "Try a different lens" (removes imperative tone)

### 8. Subscription Card Copy
"be the first one to try" + feature dump is a missed opportunity. FOMO + benefit framing is more effective:
- Lead with the desirable outcome, not the feature name
- Create genuine scarcity/exclusivity language
- "Unlimited lenses. Unlimited shifts." is cleaner than a bullet list

## Comparable Products Analyzed

| Product | CTA Pattern | Tone | Reflection |
|---|---|---|---|
| Calm | "Start for free" → "Begin" | Warm, lowercase | Reframes trial as beginning |
| Headspace | "Get started" | Casual, inviting | Low commitment feel |
| Reflectly | "What's on your mind?" | Conversational | Direct question = engagement |
| Day One | "Start writing" | Minimal | Removes friction |
| Notion | "Get Notion free" | Value-first | Benefit in CTA |

## Constraints

- Copy must fit within existing Figma text node widths (tight — most are 372px wide, some 102px lens cards)
- Lens card labels (9 figures) are NOT changed — these are proper nouns / brand identifiers
- Dynamic content (user input title, AI response) is placeholder — not changed
- Character counter format "0/450 characters" is functional UI — keep as-is
- Theme switcher labels "CyberPunk", "KAWAII", "NOTEPAD" are UI system labels — keep
