import type {
  EntryLensLite,
  JournalEntryLite,
  LensResponseLite,
  ShareRecord,
} from '@/components/journal/journal-types';
import type { SharePlatform } from '@/components/journal/social-svgs';
import { figureById } from '@/lib/figures';

/**
 * The ONLY place the /api/journal-v2 JSON shapes are known. Maps snake_case
 * API rows into the RN display types (journal-types.ts).
 */

/** Row shape returned by GET /api/journal-v2/entries (and mirrored on save). */
export interface ApiLensShare {
  id: string;
  platform: SharePlatform;
  shared_at: string;
}

export interface ApiLensResponse {
  id: string;
  figure_id: string;
  response_text: string;
  is_favorite: boolean;
  created_at: string;
  shares: ApiLensShare[];
}

export interface ApiSession {
  id: string;
  vent_text: string;
  title: string | null;
  theme: string;
  is_public: boolean;
  created_at: string;
  lens_responses: ApiLensResponse[];
}

/** Full lens data for the detail screen (LensCard + favorite/share actions). */
export interface LensResponseFull extends LensResponseLite {
  id: string;
  isFavorite: boolean;
  createdAt: string;
}

/** List-card shape + the full per-lens rows the detail screen needs. */
export interface JournalEntryFull extends JournalEntryLite {
  theme: string;
  responses: LensResponseFull[];
}

// Deterministic first-words fallback, verbatim from V200/src/lib/title.ts
// (rows predating the title column, or Gemini unavailable at save time).
export function deriveTitleFallback(ventText: string): string {
  return ventText.split(/\s+/).filter(Boolean).slice(0, 6).join(' ');
}

function mapShare(s: ApiLensShare): ShareRecord {
  return { id: s.id, platform: s.platform, sharedAt: s.shared_at };
}

function figureName(figureId: string): string {
  return figureById(figureId)?.name ?? figureId;
}

export function mapLensResponse(r: ApiLensResponse): LensResponseFull {
  return {
    id: r.id,
    figureId: r.figure_id,
    figureName: figureName(r.figure_id),
    quote: figureById(r.figure_id)?.quote,
    responseText: r.response_text,
    isFavorite: r.is_favorite,
    createdAt: r.created_at,
    shares: r.shares?.map(mapShare) ?? [],
  };
}

function mapEntryLens(r: ApiLensResponse): EntryLensLite {
  return {
    figureId: r.figure_id,
    figureName: figureName(r.figure_id),
    sharedTo: r.shares?.[0]?.platform,
  };
}

export function mapSession(s: ApiSession): JournalEntryFull {
  return {
    id: s.id,
    title: s.title?.trim() ? s.title : deriveTitleFallback(s.vent_text),
    ventText: s.vent_text,
    createdAt: s.created_at,
    isPublic: s.is_public,
    theme: s.theme,
    lenses: s.lens_responses.map(mapEntryLens),
    responses: s.lens_responses.map(mapLensResponse),
  };
}
