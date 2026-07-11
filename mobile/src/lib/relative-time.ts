// Compact relative time, e.g. "just now", "5m", "3h", "2d", "4mo", "1y".
// Verbatim port of V200/src/lib/relative-time.ts (LensCard share log).
export function relativeTime(iso: string, now: number = Date.now()): string {
  const t = new Date(iso).getTime();
  const diff = (now - t) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}d`;
  if (diff < 86400 * 365) return `${Math.floor(diff / (86400 * 30))}mo`;
  return `${Math.floor(diff / (86400 * 365))}y`;
}

/** "just now" stays as-is; everything else gets " ago" (web LensResponseCard). */
export function relativeTimeAgo(iso: string, now: number = Date.now()): string {
  const t = relativeTime(iso, now);
  return t === 'just now' ? t : `${t} ago`;
}
