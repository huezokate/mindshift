export type Theme = 'cyberpunk' | 'kawaii' | 'notepad'

export type Category = 'career' | 'creativity' | 'health' | 'relationships' | 'travel' | 'finances' | 'living'

export interface VisionEntry {
  id: string
  userId: string
  prompt: string
  goals: Record<Category, string[]>
  createdAt: string
}

export interface Figure {
  id: string
  name: string
  era: string
  descriptor: string
  systemPrompt: string
  portraits: Record<Theme, string>
}

export interface MapNode {
  id: string
  category: Category
  goals: string[]
  x: number
  y: number
}

export interface Profile {
  clerk_user_id: string
  is_pro: boolean
  theme: Theme
  created_at: string
}
