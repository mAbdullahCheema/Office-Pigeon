import 'server-only';

import Redis, { type RedisOptions } from 'ioredis';

import { RATE_LIMIT_LUA } from './redis-scripts';

/**
 * One lazily-created Redis connection for the whole process.
 *
 * Redis is optional: without `REDIS_URL` every caller falls back to its
 * in-process behaviour, so a missing or unreachable Redis costs distributed
 * coordination, never a broken request. The client therefore never throws on
 * connection problems — `client()` returns null and callers degrade.
 */

declare global {
  // Survives the dev-server module reloads that would otherwise leak sockets.
  var __opRedis: OpRedis | null | undefined;
}

const url = process.env.REDIS_URL?.trim();

/** The client, plus the scripts defined on it. */
export type OpRedis = Redis & {
  rateLimit(key: string, windowMillis: number): Promise<[number, number]>;
};

function connect(): OpRedis | null {
  if (!url) return null;

  const options: RedisOptions = {
    lazyConnect: false,

    /**
     * Sized from measurement, not from a guess: the managed instance answers a
     * warm command in ~70 ms and completes a cold TLS handshake in ~350 ms.
     *
     * The previous 1 s command timeout was close enough to those numbers that
     * any pause in the event loop — a compile in development, a garbage
     * collection or a heavy render in production — could fire it while the
     * reply was already on the socket, turning a healthy Redis into a logged
     * error and a needless fallback. These are still an order of magnitude
     * below ioredis's defaults, so a genuinely dead Redis still fails fast.
     */
    connectTimeout: 5_000,
    commandTimeout: 3_000,

    maxRetriesPerRequest: 1,

    /**
     * Queue commands issued before the socket finishes connecting.
     *
     * With the queue off, every request that lands during the first round trip
     * after boot fails with "Stream isn't writeable" and silently degrades —
     * which is exactly the window a cold start spends serving traffic.
     */
    enableOfflineQueue: true,

    /**
     * Batches every command issued in the same tick into one round trip.
     *
     * `purgeContent()` drops five keys at once and a page can read several
     * cached values together; without this each one pays the full 70 ms
     * separately. It also halves the command count against the provider's
     * quota, which is billed per command.
     */
    enableAutoPipelining: true,

    keepAlive: 30_000,
    retryStrategy: (attempt) => Math.min(attempt * 500, 10_000),
    ...(url.startsWith('rediss://') ? { tls: {} } : {}),
  };

  const redis = new Redis(url, options) as OpRedis;

  // `defineCommand` sends EVALSHA and falls back to EVAL once, so the script
  // body crosses the wire only the first time this process uses it.
  redis.defineCommand('rateLimit', { numberOfKeys: 1, lua: RATE_LIMIT_LUA });

  redis.on('error', (error: Error) => {
    // ioredis emits on every reconnect attempt; log once per minute at most so
    // an outage does not flood the host's log budget.
    logConnectionError(error);
  });

  return redis;
}

let lastLoggedAt = 0;
function logConnectionError(error: Error) {
  const now = Date.now();
  if (now - lastLoggedAt < 60_000) return;
  lastLoggedAt = now;
  console.error('[redis] connection error:', error.message);
}

export function redis(): OpRedis | null {
  if (globalThis.__opRedis === undefined) {
    globalThis.__opRedis = connect();
  }
  return globalThis.__opRedis;
}

/**
 * Circuit breaker.
 *
 * Every command is bounded by `commandTimeout`, so a Redis that is up but
 * unreachable costs seconds per call — and a page makes several. Left alone
 * that turns a Redis outage into a site-wide slowdown, which is the opposite of
 * what an optional cache should do. After a run of consecutive failures the
 * client is skipped outright for a cooling-off period: callers get their
 * fallback immediately, and one probe every so often decides when Redis is
 * worth talking to again.
 */
const FAILURES_BEFORE_OPEN = 3;
const COOL_OFF_MS = 30_000;

let consecutiveFailures = 0;
let openedAt = 0;

/** True while the breaker is open. Exposed so the health check can report it. */
export function redisDegraded(): boolean {
  return consecutiveFailures >= FAILURES_BEFORE_OPEN && Date.now() - openedAt < COOL_OFF_MS;
}

/** Runs a Redis command, returning `fallback` if Redis is absent or fails. */
export async function withRedis<T>(
  operation: (client: OpRedis) => Promise<T>,
  fallback: T,
): Promise<T> {
  const client = redis();
  if (!client || client.status === 'end') return fallback;

  if (consecutiveFailures >= FAILURES_BEFORE_OPEN) {
    if (Date.now() - openedAt < COOL_OFF_MS) return fallback;
    // Cooling-off is over: let this one call through as the probe.
    consecutiveFailures = FAILURES_BEFORE_OPEN - 1;
  }

  try {
    const value = await operation(client);
    consecutiveFailures = 0;
    return value;
  } catch (error) {
    consecutiveFailures += 1;
    if (consecutiveFailures === FAILURES_BEFORE_OPEN) openedAt = Date.now();
    logConnectionError(error as Error);
    return fallback;
  }
}
