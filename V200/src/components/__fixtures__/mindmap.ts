// Story fixtures (T-023-03). One AreaDetail per life area, reused by the
// MindmapAreaCard stories (Folded / Unfolded / Gallery). Kept short — enough to
// exercise the folded summary counts and the unfolded milestone/action list.
// Only imported by `*.stories.tsx`, so it's tree-shaken out of the app build
// (same guarantee as __fixtures__/journal.ts).
import type { AreaId } from '@/lib/mindmap-areas'
import type { AreaDetail } from '@/components/mindmap/MindmapAreaCard'

export const AREA_DETAILS: Record<AreaId, AreaDetail> = {
  career: {
    description: 'Move from steady individual work toward leading a small team without losing the craft.',
    done: 3,
    total: 8,
    milestones: [
      { title: 'Ship the platform rewrite', actions: ['Finalize the migration plan', 'Cut over the first service'] },
      { title: 'Grow into a lead role', actions: ['Mentor one junior weekly', 'Run the next planning cycle'] },
      { title: 'Build a public portfolio', actions: ['Write up two case studies'] },
    ],
  },
  health: {
    description: 'Build steady energy and strength that carries through long weeks, not crash diets.',
    done: 5,
    total: 10,
    milestones: [
      { title: 'Lift three times a week', actions: ['Book the gym slots', 'Follow the 3-day split'] },
      { title: 'Sleep seven hours', actions: ['Fixed wind-down at 10:30', 'No screens in bed'] },
    ],
  },
  relationship: {
    description: 'Deepen the handful of bonds that matter and stop letting distance do the deciding.',
    done: 2,
    total: 6,
    milestones: [
      { title: 'Weekly call with family', actions: ['Sunday evening standing call'] },
      { title: 'See close friends monthly', actions: ['Plan one outing a month', 'Reply within a day'] },
    ],
  },
  personal: {
    description: 'Grow on purpose — know myself a little better and act on it instead of drifting.',
    done: 4,
    total: 9,
    milestones: [
      { title: 'Keep a reflection habit', actions: ['Journal three mornings a week'] },
      { title: 'Read outside my field', actions: ['One book a month', 'Notes after each chapter'] },
      { title: 'Learn to say no', actions: ['Decline one over-commitment'] },
    ],
  },
  finance: {
    description: 'Build the security and freedom that lets money serve the life I actually want.',
    done: 6,
    total: 7,
    milestones: [
      { title: 'Six-month safety net', actions: ['Automate the monthly transfer', 'Park it in a high-yield account'] },
      { title: 'Start investing steadily', actions: ['Set up a recurring index buy'] },
    ],
  },
}
