import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadFigures() {
  vi.resetModules();
  vi.stubEnv('EXPO_PUBLIC_API_URL', 'http://localhost:3000');
  vi.stubEnv('EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY', 'pk_test_abc');
  return import('@/lib/figures');
}

afterEach(() => vi.unstubAllEnvs());

describe('figures', () => {
  it('carries the same 15 ids, in web order', async () => {
    const { FIGURES } = await loadFigures();
    expect(FIGURES.map((f) => f.id)).toEqual([
      'socrates', 'a-lincoln', 'marilyn-monroe', 'maya-angelou', 'n-mandela',
      'rosa-parks', 'frida-kahlo', 'che-guevara', 'ching-shih', 'm-gandhi',
      'napoleon', 'salvador-dali', 'chuck-norris', 'm-ali', 'v-lenin',
    ]);
  });

  it('every figure has full metadata and no systemPrompt', async () => {
    const { FIGURES } = await loadFigures();
    for (const f of FIGURES) {
      expect(f.name).toBeTruthy();
      expect(f.descriptor).toBeTruthy();
      expect(f.era).toBeTruthy();
      expect(f.quote).toBeTruthy();
      expect(f.bio).toBeTruthy();
      expect('systemPrompt' in f).toBe(false);
    }
  });

  it('portraitUrl points at the backend public assets per mode', async () => {
    const { portraitUrl } = await loadFigures();
    expect(portraitUrl('socrates', 'kawaii')).toBe(
      'http://localhost:3000/portraits/kawaii/socrates.png',
    );
  });

  it('figureById resolves and misses safely', async () => {
    const { figureById } = await loadFigures();
    expect(figureById('m-ali')?.name).toBe('Muhammad Ali');
    expect(figureById('nobody')).toBeUndefined();
  });
});
