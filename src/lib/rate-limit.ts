/**
 * Simple in-memory token bucket. Fine for a single Node process / local
 * and small Vercel instances. Swap for Redis (see docs/backend-overhaul.md)
 * when running multiple replicas.
 */

type Bucket = { tokens: number; updatedAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSec: number };

export function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key) || { tokens: opts.limit, updatedAt: now };
  const elapsed = now - bucket.updatedAt;
  const refill = (elapsed / opts.windowMs) * opts.limit;
  bucket.tokens = Math.min(opts.limit, bucket.tokens + refill);
  bucket.updatedAt = now;

  if (bucket.tokens < 1) {
    buckets.set(key, bucket);
    const retryAfterSec = Math.ceil(((1 - bucket.tokens) / opts.limit) * opts.windowMs / 1000);
    return { ok: false, retryAfterSec: Math.max(1, retryAfterSec) };
  }

  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return { ok: true };
}

export function clientKey(req: Request, prefix: string): string {
  const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = fwd || req.headers.get("x-real-ip") || "local";
  return `${prefix}:${ip}`;
}
