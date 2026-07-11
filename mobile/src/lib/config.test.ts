import { afterEach, describe, expect, it, vi } from 'vitest';

// config.ts reads process.env at module load, so each test stubs env and
// re-imports a fresh module instance.
async function loadConfig() {
  vi.resetModules();
  return import('@/lib/config');
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('config', () => {
  it('exposes API_URL and CLERK_PUBLISHABLE_KEY from env', async () => {
    vi.stubEnv('EXPO_PUBLIC_API_URL', 'http://localhost:3000');
    vi.stubEnv('EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY', 'pk_test_abc');
    const config = await loadConfig();
    expect(config.API_URL).toBe('http://localhost:3000');
    expect(config.CLERK_PUBLISHABLE_KEY).toBe('pk_test_abc');
  });

  it('strips a trailing slash from API_URL', async () => {
    vi.stubEnv('EXPO_PUBLIC_API_URL', 'https://app.minds-shift.com/');
    vi.stubEnv('EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY', 'pk_test_abc');
    const config = await loadConfig();
    expect(config.API_URL).toBe('https://app.minds-shift.com');
  });

  it('throws a clear error naming the missing var', async () => {
    vi.stubEnv('EXPO_PUBLIC_API_URL', '');
    vi.stubEnv('EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY', 'pk_test_abc');
    await expect(loadConfig()).rejects.toThrow('EXPO_PUBLIC_API_URL');
  });
});
