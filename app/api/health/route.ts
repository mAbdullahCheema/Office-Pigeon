import { NextResponse } from 'next/server';

import { guard, withHeaders } from '@/lib/api-guard';
import { redis, redisDegraded, withRedis } from '@/lib/redis';
import { admin } from '@/lib/supabase/admin';
import { supabaseUrl } from '@/lib/supabase/config';

/**
 * Liveness and readiness probe.
 *
 * A load balancer takes an instance out of rotation on a non-200, so the status
 * code has to mean "this instance cannot serve", not "something is imperfect".
 * Postgres is the only hard dependency: without it no page renders, so it
 * alone decides the code. Redis is optional by design — the app degrades to
 * per-instance caching and rate limiting — so it is reported and never fails
 * the probe.
 *
 * Open to anyone, so it is rate limited and reads a single row.
 */
export async function GET(request: Request) {
  const limit = await guard(request, 'api');
  if (!limit.ok) return limit.limited();

  const started = Date.now();

  const [database, cache] = await Promise.all([checkDatabase(), checkRedis()]);
  const body = {
    ok: database.ok,
    database,
    cache,
    // A NEXT_PUBLIC value the browser already holds; nothing here tells a
    // caller anything they could not read from the page source.
    endpoint: supabaseUrl,
    latencyMs: Date.now() - started,
  };

  return withHeaders(
    NextResponse.json(body, { status: database.ok ? 200 : 503 }),
    limit.headers,
  );
}

async function checkDatabase(): Promise<{ ok: boolean; latencyMs: number }> {
  const started = Date.now();
  try {
    const { error } = await admin().from('settings').select('key').limit(1);
    if (error) throw new Error(error.message);
    return { ok: true, latencyMs: Date.now() - started };
  } catch (error) {
    // The reason belongs in the host's logs, not in a public response body,
    // where it would describe our backend to whoever asked.
    console.error('[health] database check failed:', (error as Error).message);
    return { ok: false, latencyMs: Date.now() - started };
  }
}

type CacheHealth = {
  /** `off` when no REDIS_URL is set, which is a supported way to run. */
  status: 'ok' | 'degraded' | 'off';
  latencyMs: number | null;
};

async function checkRedis(): Promise<CacheHealth> {
  if (!redis()) return { status: 'off', latencyMs: null };
  if (redisDegraded()) return { status: 'degraded', latencyMs: null };

  const started = Date.now();
  const pong = await withRedis(async (client) => client.ping(), null);

  return pong
    ? { status: 'ok', latencyMs: Date.now() - started }
    : { status: 'degraded', latencyMs: null };
}
