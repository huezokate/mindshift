// Story fixtures (T-023-03) for MindmapAreaCard. The card is a folded notepad
// summary — it takes a `body` blurb plus milestone/action *counts* — so each life
// area maps to that shape. Only imported by `*.stories.tsx`, so it's tree-shaken
// out of the app build (same guarantee as __fixtures__/journal.ts).
import type { AreaId } from '@/lib/mindmap-areas'

export type AreaSummary = { body: string; milestones: number; actions: number }

export const AREA_SUMMARIES: Record<AreaId, AreaSummary> = {
  career: {
    body: 'Move from steady individual work toward leading a small team without losing the craft.',
    milestones: 3,
    actions: 8,
  },
  health: {
    body: 'Build steady energy and strength that carries through long weeks, not crash diets.',
    milestones: 2,
    actions: 10,
  },
  relationship: {
    body: 'Deepen the handful of bonds that matter and stop letting distance do the deciding.',
    milestones: 2,
    actions: 6,
  },
  personal: {
    body: 'Grow on purpose — know myself a little better and act on it instead of drifting.',
    milestones: 3,
    actions: 9,
  },
  finance: {
    body: 'Build the security and freedom that lets money serve the life I actually want.',
    milestones: 2,
    actions: 7,
  },
}
