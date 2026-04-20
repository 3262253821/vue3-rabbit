const WINDOW_MS = 60_000;
const MAX_REQUESTS = 12;

const bucket = new Map<string, number[]>();

export function checkRateLimit(key: string): {
  allowed: boolean;
  retryAfterSec: number;
} {
  const now = Date.now();
  const start = now - WINDOW_MS;
  const history = bucket.get(key) ?? [];
  const filtered = history.filter((t) => t >= start);

  if (filtered.length >= MAX_REQUESTS) {
    const oldest = filtered[0];
    const retryAfterMs = Math.max(1000, WINDOW_MS - (now - oldest));
    return {
      allowed: false,
      retryAfterSec: Math.ceil(retryAfterMs / 1000),
    };
  }

  filtered.push(now);
  bucket.set(key, filtered);

  return {
    allowed: true,
    retryAfterSec: 0,
  };
}
