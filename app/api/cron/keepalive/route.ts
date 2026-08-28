import { timingSafeEqual } from 'node:crypto';

import { NextResponse } from 'next/server';

import { guard, withHeaders } from '@/lib/api-guard';
import { admin } from '@/lib/supabase/admin';

/**
 * Keeps the Supabase project awake.
 *
 * A free-tier project is paused after a week without activity, and a paused
 * project takes the whole site down until someone notices and restores it by
 * hand. One authenticated read every few days is enough to reset that timer,
 * and it is deliberately a read: nothing here writes, so the worst a leaked
 * schedule can do is cost one row lookup.
 *
 * The scheduler lives in `.github/workflows/keepalive.yml` rather than inside
 * Postgres, because a `pg_cron` job runs inside the database and is not
 * obviously "activity" from the platform's point of view. An HTTPS request that
 * traverses the API gateway unambiguously is — and it exercises the deployed
 * site at the same time, so a failing keep-alive is also an early warning that
 * production is down.
 *
 * Not a GET: a URL that does something is a URL that gets prefetched, logged
 * and pasted into chat windows. POST with a bearer token keeps it deliberate.
 */
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const limit = await guard(request, 'api');
  if (!limit.ok) return limit.limited();

  if (!authorised(request)) {
    // Deliberately identical whether the secret is unset or simply wrong: the
    // difference would tell a caller which of the two they are looking at.
    return withHeaders(
      NextResponse.json({ ok: false, error: 'unauthorised' }, { status: 401 }),
      limit.headers,
    );
  }

  const started = Date.now();

  try {
    const { error } = await admin().from('settings').select('key').limit(1);
    if (error) throw new Error(error.message);

    return withHeaders(
      NextResponse.json({
        ok: true,
        checkedAt: new Date().toISOString(),
        latencyMs: Date.now() - started,
      }),
      limit.headers,
    );
  } catch (error) {
    // The workflow fails on a non-200, which is the alert: a keep-alive that
    // cannot reach Postgres is exactly the condition it exists to prevent.
    console.error('[keepalive] read failed:', (error as Error).message);
    return withHeaders(
      NextResponse.json({ ok: false, error: 'database unreachable' }, { status: 503 }),
      limit.headers,
    );
  }
}

/**
 * Constant-time bearer check.
 *
 * `timingSafeEqual` throws on a length mismatch, which would itself leak the
 * secret's length, so the lengths are compared first and a mismatch returns the
 * same false as a wrong value of the right length.
 */
function authorised(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = request.headers.get('authorization') ?? '';
  const offered = header.startsWith('Bearer ') ? header.slice(7) : '';

  const a = Buffer.from(offered);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}
