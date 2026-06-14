// Compact relative time, e.g. "just now", "5m", "3h", "2d", "4mo", "1y".
// Shared by the journal feed (EntryCard collapsed meta) and LensCard share log.
export function relativeTime(iso: string): string {
  const t = new Date(iso).getTime()
  const diff = (Date.now() - t) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}d`
  if (diff < 86400 * 365) return `${Math.floor(diff / (86400 * 30))}mo`
  return `${Math.floor(diff / (86400 * 365))}y`
}
