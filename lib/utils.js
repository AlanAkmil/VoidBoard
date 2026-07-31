export function timeAgo(date) {
  if (!date) return "now";
  const d = Math.floor((Date.now() - date.getTime()) / 1000);
  if (d < 10) return "now";
  if (d < 60) return `${d}s`;
  if (d < 3600) return `${Math.floor(d / 60)}m`;
  if (d < 86400) return `${Math.floor(d / 3600)}h`;
  return `${Math.floor(d / 86400)}d`;
}

// Two-letter specimen tag used instead of the old random emoji avatar.
export function monogram(name) {
  if (!name) return "??";
  const parts = name.trim().split(/[\s_-]+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function toMillis(ts) {
  return ts?.toMillis?.() ?? 0;
}
export function toDate(ts) {
  return ts?.toDate?.() ?? null;
}
