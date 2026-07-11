import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadMap() {
  vi.resetModules();
  vi.stubEnv('EXPO_PUBLIC_API_URL', 'http://localhost:3000');
  vi.stubEnv('EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY', 'pk_test_abc');
  return import('@/lib/journal-map');
}

afterEach(() => vi.unstubAllEnvs());

const API_SESSION = {
  id: 'sess-1',
  vent_text: 'I keep second-guessing my career choice and everything about it.',
  title: 'Reflecting on a career change',
  theme: 'cyberpunk',
  is_public: false,
  created_at: '2026-07-01T10:00:00Z',
  lens_responses: [
    {
      id: 'resp-1',
      figure_id: 'socrates',
      response_text: 'Question the doubt itself.',
      is_favorite: true,
      created_at: '2026-07-01T10:00:05Z',
      shares: [{ id: 'share-1', platform: 'instagram' as const, shared_at: '2026-07-02T09:00:00Z' }],
    },
    {
      id: 'resp-2',
      figure_id: 'm-ali',
      response_text: 'Float above it.',
      is_favorite: false,
      created_at: '2026-07-01T11:00:00Z',
      shares: [],
    },
  ],
};

describe('mapSession', () => {
  it('maps API rows into display types with resolved figure names', async () => {
    const { mapSession } = await loadMap();
    const e = mapSession(API_SESSION);
    expect(e.id).toBe('sess-1');
    expect(e.title).toBe('Reflecting on a career change');
    expect(e.isPublic).toBe(false);
    expect(e.lenses).toEqual([
      { figureId: 'socrates', figureName: 'Socrates', sharedTo: 'instagram' },
      { figureId: 'm-ali', figureName: 'Muhammad Ali', sharedTo: undefined },
    ]);
    expect(e.responses[0]).toMatchObject({
      id: 'resp-1',
      figureName: 'Socrates',
      isFavorite: true,
      shares: [{ id: 'share-1', platform: 'instagram', sharedAt: '2026-07-02T09:00:00Z' }],
    });
    expect(e.responses[0].quote).toContain('true wisdom');
  });

  it('falls back to first-6-words title when title is null/blank', async () => {
    const { mapSession } = await loadMap();
    expect(mapSession({ ...API_SESSION, title: null }).title).toBe(
      'I keep second-guessing my career choice',
    );
    expect(mapSession({ ...API_SESSION, title: '  ' }).title).toBe(
      'I keep second-guessing my career choice',
    );
  });

  it('unknown figure ids fall back to the raw id, never throw', async () => {
    const { mapSession } = await loadMap();
    const e = mapSession({
      ...API_SESSION,
      lens_responses: [{ ...API_SESSION.lens_responses[1], figure_id: 'ghost' }],
    });
    expect(e.lenses[0].figureName).toBe('ghost');
    expect(e.responses[0].quote).toBeUndefined();
  });
});
