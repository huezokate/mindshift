# T-007-01 Plan: Implementation Sequence

## Step 1 — Validate Figma Target Node
- Confirm node 270-1181 exists and is writable
- Check current contents so we know what to replace/extend
- Tool: get_metadata or get_design_context on target node

## Step 2 — Load figma-generate-design skill
- Required for multi-screen layout push via generate_figma_design
- Discover existing design tokens/variables in the file

## Step 3 — Push Screen 1 (Landing)
- Apply updated copy from structure.md
- Cyberpunk style: dark bg, neon cyan/magenta accents
- Validate with get_screenshot

## Step 4 — Push Screen 2 (Lens Selection)
- Apply updated section header copy
- 3-column grid of 15 figure cards (names unchanged)
- Validate with get_screenshot

## Step 5 — Push Screen 3 (Popup Overlay)
- Apply updated CTA copy
- Centered card with figure image, quote, bio
- Validate

## Step 6 — Push Screen 4 (Response)
- Apply updated action row and footer copy
- Validate action button sizing

## Step 7 — Push Screen 5 (Create Account)
- Apply updated headline, sub-headline, field labels/placeholders
- Updated social auth section
- Updated subscription card

## Step 8 — Push Screen 6 (Journal)
- Apply updated welcome card and footer copy
- Validate entry card layout

## Step 9 — Final Review
- get_screenshot on full node 270-1181
- Verify all 6 screens are present and legible
- Update ticket status to done

## Verification Criteria
- All text nodes match structure.md spec
- No placeholder copy ("lorem ipsum", "Type it all out right here!") remaining
- Cyberpunk visual style consistent across screens
- CTA hierarchy clear (primary vs secondary visually distinct)
