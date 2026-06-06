// The five life areas (narrowed from seven). Shared by the create flow, the
// Browse overview, and the mind-map canvas so they can never drift apart.
export type AreaId = 'career' | 'health' | 'relationship' | 'personal' | 'finance'

export type Area = {
  id: AreaId
  label: string
  prompt: string
}

export const AREAS: Area[] = [
  {
    id: 'career',
    label: 'Career',
    prompt: 'Map out the direction, craft, and impact you want — and set it up for real progress.',
  },
  {
    id: 'health',
    label: 'Health & Fitness',
    prompt: 'Build the body, mind, and energy you want to carry through the rest of it.',
  },
  {
    id: 'relationship',
    label: 'Relationships',
    prompt: 'Deepen the bonds that matter — connect, repair, and show up for people.',
  },
  {
    id: 'personal',
    label: 'Personal Development',
    prompt: 'Get to know yourself a little better and grow on purpose, not by accident.',
  },
  {
    id: 'finance',
    label: 'Finance',
    prompt: 'Build security and freedom so money serves the life you want.',
  },
]

export const AREA_BY_ID: Record<AreaId, Area> = Object.fromEntries(
  AREAS.map(a => [a.id, a])
) as Record<AreaId, Area>
