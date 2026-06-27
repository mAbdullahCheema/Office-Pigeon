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
const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // Type-check only the Next surface (app/ + lib/) during coexistence. The legacy
  // Vite SPA (src/) and Express server keep their own check via `npm run lint`.
  typescript: {
    tsconfigPath: 'tsconfig.next.json',
  },
};

export default nextConfig;
