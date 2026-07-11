import type { SharePlatform } from './social-svgs';

/**
 * RN-side lightweight shapes for the journal cards. The web types
 * (V200/src/lib/journal-types.ts) are page/API-coupled (snake_case rows,
 * FIGURES lookups); these carry the already-resolved display data instead —
 * screens (T-030-04) map API rows into them.
 */

export interface ShareRecord {
  id: string;
  platform: SharePlatform;
  sharedAt: string; // ISO
}

export interface LensResponseLite {
  figureId: string;
  figureName: string;
  /** The figure's signature quote (cyberpunk/kawaii render it; notepad omits). */
  quote?: string;
  responseText: string;
  shares?: ShareRecord[];
}

export interface EntryLensLite {
  figureId: string;
  figureName: string;
  /** First platform this lens was shared to → footer badge; none = no badge. */
  sharedTo?: SharePlatform;
}

export interface JournalEntryLite {
  id: string;
  /** Gemini "<synonym> on <topic>" title; falls back to the vent's first words. */
  title: string;
  ventText: string;
  createdAt: string; // ISO
  isPublic: boolean;
  lenses: EntryLensLite[];
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/** "2 JUN 2026"-style label (web JournalPreviewCard, Figma 604:7285). */
export function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
