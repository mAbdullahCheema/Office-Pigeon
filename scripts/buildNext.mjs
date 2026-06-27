/**
 * Cutover build (Phase 3): assemble a `dist/` that Hostinger's fixed
 * `node dist/server.cjs` start command boots as the Next.js standalone server.
 *
 * Run AFTER `next build` (which emits .next/standalone with output:'standalone').
 * NOT wired into the live `npm run build` yet — that swap IS the cutover and is
 * done only once Node is set to 22.x on Hostinger (see docs/overhaul/05-PREREQS).
 *
 * Layout produced:
 *   dist/server.js          ← Next standalone server (copied)
 *   dist/server.cjs         ← thin shim: require('./server.js')
 *   dist/.next/static/...   ← client assets
 *   dist/public/...         ← static public assets
 *   dist/previews/...       ← free-preview sites (also resolved from cwd at runtime)
 */
import { cp, rm, writeFile, access } from 'fs/promises';

const exists = (p) => access(p).then(() => true).catch(() => false);

if (!(await exists('.next/standalone/server.js'))) {
  console.error('[buildNext] .next/standalone/server.js missing — run `next build` first (output: standalone).');
  process.exit(1);
}

await rm('dist', { recursive: true, force: true });
await cp('.next/standalone', 'dist', { recursive: true });
await cp('.next/static', 'dist/.next/static', { recursive: true });
if (await exists('public')) await cp('public', 'dist/public', { recursive: true });
if (await exists('previews')) await cp('previews', 'dist/previews', { recursive: true });

// Hostinger runs `node dist/server.cjs`; boot the standalone server through it.
await writeFile('dist/server.cjs', "require('./server.js');\n");

console.log('[buildNext] dist/ assembled — `node dist/server.cjs` now boots Next standalone.');
