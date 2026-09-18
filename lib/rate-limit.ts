/**
 * Minimal in-memory, per-IP fixed-window rate limiter.
 *
 * Audit finding #1: POST /api/leads was an unauthenticated, unthrottled public write.
 *
 * TWO TIERS, deliberately:
 *   - "burst"  — generous, counts every request. Stops someone hammering the endpoint.
 *   - "submit" — tight, counted only once a payload has passed validation, so it caps
 *                the rows that can actually reach the database.
 *
 * The split matters: a single-tier limiter that counts validation failures would lock a
 * real customer out for ten minutes after a few mistyped phone numbers. On a lead form,
 * turning away a genuine customer costs more than the spam row it prevents.
 *
 * SCOPE NOTE: this is per-instance memory. Right-sized for a POC and a single-region
 * deployment; it does not survive a restart or coordinate across serverless instances.
 * Before this carries real ad spend, swap the store for Upstash Redis / Vercel KV — the
 * signature below is shaped so that is a one-file change.
 */

type Window = { count: number; resetAt: number };

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

export const TIERS = {
  /** Any request, valid or not. */
  burst: 40,
  /** Requests that passed validation and are about to be written. */
  submit: 5,
  /** Admin sign-in attempts. Password guessing is the only real attack on a single
   *  shared password, so this is the primary defence for /admin. */
  login: 8,
} as const;

const buckets = new Map<string, Window>();

/** Opportunistic cleanup so the map cannot grow without bound. */
function sweep(now: number) {
  if (buckets.size < 5000) return;
  for (const [key, win] of buckets) if (win.resetAt <= now) buckets.delete(key);
}

export function rateLimit(ip: string, tier: keyof typeof TIERS): { ok: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  sweep(now);

  const key = `${tier}:${ip}`;
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  if (existing.count > TIERS[tier]) {
    return { ok: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfterSeconds: 0 };
}

/** Best-effort client IP from proxy headers. Vercel sets x-forwarded-for. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
