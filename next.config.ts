import type { NextConfig } from 'next';

/**
 * Next.js config — Phase 2 foundation (Office Pigeon overhaul).
 *
 * Runs side-by-side with the live Vite + Express build during migration; it does
 * NOT replace the live runtime yet (see docs/overhaul/04-HANDOFF.md).
 *
 * `output: 'standalone'` emits a self-contained `.next/standalone/server.js`.
 * At Phase 3 cutover the build copies that into `dist/` and `dist/server.cjs`
 * becomes a thin shim that boots it — Hostinger's fixed `node dist/server.cjs`
 * start command then runs Next. (Entry-file boot strategy; see Decision Log.)
 *
 * Phase 3 will add: security headers() (SEC-02), redirects/canonical, image config.
 */
// Security headers (SEC-02). Pragmatic CSP: fonts are self-hosted via next/font,
// so we only need 'self' + inline (JSON-LD + Next bootstrap) + Supabase (client
// admin auth) + Google Fonts (the geo-restricted/preview pages use @import).
// Scoped to exclude /previews so third-party preview HTML isn't constrained.
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' https://fonts.gstatic.com data:",
  "connect-src 'self' https://*.supabase.co https://*.supabase.in",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: CSP },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), geolocation=(), browsing-topics=()' },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // Type-check only the Next surface (app/ + lib/) during coexistence. The legacy
  // Vite SPA (src/) and Express server keep their own check via `npm run lint`.
  typescript: {
    tsconfigPath: 'tsconfig.next.json',
  },
  async headers() {
    return [
      // All routes except /previews (preview content is third-party; the preview
      // route sets its own noindex/cache headers).
      { source: '/((?!previews).*)', headers: securityHeaders },
    ];
  },
};

export default nextConfig;
