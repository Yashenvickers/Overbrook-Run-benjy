import "server-only";

/**
 * Minimal in-memory rate limiter (per serverless instance). Good enough as a
 * first spam gate alongside honeypot + Turnstile; swap for a shared store
 * (e.g. Upstash) if abuse warrants it.
 */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit = 5, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (list.length >= limit) {
    hits.set(key, list);
    return false;
  }
  list.push(now);
  hits.set(key, list);
  // Opportunistic cleanup to keep the map bounded.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= windowMs)) hits.delete(k);
    }
  }
  return true;
}

export function clientKeyFromHeaders(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0].trim() : headers.get("x-real-ip")) || "anonymous";
}
