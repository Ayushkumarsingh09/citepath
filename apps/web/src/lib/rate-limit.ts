/** Simple in-memory sliding window rate limiter (per-process). Replace with Redis in multi-instance prod. */

type Bucket = { timestamps: number[] };

const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number): {
  ok: boolean;
  remaining: number;
  retryAfterMs: number;
} {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);
  if (bucket.timestamps.length >= limit) {
    buckets.set(key, bucket);
    const oldest = bucket.timestamps[0] ?? now;
    return { ok: false, remaining: 0, retryAfterMs: Math.max(0, windowMs - (now - oldest)) };
  }
  bucket.timestamps.push(now);
  buckets.set(key, bucket);
  return { ok: true, remaining: Math.max(0, limit - bucket.timestamps.length), retryAfterMs: 0 };
}

export function clientIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") || "unknown";
}

export function rateLimitResponse(retryAfterMs: number) {
  return Response.json(
    {
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests. Try again shortly.",
        details: { retryAfterMs },
      },
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil(retryAfterMs / 1000) || 1),
      },
    },
  );
}
