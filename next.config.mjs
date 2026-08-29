// @ts-check
import { withSentryConfig } from '@sentry/nextjs';

import { csp, origin } from './lib/csp.mjs';

/**
 * Plain ESM rather than TypeScript, deliberately.
 *
 * A `next.config.ts` has to be compiled before it can be read, and Next does
 * that with SWC. Hostinger's build container ships a glibc older than 2.29, so
 * the native `@next/swc-linux-x64-gnu` binary cannot load and Next falls back
 * to the WASM build — which loads the app fine but never produces the temporary
 * module the compiled config imports, failing every build with
 * `ERR_MODULE_NOT_FOUND` on a hashed filename that changes each run.
 *
 * `.mjs` is imported directly by Node with no compilation step, so the whole
 * failure mode disappears. The cost is that the config is no longer type
 * checked by `tsc`; `// @ts-check` and the JSDoc annotation below recover the
 * editor types and catch a misspelled option just as well.
 */

const supabaseOrigin = origin(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseHost = supabaseOrigin ? new URL(supabaseOrigin).hostname : '';
const sentryOrigin = origin(process.env.NEXT_PUBLIC_SENTRY_DSN);
const production = process.env.NODE_ENV === 'production';

/**
 * The canonical host, used to send `www` traffic to the apex.
 *
 * Hostinger's panel can do this at the edge, but doing it here means the
 * redirect ships with the app and cannot be lost to a panel setting.
 */
const siteOrigin = origin(process.env.NEXT_PUBLIC_SITE_URL);
const siteHost = siteOrigin ? new URL(siteOrigin).hostname : '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * The host runs the app as a plain Node process, so build a self-contained
   * server bundle rather than relying on node_modules being present at runtime.
   * Additive: `next build` still emits the ordinary `.next` output, which is
   * what a platform build serves.
   */
  output: 'standalone',

  experimental: {
    /**
     * Routes an unmatched URL straight to `app/global-not-found.tsx` instead of
     * rendering the root layout around `not-found.tsx`. That is what lets the
     * 404 carry its own `<title>` rather than inheriting the homepage's.
     */
    globalNotFound: true,
  },

  poweredByHeader: false,
  compress: true,

  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: 'https', hostname: supabaseHost, pathname: '/storage/v1/object/public/**' }]
      : [],
  },

  async redirects() {
    if (!siteHost || siteHost.startsWith('www.')) return [];
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: `www.${siteHost}` }],
        destination: `${siteOrigin}/:path*`,
        // 301 rather than `permanent: true`, which emits 308: nothing posts to
        // the `www` host, and 301 is the canonicalisation signal every crawler
        // and auditing tool recognises.
        statusCode: 301,
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          ...(production
            ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
            : []),
        ],
      },
      {
        /** Nothing behind a session should be indexed or cached by a proxy. */
        source: '/dashboard/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'private, no-store' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ];
  },
};

/**
 * Sentry's build plugin, only when Sentry is actually configured.
 *
 * The wrapper is not free: it rewrites the bundler config, injects its own
 * client instrumentation module and — given an auth token — uploads source maps
 * as a build step. A deployment with no DSN gets none of that, and more to the
 * point cannot have a build broken by it.
 *
 * `widenClientFileUpload` is what makes a minified stack trace readable; the
 * tunnel route is deliberately not enabled, because it would proxy browser
 * error payloads through this server, and the CSP already permits the direct
 * connection.
 */
export default sentryOrigin
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      silent: !process.env.CI,
      widenClientFileUpload: true,
      // Without a token there is nothing to upload to, and attempting it fails
      // the build on a machine that only has the public DSN.
      sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
      // Strips the SDK's own debug logging from the bundle. Replaces the
      // deprecated top-level `disableLogger`, and applies now that the build
      // runs on webpack.
      webpack: { treeshake: { removeDebugLogging: true } },
      telemetry: false,
    })
  : nextConfig;
