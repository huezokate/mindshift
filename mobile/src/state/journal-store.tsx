import { useAuth } from '@clerk/clerk-expo';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { ApiError } from '@/lib/api';
import { figureById } from '@/lib/figures';
import { mapLensResponse, mapSession, type ApiSession, type JournalEntryFull } from '@/lib/journal-map';
import { useApi } from '@/lib/use-api';

export type JournalFilter = 'all' | 'favorites';

const PAGE_SIZE = 10; // web parity (journal-v2 page)

/**
 * Client cache for the journal — the RN stand-in for the web's server-rendered
 * first page + per-screen fetches. Doubles as the entry-detail data source:
 * there is NO single-entry GET endpoint (the web reads Supabase in a server
 * component), so the detail screen reads this cache and cold deep links page
 * through /entries until the id shows up.
 */
type JournalStoreValue = {
  entries: JournalEntryFull[];
  hasMore: boolean;
  filter: JournalFilter;
  loading: boolean;
  counts: { entries: number; lenses: number };
  /** Load the next page (or the first, after reset/filter change). */
  fetchPage: () => Promise<void>;
  setFilter: (f: JournalFilter) => void;
  /** Reload page 0 + counts (pull-to-refresh). */
  refresh: () => Promise<void>;
  refreshCounts: () => Promise<void>;
  /** Cache lookup — undefined on miss (use fetchEntry for the fallback). */
  getEntry: (id: string) => JournalEntryFull | undefined;
  /** Cache-or-page-through lookup for cold deep links. Null if not found. */
  fetchEntry: (id: string) => Promise<JournalEntryFull | null>;
  /** Generate + save a new lens on an existing entry; optimistic upsert.
      Throws Error with a user-facing message (limit / generation / save). */
  applyLensToEntry: (entryId: string, figureId: string, theme: string) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  toggleFavorite: (entryId: string, responseId: string, next: boolean) => Promise<void>;
  seedDemo: () => Promise<void>;
};

const JournalStoreContext = createContext<JournalStoreValue | null>(null);

export function JournalStoreProvider({ children }: { children: ReactNode }) {
  const { api, isSignedIn } = useApi();
  const { userId } = useAuth();

  const [entries, setEntries] = useState<JournalEntryFull[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilterState] = useState<JournalFilter>('all');
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({ entries: 0, lenses: 0 });
  // Concurrency guard (web loadingRef parity). The paging offset is derived
  // from entries.length (each page appends exactly what the server returned).
  const busyRef = useRef(false);

  // Fresh account (or sign-out) → drop the previous user's cache. Render-time
  // state sync (not an effect) so stale entries never paint.
  const [prevUserId, setPrevUserId] = useState(userId);
  if (userId !== prevUserId) {
    setPrevUserId(userId);
    setEntries([]);
    setHasMore(true);
    setFilterState('all');
    setCounts({ entries: 0, lenses: 0 });
  }

  const loadPage = useCallback(
    async (reset: boolean, f: JournalFilter) => {
      if (busyRef.current || !isSignedIn) return;
      busyRef.current = true;
      setLoading(true);
      try {
        const offset = reset ? 0 : entries.length;
        const data = await api<{ sessions: ApiSession[]; hasMore: boolean }>(
          `/api/journal-v2/entries?offset=${offset}&limit=${PAGE_SIZE}&filter=${f}`,
        );
        const mapped = data.sessions.map(mapSession);
        setEntries((cur) => (reset ? mapped : [...cur, ...mapped]));
        setHasMore(data.hasMore);
      } finally {
        busyRef.current = false;
        setLoading(false);
      }
    },
    [api, isSignedIn, entries.length],
  );

  const fetchPage = useCallback(() => loadPage(false, filter), [loadPage, filter]);

  const setFilter = useCallback(
    (f: JournalFilter) => {
      setFilterState(f);
      setEntries([]);
      setHasMore(true);
      void loadPage(true, f);
    },
    [loadPage],
  );

  const refreshCounts = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      setCounts(await api<{ entries: number; lenses: number }>('/api/journal-v2/counts'));
    } catch {
      // counts are decorative — never block the screen on them
    }
  }, [api, isSignedIn]);

  const refresh = useCallback(async () => {
    await Promise.all([loadPage(true, filter), refreshCounts()]);
  }, [loadPage, filter, refreshCounts]);

  const getEntry = useCallback(
    (id: string) => entries.find((e) => e.id === id),
    [entries],
  );

  const fetchEntry = useCallback(
    async (id: string): Promise<JournalEntryFull | null> => {
      const cached = entries.find((e) => e.id === id);
      if (cached) return cached;
      // Cold deep link: page through until found (journals are small; the
      // miss path is rare until push notifications land in T-030-05).
      let offset = 0;
      for (let page = 0; page < 20; page++) {
        const data = await api<{ sessions: ApiSession[]; hasMore: boolean }>(
          `/api/journal-v2/entries?offset=${offset}&limit=50&filter=all`,
        );
        const hit = data.sessions.find((s) => s.id === id);
        if (hit) return mapSession(hit);
        if (!data.hasMore) return null;
        offset += data.sessions.length;
      }
      return null;
    },
    [api, entries],
  );

  const applyLensToEntry = useCallback(
    async (entryId: string, figureId: string, theme: string) => {
      const entry = entries.find((e) => e.id === entryId);
      if (!entry) throw new Error('Entry not found.');
      const figure = figureById(figureId);
      if (!figure) throw new Error('Unknown lens.');

      // Port of V200/src/lib/add-lens.ts: generate (isNewQuote:false — counts
      // against the per-vent lens limit, not a new daily quote), then save.
      let text: string;
      try {
        const gen = await api<{ response: string }>('/api/generate-response', {
          method: 'POST',
          body: { prompt: entry.ventText, figureId, isNewQuote: false },
        });
        text = (gen.response ?? '').trim();
      } catch (e) {
        if (e instanceof ApiError && e.status === 429) {
          const body = e.body as { limitType?: string } | null;
          throw new Error(
            body?.limitType === 'lenses'
              ? 'Lens limit reached for this entry.'
              : 'Daily limit reached.',
          );
        }
        const body = e instanceof ApiError ? (e.body as { error?: string } | null) : null;
        throw new Error(body?.error ?? 'The lens could not respond right now.');
      }
      if (!text) throw new Error('The lens came back empty. Please try again.');

      let responseId: string;
      try {
        const save = await api<{ sessionId: string; responseId: string }>('/api/save-response', {
          method: 'POST',
          body: { sessionId: entryId, ventText: entry.ventText, figureId, responseText: text, theme },
        });
        responseId = save.responseId;
      } catch {
        throw new Error('Saved the lens but the journal failed to update.');
      }

      const newLens = mapLensResponse({
        id: responseId,
        figure_id: figureId,
        response_text: text,
        is_favorite: false,
        created_at: new Date().toISOString(),
        shares: [],
      });
      setEntries((cur) =>
        cur.map((e) => {
          if (e.id !== entryId) return e;
          // Optimistic upsert: drop a prior same-figure lens (server upserts
          // on (session, figure)), then append.
          const responses = [...e.responses.filter((r) => r.figureId !== figureId), newLens];
          return {
            ...e,
            responses,
            lenses: responses.map((r) => ({
              figureId: r.figureId,
              figureName: r.figureName,
              sharedTo: r.shares?.[0]?.platform,
            })),
          };
        }),
      );
      void refreshCounts();
    },
    [api, entries, refreshCounts],
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      await api(`/api/journal-v2/entries/${id}`, { method: 'DELETE' });
      setEntries((cur) => cur.filter((e) => e.id !== id));
      void refreshCounts();
    },
    [api, refreshCounts],
  );

  const toggleFavorite = useCallback(
    async (entryId: string, responseId: string, next: boolean) => {
      // Optimistic; revert on failure.
      const apply = (value: boolean) =>
        setEntries((cur) =>
          cur.map((e) =>
            e.id === entryId
              ? {
                  ...e,
                  responses: e.responses.map((r) =>
                    r.id === responseId ? { ...r, isFavorite: value } : r,
                  ),
                }
              : e,
          ),
        );
      apply(next);
      try {
        await api(`/api/journal-v2/responses/${responseId}/favorite`, {
          method: 'POST',
          body: { is_favorite: next },
        });
      } catch (e) {
        apply(!next);
        throw e;
      }
    },
    [api],
  );

  const seedDemo = useCallback(async () => {
    await api('/api/journal-v2/seed', { method: 'POST' });
    await refresh();
  }, [api, refresh]);

  const value = useMemo(
    () => ({
      entries,
      hasMore,
      filter,
      loading,
      counts,
      fetchPage,
      setFilter,
      refresh,
      refreshCounts,
      getEntry,
      fetchEntry,
      applyLensToEntry,
      deleteEntry,
      toggleFavorite,
      seedDemo,
    }),
    [
      entries,
      hasMore,
      filter,
      loading,
      counts,
      fetchPage,
      setFilter,
      refresh,
      refreshCounts,
      getEntry,
      fetchEntry,
      applyLensToEntry,
      deleteEntry,
      toggleFavorite,
      seedDemo,
    ],
  );

  return <JournalStoreContext.Provider value={value}>{children}</JournalStoreContext.Provider>;
}

export function useJournalStore(): JournalStoreValue {
  const ctx = useContext(JournalStoreContext);
  if (!ctx) throw new Error('useJournalStore must be used inside JournalStoreProvider');
  return ctx;
}
