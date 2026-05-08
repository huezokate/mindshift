# Design — T-005-02: claude-api-lens-integration

## Approach Options

### A. System prompt per-figure embedded in FIGURES, fetch on pick
Add a `systemPrompt` field to each FIGURES entry. When a figure is picked, call the Anthropic API with that prompt + user vent text. Parse JSON response into deep-dive sections.

**Pros:** Data and behavior co-located, easy to tune individual characters, no extra files.
**Cons:** FIGURES definition grows longer.

### B. System prompts in a separate PROMPTS map keyed by name
Keep FIGURES lean, add `const FIGURE_PROMPTS = { 'Dolly Parton': '...', ... }`.

**Pros:** Separation of concerns.
**Cons:** Extra indirection, risk of name mismatches.

### C. Single generic prompt with character name injected
One system prompt template: "Respond as {name}. Their worldview: {tag}."

**Pros:** Minimal code.
**Cons:** Generic output — misses the distinctive voice of each character. User explicitly wants "like a real character."

## Decision

**Option A.** Embed `systemPrompt` in each FIGURES entry. Distinctive per-character prompts, co-located with the figure data. Easy to refine.

## Response Format

Ask Claude to respond in JSON:
```json
{
  "sections": [
    { "title": "string", "body": "string (may include simple HTML like <strong>, <ul><li>)" },
    { "title": "string", "body": "string" },
    { "title": "string", "body": "string" }
  ]
}
```
3 sections, ~80-120 words each. Strict JSON output — wrap the `messages` call with `response_format` or use a tight prompt + JSON.parse with fallback.

## API Key UX

On first figure pick with no key stored: show a lightweight inline modal (no page change) prompting for the key. On submit, store in localStorage and proceed with the API call. Add a subtle "🔑" settings link on page 5 to clear/update the key.

## Error Handling

- Invalid/missing key → show inline error in `deepDiveContent`, offer retry or return to pick
- Network error → same
- Parse error (bad JSON) → graceful fallback: render the raw text in a single section

## Character Prompts Strategy

Each system prompt follows this template:
1. Who they are (2 sentences, grounding their identity and era)
2. How they characteristically think and reframe
3. Instruction: respond to what the user shared, 3 sections, JSON format, in their authentic voice

Specific distinguishing traits to encode per figure:
- **Dolly Parton** — warmth, self-deprecating humour, practical optimism, Southern storytelling, reframes hardship as character-building
- **Socrates** — Socratic questioning, never gives answers directly, surfaces contradictions, uses "what do you mean by X?", irony
- **Abraham Lincoln** — melancholy acceptance, stories and analogies, long game, patience over urgency, grace under weight
- **Maya Angelou** — rhythmic prose, survivorship, naming pain precisely, "you are not diminished by what happened to you"
- **Marcus Aurelius** — stoic dichotomy of control, journal-like interiority, duty, reason, "what would a good person do here?"
- **Marie Curie** — systematic curiosity, reframes fear as ignorance to dissolve, evidence-based, unimpressed by obstacles
- **Nelson Mandela** — forgiveness as strategy not weakness, long arc of history, patience, dignity under injustice
- **Frida Kahlo** — pain acknowledged not minimised, creative transmutation, fierce self-ownership, "make it into something"
- **Steve Jobs** — merciless simplification, asking "what really matters?", vision over convention, impatience with mediocrity

## Rejected

Option C — generic prompt won't produce the distinctive voice the user asked for.
Option B — unnecessary indirection for 9 entries.
