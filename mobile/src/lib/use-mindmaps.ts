import { useCallback, useEffect, useState } from 'react';

import type { AreaId } from '@/components/mindmap/area-icon-paths';
import { useApi } from '@/lib/use-api';

/** Shapes returned by GET /api/mindmap/maps (V200/src/lib/mindmap.ts). */
export type SavedMilestone = {
  id: string;
  headline: string | null;
  outcome: string;
  firstAction: string | null;
  ifThen: string | null;
  month: number | null;
  position: number;
  status: string; // 'pending' | 'done'
};

export type SavedGoal = {
  id: string;
  category: AreaId;
  outcome: string;
  obstacle: string | null;
  identity: string | null;
  position: number;
  milestones: SavedMilestone[];
};

export type SavedMap = {
  id: string;
  title: string | null;
  horizonLabel: string;
  horizonDate: string | null;
  theme: string;
  status: string;
  createdAt: string;
  goals: SavedGoal[];
};

/**
 * Saved mind maps for the landing + browse screens. `maps === null` while
 * loading (avoids a first-paint flash of the wrong state, web parity); any
 * error falls back to [] so the create CTA still shows. Anon never fetches
 * (the endpoint is sign-in only).
 */
export function useMindmaps(): { maps: SavedMap[] | null; reload: () => void } {
  const { api, isSignedIn } = useApi();
  const [maps, setMaps] = useState<SavedMap[] | null>(isSignedIn ? null : []);
  const [nonce, setNonce] = useState(0);

  // Reset to the loading/anon state during render (not in the effect) when the
  // auth state or reload nonce changes.
  const key = `${isSignedIn}:${nonce}`;
  const [prevKey, setPrevKey] = useState(key);
  if (key !== prevKey) {
    setPrevKey(key);
    setMaps(isSignedIn ? null : []);
  }

  useEffect(() => {
    if (!isSignedIn) return;
    let active = true;
    api<{ maps: SavedMap[] }>('/api/mindmap/maps')
      .then((d) => active && setMaps(d.maps ?? []))
      .catch(() => active && setMaps([]));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { maps, reload };
}
