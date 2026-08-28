import 'server-only';

import { withRedis } from './redis';

/**
 * Cache-aside over Redis, with an in-process layer in front of it.
 *
 * The marketing pages read the same catalog on every request; under load that
 * is thousands of identical Postgres queries a second. Two layers absorb it:
 * the in-process map answers same-instance repeats with no network at all, and
 * Redis answers cross-instance repeats and survives a rebuild.
 *
 * Both layers are optional. A cache miss, a Redis outage and a serialisation
 * failure all end in the same place: call the loader.
 */

type Entry = { value: unknown; expiresAt: number };

const local = new Map<string, Entry>();

/**
 * Loads already running, keyed the same way as the cache.
 *
 * Without this, a cold key under load lets every concurrent request run the
 * loader — the stampede the cache exists to prevent. Joining the in-flight
 * promise collapses them into one database read.
 */
const inFlight = new Map<string, Promise<unknown>>();

/**
 * Bumped on every purge. A load that started before its key was purged carries
 * the older number and is not allowed to write its result back — otherwise a
 * customer's own write could lose the race against a read that was already in
 * flight, and they would be shown the value they just replaced.
 */
const generation = new Map<string, number>();
let lastSweep = 0;

function sweep(now: number) {
  if (now - lastSweep < 30_000) return;
  lastSweep = now;
  for (const [key, entry] of local) {
    if (entry.expiresAt <= now) local.delete(key);
  }
  if (local.size > 5_000) local.clear();

  // Per-viewer keys mean one generation counter per signed-in person. Drop the
  // ones no longer backing a cached value or a running load; a key with neither
  // has nothing left to protect.
  if (generation.size > 5_000) {
    for (const key of generation.keys()) {
      if (!local.has(key) && !inFlight.has(key)) generation.delete(key);
    }
  }
}

/** Time-to-live in seconds for each kind of read. */
export const TTL = {
  /** Catalog, FAQs, reviews — edited rarely, read on every page. */
  content: 300,
  /** Per-viewer dashboard reads. Short: the customer must see their own write. */
  viewer: 15,
  /** Aggregates on the admin overview. */
  stats: 30,
  /** Settings, payment details. */
  settings: 120,
} as const;

/**
 * The in-process TTL is capped well below the Redis TTL so a purge propagates
 * within seconds even on instances that did not handle the write.
 */
const LOCAL_TTL_CAP = 10;

export async function cached<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  sweep(now);

  const hit = local.get(key);
  if (hit && hit.expiresAt > now) return hit.value as T;

  const running = inFlight.get(key);
  if (running) return running as Promise<T>;

  const startedAt = generation.get(key) ?? 0;

  const load = (async (): Promise<T> => {
    const remote = await withRedis(async (client) => client.get(`cache:${key}`), null);
    if (remote) {
      try {
        const value = JSON.parse(remote) as T;
        remember(key, value, ttlSeconds, startedAt);
        return value;
      } catch {
        // A poisoned entry is not worth a failed page — fall through and reload.
      }
    }

    const value = await loader();

    if (remember(key, value, ttlSeconds, startedAt)) {
      await withRedis(
        async (client) => client.set(`cache:${key}`, JSON.stringify(value), 'EX', ttlSeconds),
        null,
      );
    }

    return value;
  })();

  inFlight.set(key, load);
  try {
    return await load;
  } finally {
    inFlight.delete(key);
  }
}

/** Stores a loaded value unless the key was purged while it was loading. */
function remember(key: string, value: unknown, ttlSeconds: number, startedAt: number): boolean {
  if ((generation.get(key) ?? 0) !== startedAt) return false;
  local.set(key, { value, expiresAt: Date.now() + Math.min(ttlSeconds, LOCAL_TTL_CAP) * 1000 });
  return true;
}

/** Invalidates a key locally and cancels any load that is mid-flight for it. */
function invalidate(key: string) {
  local.delete(key);
  generation.set(key, (generation.get(key) ?? 0) + 1);
}

/** Drops one key everywhere. Call after any write that the key would stale. */
export async function purge(key: string) {
  invalidate(key);
  await withRedis(async (client) => client.del(`cache:${key}`), 0);
}

/**
 * Drops every key under a prefix.
 *
 * Uses SCAN rather than KEYS: KEYS blocks the Redis event loop for the whole
 * keyspace, which on a shared plan stalls every other request in flight.
 */
export async function purgePrefix(prefix: string) {
  // Both maps, not just `local`: a key whose first load is still in flight has
  // no local entry yet, and it is exactly the one that would write back stale.
  for (const key of new Set([...local.keys(), ...inFlight.keys()])) {
    if (key.startsWith(prefix)) invalidate(key);
  }

  await withRedis(async (client) => {
    let cursor = '0';
    do {
      const [next, keys] = await client.scan(cursor, 'MATCH', `cache:${prefix}*`, 'COUNT', 200);
      cursor = next;
      if (keys.length) await client.del(...keys);
    } while (cursor !== '0');
    return null;
  }, null);
}

/** Cache keys, in one place so a writer and a reader cannot drift apart. */
export const KEYS = {
  catalog: 'catalog',
  examples: 'examples',
  reviews: 'reviews',
  faqs: 'faqs',
  paymentMethods: 'payment-methods',
  settings: 'settings',
  /** Must stay under the `viewer:<id>:` prefix that `purgeViewer` sweeps. */
  viewerSnapshot: (userId: string) => `viewer:${userId}:snapshot`,
} as const;

/** Everything the public marketing pages read. Purged on any content edit. */
export async function purgeContent() {
  await Promise.all([
    purge(KEYS.catalog),
    purge(KEYS.examples),
    purge(KEYS.reviews),
    purge(KEYS.faqs),
    purge(KEYS.paymentMethods),
    purge(KEYS.settings),
  ]);
}

/** Everything scoped to one signed-in person. Purged on any write they see. */
export async function purgeViewer(userId: string) {
  await purgePrefix(`viewer:${userId}:`);
}
