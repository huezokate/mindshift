// Shared mindmap types — imported by both the create flow (`/app/mindmap/*`)
// and the API routes (`/api/mindmap/*`) so the two can never drift apart, the
// same way `mindmap-areas.ts` shares the five life areas.

import type { AreaId } from './mindmap-areas'

// The WOOP answers captured per selected area in the create flow.
export type WoopData = {
  outcome: string
  obstacle: string
  identity: string
}

// One milestone candidate — the shape returned by gen1 (generate-candidates)
// and rendered on the curate screen. `id` is assigned server-side so the
// frontend's selectedIds set stays stable.
export type Candidate = {
  id: string
  headline: string // identity statement — "Become someone who …"
  outcome: string // measurable target, horizon-scaled
  firstAction: string // tiny <3-min first step
  ifThen: string // implementation intention — "If <cue>, then I <action>."
}

// A candidate after gen2 (sequence-timeline) has placed it on the plan.
// `month` is a 1-based month index within the horizon.
export type SequencedMilestone = Candidate & {
  month: number
}

// Request body for POST /api/mindmap/generate-candidates (gen1).
export type GenerateCandidatesRequest = {
  category: AreaId
  horizonLabel: string // 'A month' | 'A quarter' | 'A year' | '5 years' | a custom date label
  horizonMonths: number // 1 | 3 | 12 | 60 | monthsUntil(customDate)
  woop: WoopData
  count?: number // omit for primary (→12 to curate); supporting areas pass ~3
}

// Request body for POST /api/mindmap/sequence-timeline (gen2).
export type SequenceTimelineRequest = {
  category: AreaId
  horizonLabel: string
  horizonMonths: number
  picked: Candidate[] // the candidates the user kept on the curate screen
}

// ── Save / read (POST + GET /api/mindmap/maps) ──────────────────────────────

// One area's goal as the create flow hands it to save: the WOOP answers plus
// the sequenced milestones the user kept for that area.
export type SaveMapGoal = {
  category: AreaId
  woop: WoopData
  milestones: SequencedMilestone[]
}

export type SaveMapRequest = {
  horizonLabel: string
  horizonDate?: string | null // ISO date, only for a custom horizon
  theme?: string // 'notepad' for v1
  title?: string | null // optional; derived server-side if omitted
  goals: SaveMapGoal[]
}

// The tree shape GET returns (camelCased from the DB rows).
export type SavedMilestone = {
  id: string
  headline: string | null
  outcome: string
  firstAction: string | null
  ifThen: string | null
  month: number | null
  position: number
  status: string // 'pending' | 'done'
}

export type SavedGoal = {
  id: string
  category: AreaId
  outcome: string
  obstacle: string | null
  identity: string | null
  position: number
  milestones: SavedMilestone[]
}

export type SavedMap = {
  id: string
  title: string | null
  horizonLabel: string
  horizonDate: string | null
  theme: string
  status: string
  createdAt: string
  goals: SavedGoal[]
}
