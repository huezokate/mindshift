# Design: T-001-03 category-nodes

## Problem Statement

Render 7 organic-shaped satellite nodes on the canvas, positioned in a clock-face layout around the central hub, each containing category label, header aspiration, and bullet goals.

---

## Options Considered

### Option A: CSS clip-path on HTML divs

Each node is a `<div>` in `#canvas-world`. The organic shape is applied via `clip-path: polygon(...)` or `clip-path: ellipse(...)` or `clip-path: path(...)`.

**Pros:**
- Pure HTML/CSS — no SVG defs required.
- Easy to style text inside (normal DOM flow).
- `clip-path: path()` supports arbitrary blobs (Chrome/Firefox support).

**Cons:**
- `clip-path: path()` has uneven browser support (Firefox pre-97, Safari pre-15.4 don't support it).
- Irregular blob shapes with `polygon()` require careful vertex tuning.
- No visible border on the shape — only a clipped fill region.

### Option B: SVG `<clipPath>` + `<foreignObject>` in `#canvas-svg`

Each node is a `<g>` in the SVG layer with a `<path>` + `<foreignObject>` containing HTML.

**Pros:**
- Full SVG shape flexibility.
- Can stroke the shape border natively.

**Cons:**
- `foreignObject` + HTML in SVG has significant cross-browser quirks (overflow, scrolling, click events).
- SVG layer is `pointer-events: none` — click handling requires extra work.
- Text sizing and wrapping is fragile inside `foreignObject`.
- Mixing HTML and SVG layout models is complex.

**Rejected** — fragile, overly complex for vanilla single-file app.

### Option C: HTML div with SVG `<clipPath>` in `#canvas-svg`, applied via CSS `clip-path: url(#id)`

Each node is a `<div>` in `#canvas-world`. A matching `<clipPath>` element with a scaled `<path>` is registered in `#canvas-svg`'s `<defs>`. The div references it via `clip-path: url(#career-clip)`.

**Pros:**
- Combines HTML's text rendering convenience with SVG's arbitrary path shapes.
- All browsers that support CSS clip-path support `url()` references.

**Cons:**
- Requires keeping SVG defs in sync with node divs.
- Clip-path doesn't give a visible border stroke — need a `<path>` stroke element in the SVG as a border overlay. More elements to manage.

**Partially viable**, but adds complexity for border rendering without clear advantage over Option A with `clip-path: path()`.

### Option D: HTML div with inline SVG background + CSS clip-path (CHOSEN)

Each node is a `<div>` in `#canvas-world` with:
- Background fill color.
- `clip-path` using `polygon()` or `ellipse()` for the shape.
- A thin `outline` or `box-shadow` replaced by an `<svg>` element overlaid as a sibling with `position:absolute`, `pointer-events:none`, which draws just the stroke path.

Actually, simplest viable approach: skip the visible stroke for now (the fill + drop-shadow reads as a distinct shape), and use CSS `clip-path: polygon()` / `ellipse()` for the 5 regular shapes. For the 2 blob shapes (Relationships, Travel), approximate with a multi-point polygon. Post-MVP: replace with `clip-path: path()` or SVG clipPath.

**Decision: Option D — HTML divs with CSS clip-path polygon/ellipse, no explicit stroke border, drop-shadow for depth.**

**Rationale:**
- Simplest to implement in vanilla single-file HTML.
- No SVG coordination needed for node shapes.
- Broad browser support (polygon/ellipse clip-path is universal).
- Text layout is straightforward DOM.
- Blob approximation with polygon is acceptable for a lo-fi mind map.

---

## Shape Definitions

Shapes are defined as CSS clip-path values. Each node div is sized to a bounding box; the clip-path is expressed as percentages so it scales with the div.

| Category | CSS clip-path |
|---|---|
| Career | `ellipse(50% 40% at 50% 50%)` |
| Creativity | `polygon(50% 0%, 100% 87%, 0% 87%)` (equilateral triangle) |
| Health & Wellness | `polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)` (diamond) |
| Relationships | `polygon(20% 0%, 80% 10%, 100% 60%, 60% 100%, 0% 80%)` (irregular blob) |
| Travel | `polygon(50% 0%, 100% 35%, 80% 100%, 20% 100%, 0% 35%)` (pentagon) |
| Finances | `inset(0 0 0 0 round 16px)` (rounded rect — use border-radius instead) |
| Living Situation | `inset(0 0 0 0 round 16px)` (tall rounded rect — taller aspect ratio) |

Note: Finances and Living Situation are rectangles with border-radius; clip-path isn't needed — just `border-radius` on the div.

---

## Node Positioning

World-coordinate positions (center of each node). Hub is at world origin (0, 0). Canvas is centered so the hub appears at screen center when navigated to.

Clock-face layout (approximate Figma lo-fi positions, in pixels at 1x):

| Category | World X | World Y | Clock position |
|---|---|---|---|
| Career | 0 | -260 | 12 o'clock |
| Creativity | 220 | -160 | 2 o'clock |
| Health & Wellness | 280 | 60 | 4 o'clock |
| Relationships | 160 | 260 | 5 o'clock |
| Travel | -160 | 260 | 7 o'clock |
| Finances | -280 | 60 | 8 o'clock |
| Living Situation | -220 | -160 | 10 o'clock |

Node divs are absolutely positioned in `#canvas-world`; `left` = worldX - nodeWidth/2, `top` = worldY - nodeHeight/2.

---

## Node Sizing

| Category | Width | Height |
|---|---|---|
| Career (ellipse) | 180px | 150px |
| Creativity (triangle) | 160px | 160px |
| Health & Wellness (diamond) | 160px | 160px |
| Relationships (blob) | 170px | 160px |
| Travel (pentagon) | 170px | 160px |
| Finances (rect) | 160px | 130px |
| Living Situation (tall rect) | 150px | 190px |

---

## Content Generation

Each category has hardcoded placeholder goals. The category matching `userData.area` additionally shows a user-goal line derived from `userData.future` (truncated to 60 chars).

Category colors follow a warm-to-cool palette matching the Figma lo-fi's varied pastel tones:

| Category | Background | Text |
|---|---|---|
| Career | #ffd6e0 | #7c2d52 |
| Creativity | #fde68a | #78350f |
| Health & Wellness | #bbf7d0 | #166534 |
| Relationships | #fecaca | #7f1d1d |
| Travel | #bfdbfe | #1e3a5f |
| Finances | #d1fae5 | #065f46 |
| Living Situation | #e0e7ff | #312e81 |

---

## Hover State

CSS transition on `.canvas-node`:
```css
transition: transform 0.15s ease, filter 0.15s ease;
```
On `:hover`:
```css
transform: scale(1.06);
filter: brightness(1.05) drop-shadow(0 4px 16px rgba(0,0,0,0.25));
```

---

## Canvas Centering on Entry

When `createMindMap()` transitions to page 3, we center the canvas on the hub (world origin). The viewport center is `(viewport.width/2, viewport.height/2)`. With hub at world (0,0), we set `CanvasTransform.x = viewport.width/2`, `CanvasTransform.y = viewport.height/2`. This is done in `createMindMap()` after the loading delay.

---

## Rejected Alternatives

- **SVG foreignObject** — fragile cross-browser, complex layout, rejected.
- **Canvas 2D (canvas element)** — would require re-implementing text layout; wrong tool for DOM-centric approach.
- **Dynamic position computation** — ticket explicitly says hardcoded world coordinates.
- **True organic SVG blobs** — deferred; polygon approximations are sufficient for lo-fi.
