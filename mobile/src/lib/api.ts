import { API_URL } from '@/lib/config';

/** JSON error from the backend (handlers return { error } with a 4xx/5xx status). */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(`API ${status}: ${JSON.stringify(body)}`);
    this.name = 'ApiError';
  }
}

export interface ApiFetchOptions {
  /** Clerk session token from useAuth().getToken(); sent as a Bearer header. */
  token?: string | null;
  method?: 'GET' | 'POST' | 'DELETE';
  body?: unknown;
}

/**
 * The only place the app talks to the backend. Calls the existing Next.js
 * /api routes; Clerk's middleware accepts the Bearer session token exactly
 * like the web's cookie, so no backend changes are needed.
 */
export async function apiFetch<T>(path: string, opts: ApiFetchOptions = {}): Promise<T> {
  const { token, method = 'GET', body } = opts;
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, json);
  return json as T;
}
