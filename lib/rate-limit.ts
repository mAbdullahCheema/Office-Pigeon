import 'server-only';

import { withRedis } from './redis';

/**
 * Fixed-window rate limiting.
 *
 * Redis holds the counters so every instance shares one budget; when Redis is
 * unavailable the same window is counted in-process instead. The in-process
 * path is deliberately not "fail open": a single instance still gets a real
 * limit, it just cannot see its siblings' traffic.
 */

export type RateLimitRule = {
  /** Requests allowed inside the window. */
  limit: number;
  /** Window length in seconds. */
  window: number;
};

export type RateLimitResult = {
  ok: boolean;
  limit: number;
  remaining: number;
  /** Unix seconds when the current window ends. */
  reset: number;
  retryAfter: number;
};

/**
 * Named budgets. Anonymous write endpoints are tight because each one costs a
 * database write; read and chat endpoints are looser because a real session
 * legitimately calls them in bursts.
 */
export const RULES = {
  order: { limit: 5, window: 600 },
  lead: { limit: 10, window: 600 },
  contact: { limit: 5, window: 600 },
  booking: { limit: 5, window: 600 },
  subscribe: { limit: 5, window: 3600 },
  chat: { limit: 40, window: 300 },
  /**
   * A day's worth of Pip. The burst rule above stops a script; this one stops a
   * signed-in account from quietly spending a month of model budget in an
   * afternoon.
   */
  chatDaily: { limit: 150, window: 86_400 },
  auth: { limit: 10, window: 900 },
  authStrict: { limit: 5, window: 900 },
  upload: { limit: 20, window: 3600 },
  adminWrite: { limit: 240, window: 60 },
  api: { limit: 120, window: 60 },
} as const satisfies Record<string, RateLimitRule>;

export type RuleName = keyof typeof RULES;

/* ── In-process fallback ─────────────────────────────────────────────── */

type Bucket = { count: number; expiresAt: number };

const buckets = new Map<string, Bucket>();
let lastSweep = 0;

/**
 * Drops expired buckets so a long-lived process cannot grow unbounded from
 * one-off keys. Sweeping on write, at most once a minute, keeps it off the hot
 * path without needing a timer that would hold the process open.
 */
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.expiresAt <= now) buckets.delete(key);
  }
  // A pathological burst of unique keys still gets a hard ceiling.
  if (buckets.size > 50_000) buckets.clear();
}

function localHit(key: string, rule: RateLimitRule): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(key);
  if (!existing || existing.expiresAt <= now) {
    const expiresAt = now + rule.window * 1000;
    buckets.set(key, { count: 1, expiresAt });
    return {
      ok: true,
      limit: rule.limit,
      remaining: rule.limit - 1,
      reset: Math.ceil(expiresAt / 1000),
      retryAfter: 0,
    };
  }

  existing.count += 1;
  const remaining = Math.max(0, rule.limit - existing.count);
  const ok = existing.count <= rule.limit;

  return {
    ok,
    limit: rule.limit,
    remaining,
    reset: Math.ceil(existing.expiresAt / 1000),
    retryAfter: ok ? 0 : Math.ceil((existing.expiresAt - now) / 1000),
  };
}

/* ── Public API ──────────────────────────────────────────────────────── */

/**
 * Counts one hit against `identifier` under the named rule.
 *
 * `identifier` should already be scoped to the actor — an IP for anonymous
 * traffic, a user id once signed in — so one user cannot spend another's
 * budget.
 */
export async function rateLimit(
  name: RuleName,
  identifier: string,
  overrides?: Partial<RateLimitRule>,
): Promise<RateLimitResult> {
  const rule = { ...RULES[name], ...overrides };
  const key = `rl:${name}:${identifier}`;

  const remote = await withRedis(async (client) => {
    // One round trip, not three: the counter, its expiry and the remaining TTL
    // are decided inside Redis by the script defined in lib/redis.ts.
    const [count, ttl] = await client.rateLimit(key, rule.window * 1000);

    const remaining = Math.max(0, rule.limit - count);
    const ok = count <= rule.limit;

    return {
      ok,
      limit: rule.limit,
      remaining,
      reset: Math.ceil((Date.now() + ttl) / 1000),
      retryAfter: ok ? 0 : Math.ceil(ttl / 1000),
    } satisfies RateLimitResult;
  }, null as RateLimitResult | null);

  return remote ?? localHit(key, rule);
}

/** Headers every rate-limited response should carry. */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'RateLimit-Limit': String(result.limit),
    'RateLimit-Remaining': String(result.remaining),
    'RateLimit-Reset': String(result.reset),
  };
  if (!result.ok) headers['Retry-After'] = String(result.retryAfter);
  return headers;
}

/** The 429 body every route returns, so the client can show one message. */
export function tooManyRequests(result: RateLimitResult): Response {
  return Response.json(
    {
      errors: {
        form: `Too many requests. Try again in ${Math.max(1, Math.ceil(result.retryAfter / 60))} minute(s).`,
      },
    },
    { status: 429, headers: rateLimitHeaders(result) },
  );
}
