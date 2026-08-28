/**
 * Builds the folder you upload to Hostinger.
 *
 *   npm run build && npm run package:hostinger
 *
 * `output: 'standalone'` emits a server bundle that does not include the static
 * assets or public/, so both are copied in next to it. The result in deploy/ is
 * self-contained: upload its contents and start `server.js` with Node.
 */

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const standalone = join(root, '.next', 'standalone');
const out = join(root, 'deploy');

if (!existsSync(standalone)) {
  console.error('No .next/standalone found. Run `npm run build` first.');
  process.exit(1);
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

cpSync(standalone, out, { recursive: true });
cpSync(join(root, '.next', 'static'), join(out, '.next', 'static'), { recursive: true });

if (existsSync(join(root, 'public'))) {
  cpSync(join(root, 'public'), join(out, 'public'), { recursive: true });
}

// Hostinger's Node app manager looks for a start script in package.json.
const pkg = {
  name: 'office-pigeon',
  version: '1.0.0',
  private: true,
  scripts: { start: 'node server.js' },
};
writeFileSync(join(out, 'package.json'), `${JSON.stringify(pkg, null, 2)}\n`);

console.log('deploy/ is ready.');
console.log('Upload its contents to your Hostinger Node.js app directory,');
console.log('set the startup file to server.js, and add the environment variables from .env.local.');
