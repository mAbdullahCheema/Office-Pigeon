/**
 * The Content Security Policy, in one place.
 *
 * Plain `.mjs` because `next.config.mjs` imports it at build time, and Node
 * cannot import TypeScript. `app/layout.tsx` imports the same module, so the
 * header and the `<meta>` fallback can never describe different policies.
 *
 * The fallback exists because Hostinger's edge replaces the response header
 * with its own `upgrade-insecure-requests` — verified against the live site,
 * where every other security header passes through untouched. A policy carried
 * in the document survives that, so the site keeps its CSP either way.
 */

/**
 * The origin of a URL-shaped environment variable, or '' if it is unset.
 * @param {string | undefined} value
 * @returns {string}
 */
export function origin(value) {
  try {
    return new URL(value ?? '').origin;
  } catch {
    return '';
  }
}

const supabaseOrigin = origin(process.env.NEXT_PUBLIC_SUPABASE_URL);
const production = process.env.NODE_ENV === 'production';

/**
 * The one third-party origin the browser is allowed to talk to.
 *
 * Derived from the DSN rather than hard-coded, so a deployment with no Sentry
 * configured ships a policy that does not mention it: the tightest policy is
 * the default, and configuring the service is what opens the hole it needs.
 */
const sentryOrigin = origin(process.env.NEXT_PUBLIC_SENTRY_DSN);

/**
 * `script-src` keeps `'unsafe-inline'` because Next.js emits its hydration
 * bootstrap as inline script; removing it needs a per-request nonce, which in
 * turn needs the proxy to run on every route. The policy still closes the parts
 * that cost nothing to close: no plugins, no framing by third parties, no form
 * posting off-site, and no base-tag rewriting.
 *
 * `connect-src` has to include the Supabase origin over both http and ws: the
 * REST and Auth calls are ordinary fetches, and Realtime is a WebSocket to the
 * same host.
 */
const directives = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "manifest-src 'self'",
  // Supabase Storage serves avatars and media; blob: and data: cover canvas
  // exports and the inlined initials avatar.
  `img-src 'self' data: blob: ${supabaseOrigin}`.trim(),
  "font-src 'self' data:",
  // The design language carries its styling as inline declarations.
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${production ? '' : " 'unsafe-eval'"}`,
  ['connect-src', "'self'", supabaseOrigin, supabaseOrigin.replace('https://', 'wss://'), sentryOrigin]
    .filter(Boolean)
    .join(' '),
  "worker-src 'self' blob:",
  ...(production ? ['upgrade-insecure-requests'] : []),
];

/** The policy as sent in the `Content-Security-Policy` response header. */
export const csp = directives.join('; ');

/**
 * The same policy for a `<meta http-equiv>` tag.
 *
 * `frame-ancestors` is dropped because a document-delivered policy cannot carry
 * it — browsers ignore it and log a warning. Nothing is lost: `X-Frame-Options:
 * SAMEORIGIN` says the same thing and does reach the browser.
 */
export const cspMeta = directives.filter((d) => !d.startsWith('frame-ancestors')).join('; ');
