# T-006-02 Design: Figma Lofi Fidelity Strategy

## Approach

Since Figma authentication is pending, this design document establishes the protocol for how to use the lofi screens once access is confirmed, and documents decisions based on available information.

## Lofi as Authority: Core Principle

The lofi screens at node 270-1180 are **layout authority** — not visual reference. This means:
- Information hierarchy from lofi = binding (what information appears, in what order)
- Spacing rhythm from lofi = binding (if the lofi shows generous padding between sections, we preserve that)
- Visual treatment from lofi = non-binding (flat boxes in lofi become cyberpunk-styled in hi-fi)

This principle prevents "drift" where hi-fi screens look polished but lose the UX insight embedded in the lofi.

## Figma Access Protocol (once authenticated)

### Step 1: Page inventory
```js
// List all pages to understand file structure
figma.root.children.map(p => `${p.name} id=${p.id}`)
```

### Step 2: Navigate to lofi section
- Target node: 270-1180
- Switch to that page if needed
- Screenshot the lofi screens for reference

### Step 3: Component extraction
For each lofi screen frame:
- Get bounding box dimensions → confirms intended proportions
- List child nodes → maps to HTML component tree
- Extract text content → confirms labels, copy, placeholder text
- Extract spacing values → confirms 8px grid assumption

### Step 4: Design system discovery
```js
// Check for existing variables/styles in the Figma file
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const styles = await figma.getLocalTextStylesAsync();
```

## Decisions Made Pre-Figma-Access

### Screen proportions
- Confirmed: mobile-first, 390px (iPhone 14 Pro width) not 430px
- Action: update CSS from `max-width: 430px` to `max-width: 390px` for mobile
- The 430px was a legacy choice from earlier HTML — lofi likely targets standard 390px

### Component translation table
| Lofi element | Hi-fi component | Notes |
|---|---|---|
| Flat rectangle inputs | Labeled textarea (current) | Keep label-on-top pattern |
| Simple button | CTA btn with glow + press animation | Already styled |
| Circle portraits | Glow-border portrait circles | Already styled |
| Flat cards | bg-2 cards with border | Already styled |
| Organic blob nodes | CSS clip-path or inline SVG | New — needs T-006-04 |
| Curved arrows | SVG polyline/path | Already in mindmap HTML |

### Spacing audit (to confirm with Figma)
Working assumption: 8px base grid
- Spacing-1: 8px (tight internal)
- Spacing-2: 16px (standard padding)
- Spacing-3: 20px (section padding)
- Spacing-4: 28px (section gaps)
- Spacing-6: 40px (desktop content padding)

### Type scale audit (to confirm with Figma)
The lofi likely uses a simpler type scale than the current HTML which has many one-off sizes. Recommend consolidating to 6 steps (see T-006-04).

## What to Build in Figma (T-006-06)

Once lofi is analyzed, T-006-06 builds these screens at two widths:
- Mobile: 390px (Figma iPhone 14 Pro frame)
- Desktop: 1280px (Figma Desktop frame)

Screen order:
1. Question / Onboarding
2. Figures / Lens Picker
3. AI Response / Terminal
4. Goals Input (least documented — needs most Figma reference)
5. Mindmap Canvas

Each screen needs:
- Full-fidelity layout matching lofi hierarchy
- Cyberpunk + kawaii aesthetic layer
- Annotated engagement moments (where kawaii/notepad appear)
- WCAG contrast ratio annotations for key color pairs
