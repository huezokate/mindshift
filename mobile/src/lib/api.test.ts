import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const API_URL = 'http://localhost:3000';

async function loadApi() {
  vi.resetModules();
  vi.stubEnv('EXPO_PUBLIC_API_URL', API_URL);
  vi.stubEnv('EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY', 'pk_test_abc');
  return import('@/lib/api');
}

function mockFetch(status: number, json: unknown) {
  const fn = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(json),
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

beforeEach(() => vi.restoreAllMocks());
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('apiFetch', () => {
  it('GETs API_URL + path and returns parsed JSON', async () => {
    const { apiFetch } = await loadApi();
    const fetchMock = mockFetch(200, { entries: 2, lenses: 5 });

    const result = await apiFetch('/api/journal-v2/counts');

    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/api/journal-v2/counts`, {
      method: 'GET',
      headers: {},
      body: undefined,
    });
    expect(result).toEqual({ entries: 2, lenses: 5 });
  });

  it('sends the Clerk session token as a Bearer header', async () => {
    const { apiFetch } = await loadApi();
    const fetchMock = mockFetch(200, {});

    await apiFetch('/api/journal-v2/counts', { token: 'sess_token' });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBe('Bearer sess_token');
  });

  it('omits the Authorization header when token is null (anon calls)', async () => {
    const { apiFetch } = await loadApi();
    const fetchMock = mockFetch(200, {});

    await apiFetch('/api/generate-response', { token: null, method: 'POST', body: { prompt: 'x' } });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBeUndefined();
  });

  it('JSON-encodes the body and sets Content-Type', async () => {
    const { apiFetch } = await loadApi();
    const fetchMock = mockFetch(200, {});

    await apiFetch('/api/save-response', {
      method: 'POST',
      body: { figureId: 'socrates' },
      token: 't',
    });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(init.body).toBe('{"figureId":"socrates"}');
  });

  it('throws ApiError carrying status and body on non-2xx', async () => {
    const { apiFetch, ApiError } = await loadApi();
    mockFetch(401, { error: 'Unauthorized' });

    const err = await apiFetch('/api/journal-v2/counts').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    const apiErr = err as InstanceType<typeof ApiError>;
    expect(apiErr.status).toBe(401);
    expect(apiErr.body).toEqual({ error: 'Unauthorized' });
  });

  it('survives a non-JSON error response (body becomes null)', async () => {
    const { apiFetch, ApiError } = await loadApi();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: () => Promise.reject(new Error('not json')),
      }),
    );

    const err = await apiFetch('/api/journal-v2/counts').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    const apiErr = err as InstanceType<typeof ApiError>;
    expect(apiErr.status).toBe(502);
    expect(apiErr.body).toBeNull();
  });
});
