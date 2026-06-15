export type SharePlatform =
  | 'instagram'
  | 'tiktok'
  | 'facebook'
  | 'link'
  | 'native'
  | 'download'

export type LensShare = {
  id: string
  platform: SharePlatform
  shared_at: string
}

export type LensResponseV2 = {
  id: string
  figure_id: string
  response_text: string
  is_favorite: boolean
  created_at: string
  shares: LensShare[]
}

export type JournalEntry = {
  id: string
  vent_text: string
  // Gemini-generated "<synonym> on <topic>" header; null on rows created before
  // T-018-07 or when generation fell back — render derives one from vent_text.
  title?: string | null
  theme: string
  is_public: boolean
  created_at: string
  lens_responses: LensResponseV2[]
}

export type JournalFilter = 'all' | 'favorites'
