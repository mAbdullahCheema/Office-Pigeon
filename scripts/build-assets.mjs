/**
 * Derives every static asset the app serves but nobody should hand-maintain:
 * the PNG app icons, and the narrow variants of each photograph.
 *
 * Photographs are authored at 1400–2000px because that is what the generator
 * emits, but the widest box any of them lands in is roughly 1200 CSS pixels and
 * on a phone it is under 400. Sending the full file to a phone is the single
 * largest transfer on the site, so each image gets a set of narrower encodes and
 * `ImageSlot` publishes them as a `srcset` for the browser to choose from.
 *
 * The generated manifest (`lib/image-variants.ts`) also carries each image's
 * intrinsic size, which is what lets the markup reserve the right box before the
 * bytes land instead of reflowing the page around them.
 *
 * Run with `npm run assets`. Safe to re-run: variants are only rebuilt when the
 * source is newer, so repeated runs never re-encode an encode. Its output is
 * committed, so neither `next build` nor a deploy ever runs it.
 *
 * `sharp` is not a declared dependency — it arrives with Next.js, which uses it
 * for its own image optimiser. This script is developer-only, so borrowing it
 * beats pinning a second copy of a 30MB native module.
 */
import { createHash } from 'node:crypto';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imagesDir = path.join(root, 'public', 'images');
const publicDir = path.join(root, 'public');
const appDir = path.join(root, 'app');

/** The widths a photograph is offered at, on top of its own. */
const WIDTHS = [480, 768, 1200];
const QUALITY = 76;

const exists = (file) => stat(file).then(() => true, () => false);

async function newerThan(candidate, source) {
  const [a, b] = await Promise.all([stat(candidate).catch(() => null), stat(source)]);
  return Boolean(a && a.mtimeMs >= b.mtimeMs);
}

// ── app icons ──────────────────────────────────────────────────────────────

/**
 * The maskable icon is drawn rather than derived from `pigeon-clay.svg`: Android
 * crops a maskable tile to whatever shape the launcher uses, so the mark has to
 * sit inside the middle 80% with the brand colour bleeding to the edges.
 */
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#E8480F"/>
  <g transform="translate(150, 150) scale(9.25)" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M16 7h.01"/>
    <path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20"/>
    <path d="m20 7 2 .5-2 .5"/>
    <path d="M10 18v3"/>
    <path d="M14 17.75V21"/>
    <path d="M7 18a6 6 0 0 0 3.84-10.61"/>
  </g>
</svg>`;

async function buildIcons() {
  const clay = await readFile(path.join(publicDir, 'pigeon-clay.svg'));

  // `app/icon.svg` is the crisp tab icon; `app/favicon.ico` stays as the
  // fallback for browsers that ignore SVG icons.
  await writeFile(path.join(appDir, 'icon.svg'), clay);

  // iOS ignores SVG icons and never composites a transparent one, so the home
  // screen tile is a flat PNG on the brand ground.
  await sharp(clay, { density: 384 })
    .resize(180, 180)
    .flatten({ background: '#FFF7F1' })
    .png()
    .toFile(path.join(appDir, 'apple-icon.png'));

  await sharp(clay, { density: 384 })
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));

  await sharp(Buffer.from(maskableSvg), { density: 384 })
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));

  console.log('icons: app/icon.svg, app/apple-icon.png, public/icon-192.png, public/icon-512.png');
}

// ── responsive photographs ─────────────────────────────────────────────────

async function buildImages() {
  const files = (await readdir(imagesDir, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith('.webp'))
    // A variant is itself a `.webp` in this directory, so skip anything already
    // carrying a width suffix or a re-run would fan out from its own output.
    .filter((entry) => !/-\d+w\.webp$/.test(entry.name))
    .map((entry) => entry.name)
    .sort();

  const manifest = {};
  let built = 0;
  let bytesBefore = 0;
  let bytesAfter = 0;

  for (const name of files) {
    const source = path.join(imagesDir, name);
    const meta = await sharp(source).metadata();
    const base = name.replace(/\.webp$/, '');
    const widths = WIDTHS.filter((width) => width < meta.width);

    for (const width of widths) {
      const target = path.join(imagesDir, `${base}-${width}w.webp`);
      if ((await exists(target)) && (await newerThan(target, source))) continue;
      await sharp(source).resize({ width }).webp({ quality: QUALITY }).toFile(target);
      built += 1;
    }

    const smallest = widths[0] ?? meta.width;
    bytesBefore += (await stat(source)).size;
    bytesAfter += (
      await stat(path.join(imagesDir, widths.length ? `${base}-${smallest}w.webp` : name))
    ).size;

    manifest[`/images/${name}`] = {
      width: meta.width,
      height: meta.height,
      widths: [...widths, meta.width],
    };
  }

  const body = `/**
 * Generated by \`npm run assets\` — do not edit.
 *
 * Intrinsic size and available encode widths for every photograph in
 * \`public/images\`. \`ImageSlot\` reads this to reserve the right box and to
 * publish a \`srcset\`.
 */
export type ImageVariant = { width: number; height: number; widths: number[] };

export const imageVariants: Record<string, ImageVariant> = ${JSON.stringify(manifest, null, 2)};
`;

  const target = path.join(root, 'lib', 'image-variants.ts');
  const previous = await readFile(target, 'utf8').catch(() => '');
  const changed = createHash('sha1').update(previous).digest('hex') !== createHash('sha1').update(body).digest('hex');
  if (changed) await writeFile(target, body);

  const kb = (value) => `${Math.round(value / 1024)}KB`;
  console.log(
    `images: ${files.length} sources, ${built} variants written, manifest ${changed ? 'updated' : 'unchanged'}`,
  );
  console.log(`        phone tier is ${kb(bytesAfter)} against ${kb(bytesBefore)} at full width`);
}

await buildIcons();
await buildImages();
