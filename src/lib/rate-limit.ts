const WINDOW_MS = 15 * 60 * 1000;

const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, max: number) {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { limited: false, remaining: max - 1 };
  }

  entry.count += 1;
  if (entry.count > max) {
    return { limited: true, remaining: 0 };
  }
  return { limited: false, remaining: max - entry.count };
}

export function clientIp(headers: Headers) {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
