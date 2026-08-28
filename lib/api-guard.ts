import 'server-only';

import { rateLimit, rateLimitHeaders, tooManyRequests, type RuleName } from './rate-limit';
import { clientIp } from './request';

/**
 * The gate every public API route runs first.
 *
 * Anonymous endpoints are keyed by IP, which is the only identity available;
 * a signed-in caller passes its user id instead so one office behind a single
 * address cannot exhaust everyone else's budget.
 */
export async function guard(request: Request, rule: RuleName, identity?: string) {
  const key = identity ?? clientIp(request) ?? 'unknown';
  const result = await rateLimit(rule, key);

  return {
    ok: result.ok,
    headers: rateLimitHeaders(result),
    /** The ready-made 429 to return when `ok` is false. */
    limited: () => tooManyRequests(result),
  };
}

/** Copies the limiter's headers onto a response the route already built. */
export function withHeaders(response: Response, headers: Record<string, string>): Response {
  for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
  return response;
}

/**
 * Rejects a cross-site form post.
 *
 * Route handlers here are only ever called by this site's own pages, so an
 * `Origin` from anywhere else is either a mistake or a CSRF attempt. Requests
 * with no `Origin` at all are allowed: same-origin GETs and some older clients
 * legitimately omit it, and those paths carry no side effects worth the risk of
 * a false rejection.
 */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;

  try {
    const host = request.headers.get('host');
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
