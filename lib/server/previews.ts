import fs from 'fs/promises';
import path from 'path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getEnv, getSupabaseServiceRoleKey, getSupabaseAnonKey, getSupabaseUrl } from './env';

/**
 * Preview discovery + status, ported 1:1 from server.ts (Phase 3).
 *
 * Free-preview hosting: each `previews/<slug>/` folder is a built static site.
 * Disk scan is merged with a Supabase `preview_statuses` table. Shared by the
 * Next admin routes, /api/public/previews, and (next) the preview file server.
 */

export type PreviewStatus = 'live' | 'expired' | 'sold' | 'draft' | 'archived';
export const VALID_STATUSES: PreviewStatus[] = ['live', 'expired', 'sold', 'draft', 'archived'];
const SLUG_REGEX = /^[a-z0-9-]+$/;

export interface PreviewStatusRow {
  id?: string;
  slug: string;
  business_name?: string | null;
  status: PreviewStatus;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  removed_at?: string | null;
  removed_by_email?: string | null;
}

interface PreviewFolder {
  slug: string;
  business_name: string;
  url: string;
  exists_on_disk: boolean;
  has_index: boolean;
}

export const isValidSlug = (slug: string) => SLUG_REGEX.test(slug);

export const titleCaseSlug = (slug: string) =>
  slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const previewDirCandidates = (): string[] =>
  Array.from(
    new Set(
      [
        path.join(process.cwd(), 'previews'),
        path.join(process.cwd(), 'dist', 'previews'),
        path.join(process.cwd(), 'public', 'previews'),
      ].map((p) => path.resolve(p)),
    ),
  );

// Service-role client (mirrors server.ts getSupabaseClient: service role OR anon).
let cached: SupabaseClient | null = null;
function getClient(): SupabaseClient | null {
  if (cached) return cached;
  const url = getSupabaseUrl();
  const key = getSupabaseServiceRoleKey() || getSupabaseAnonKey();
  if (!url || !key) return null;
  cached = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  return cached;
}

async function scanPreviewFolders(): Promise<PreviewFolder[]> {
  const folderMap = new Map<string, PreviewFolder>();
  for (const previewsDir of previewDirCandidates()) {
    const entries = await fs.readdir(previewsDir, { withFileTypes: true }).catch(() => []);
    const folders = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory() && isValidSlug(entry.name))
        .map(async (entry) => {
          const indexPath = path.join(previewsDir, entry.name, 'index.html');
          const hasIndex = await fs.access(indexPath).then(() => true).catch(() => false);
          return {
            slug: entry.name,
            business_name: titleCaseSlug(entry.name),
            url: `/previews/${entry.name}`,
            exists_on_disk: true,
            has_index: hasIndex,
          };
        }),
    );
    for (const folder of folders) {
      const existing = folderMap.get(folder.slug);
      folderMap.set(folder.slug, {
        ...folder,
        has_index: Boolean(existing?.has_index || folder.has_index),
      });
    }
  }
  return Array.from(folderMap.values()).sort((a, b) => a.slug.localeCompare(b.slug));
}

async function fetchPreviewStatuses(): Promise<Map<string, PreviewStatusRow>> {
  const client = getClient();
  if (!client) return new Map();
  const { data, error } = await client.from('preview_statuses').select('*');
  if (error) {
    console.error('[Office Pigeon API] Preview statuses fetch failed:', error);
    return new Map();
  }
  return new Map((data || []).map((row) => [row.slug, row as PreviewStatusRow]));
}

export async function mergePreviewRows() {
  const folders = await scanPreviewFolders();
  const statusRows = await fetchPreviewStatuses();
  const folderMap = new Map(folders.map((folder) => [folder.slug, folder]));
  const slugs = Array.from(new Set([...folders.map((f) => f.slug), ...statusRows.keys()])).sort();

  return slugs.map((slug) => {
    const folder = folderMap.get(slug);
    const status = statusRows.get(slug);
    return {
      slug,
      business_name: status?.business_name || folder?.business_name || titleCaseSlug(slug),
      status: status?.status || ('live' as PreviewStatus),
      url: `/previews/${slug}`,
      exists_on_disk: Boolean(folder?.exists_on_disk),
      has_index: Boolean(folder?.has_index),
      notes: status?.notes || null,
      created_at: status?.created_at || null,
      updated_at: status?.updated_at || null,
      removed_at: status?.removed_at || null,
      removed_by_email: status?.removed_by_email || null,
    };
  });
}

export async function getPreviewStatus(slug: string): Promise<PreviewStatusRow | null> {
  const client = getClient();
  if (!client) return { slug, status: 'live' };
  const { data, error } = await client.from('preview_statuses').select('*').eq('slug', slug).maybeSingle();
  if (error) {
    console.error('[Office Pigeon API] Preview status lookup failed:', error);
    return { slug, status: 'live' };
  }
  return data as PreviewStatusRow | null;
}

// ─── Preview file serving: paths, banner injection, status pages ───
// Ported 1:1 from server.ts (Phase 3).

const previewPublicUrl = () =>
  getEnv('OFFICE_PIGEON_PUBLIC_URL', 'APP_URL', 'NEXT_PUBLIC_SITE_URL') || 'https://officepigeon.com';
const whatsappNumber = () =>
  getEnv('OFFICE_PIGEON_WHATSAPP_NUMBER', 'NEXT_PUBLIC_WHATSAPP_NUMBER') || '19176726764';

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] || char,
  );

/** Resolve + sanitize the on-disk path for a preview asset (path-traversal safe). */
export async function previewPathForRequest(
  slug: string,
  rest = '',
): Promise<{ baseDir: string; targetPath: string } | null> {
  if (!isValidSlug(slug)) return null;
  const safeRest = path.normalize(rest || 'index.html').replace(/^(\.\.[/\\])+/, '');

  for (const previewsDir of previewDirCandidates()) {
    const baseDir = path.join(previewsDir, slug);
    const targetPath = path.join(baseDir, safeRest);
    const relative = path.relative(baseDir, targetPath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) return null;
    const hasIndex = await fs.access(path.join(baseDir, 'index.html')).then(() => true).catch(() => false);
    if (hasIndex) return { baseDir, targetPath };
  }

  const baseDir = path.join(previewDirCandidates()[0], slug);
  const targetPath = path.join(baseDir, safeRest);
  const relative = path.relative(baseDir, targetPath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null;
  return { baseDir, targetPath };
}

export function buildExpiredPreviewPage(slug: string, status: PreviewStatus | 'missing' = 'expired'): string {
  const baseUrl = previewPublicUrl();
  const whatsappUrl = `https://wa.me/${whatsappNumber()}`;
  const statusLabel = status === 'live' ? 'Unavailable' : 'Preview unavailable';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex,nofollow,noarchive" />
  <title>${statusLabel} | Office Pigeon</title>
  <style>
    :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #faf9f6; color: #1a1a1a; padding: 24px; }
    main { width: min(640px, 100%); background: #fff; border: 1px solid rgba(0,0,0,.07); border-radius: 24px; box-shadow: 0 24px 70px rgba(20,18,15,.08); padding: clamp(28px, 6vw, 56px); text-align: center; }
    .mark { width: 56px; height: 56px; border-radius: 999px; display: grid; place-items: center; margin: 0 auto 22px; background: linear-gradient(135deg, #f97316, #f43f5e, #f59e0b); box-shadow: 0 14px 34px rgba(249, 115, 22, .18); padding: 10px; }
    .mark img { width: 100%; height: 100%; display: block; }
    .eyebrow { margin: 0 0 10px; font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: #ea580c; font-weight: 800; }
    h1 { margin: 0; font-size: clamp(32px, 7vw, 54px); line-height: .98; letter-spacing: -.04em; }
    p { color: #68625a; line-height: 1.7; font-size: 15px; margin: 18px auto 0; max-width: 460px; }
    .slug { margin-top: 14px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; color: #9a9288; font-size: 12px; }
    .actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-top: 30px; }
    a { border-radius: 999px; padding: 13px 18px; text-decoration: none; font-size: 13px; font-weight: 800; }
    .primary { background: #111; color: #fff; }
    .secondary { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }
  </style>
</head>
<body>
  <main>
    <div class="mark"><img src="/logos/office-pigeon-icon.svg" alt="Office Pigeon" /></div>
    <p class="eyebrow">Office Pigeon Preview</p>
    <h1>This preview is expired.</h1>
    <p>Please contact +1 917 672 6764 for any questions or placing an order.</p>
    <div class="slug">${escapeHtml(slug)}</div>
    <div class="actions">
      <a class="primary" href="${whatsappUrl}">Contact on WhatsApp</a>
      <a class="secondary" href="${baseUrl}">Visit Office Pigeon</a>
    </div>
  </main>
</body>
</html>`;
}

const buildPreviewInjection = (slug: string) => {
  const whatsappUrl = `https://wa.me/${whatsappNumber()}?text=${encodeURIComponent(`Hi Office Pigeon, I like the ${slug} preview and want to claim it.`)}`;
  return `
<meta name="robots" content="noindex,nofollow,noarchive" />
<script>
  window.OFFICE_PIGEON_PREVIEW_SLUG = ${JSON.stringify(slug)};
  window.OFFICE_PIGEON_PREVIEW_API = "/api/preview-leads";
</script>
<style>
  #office-pigeon-preview-banner { position: fixed; left: 50%; bottom: 14px; transform: translateX(-50%); z-index: 2147483647; max-width: min(720px, calc(100vw - 24px)); display: flex; align-items: center; gap: 12px; padding: 10px 12px 10px 16px; border: 1px solid rgba(0,0,0,.08); border-radius: 999px; background: rgba(255,255,255,.94); color: #171717; box-shadow: 0 16px 44px rgba(0,0,0,.14); backdrop-filter: blur(18px); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 12px; line-height: 1.35; transition: width .2s ease, max-width .2s ease, padding .2s ease, border-radius .2s ease; }
  #office-pigeon-preview-banner a { color: #fff; background: #111; border-radius: 999px; padding: 8px 11px; text-decoration: none; font-weight: 800; white-space: nowrap; }
  #office-pigeon-preview-banner button { border: 0; background: #f3f1ed; color: #555; width: 26px; height: 26px; border-radius: 999px; cursor: pointer; font-weight: 900; line-height: 1; display: inline-flex; align-items: center; justify-content: center; }
  #office-pigeon-preview-banner .office-pigeon-preview-icon { display: none; width: 52px; height: 52px; border: 0; padding: 0; background: linear-gradient(135deg, #f97316, #e11d48, #f59e0b); box-shadow: 0 16px 38px rgba(0,0,0,.18); }
  #office-pigeon-preview-banner .office-pigeon-preview-icon img { width: 28px; height: 28px; display: block; }
  #office-pigeon-preview-banner.is-minimized { left: auto; right: 16px; bottom: 16px; transform: none; width: 52px; height: 52px; max-width: 52px; padding: 0; border: 0; border-radius: 999px; background: transparent; box-shadow: none; backdrop-filter: none; }
  #office-pigeon-preview-banner.is-minimized span,
  #office-pigeon-preview-banner.is-minimized a,
  #office-pigeon-preview-banner.is-minimized .office-pigeon-preview-minimize { display: none; }
  #office-pigeon-preview-banner.is-minimized .office-pigeon-preview-icon { display: inline-flex; align-items: center; justify-content: center; }
  .office-pigeon-preview-tooltip { position: absolute; bottom: calc(100% + 12px); right: 0; width: max-content; max-width: 280px; background: #111; color: #fff; padding: 10px 14px; border-radius: 14px; box-shadow: 0 10px 30px rgba(0,0,0,.15); font-size: 11px; line-height: 1.4; text-align: left; pointer-events: auto; transition: opacity .3s ease, transform .3s ease; opacity: 0; transform: translateY(8px) scale(0.95); }
  .office-pigeon-preview-tooltip.show { opacity: 1; transform: translateY(0) scale(1); }
  .office-pigeon-preview-tooltip::after { content: ""; position: absolute; top: 100%; right: 20px; width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #111; }
  .office-pigeon-preview-tooltip strong { color: #f97316; }
  #office-pigeon-preview-banner:not(.is-minimized) .office-pigeon-preview-tooltip { display: none; }
  @media (max-width: 560px) { #office-pigeon-preview-banner { border-radius: 18px; align-items: flex-start; flex-wrap: wrap; bottom: 10px; } #office-pigeon-preview-banner a { flex: 1; text-align: center; } #office-pigeon-preview-banner.is-minimized { right: 12px; bottom: 12px; } }
</style>
<script>
  window.addEventListener("DOMContentLoaded", function () {
    var banner = document.createElement("div");
    banner.id = "office-pigeon-preview-banner";
    banner.innerHTML = '<div class="office-pigeon-preview-tooltip"><strong>Free preview by Office Pigeon</strong><br/>Like this website? Contact us to claim it.<br/><strong>WhatsApp +1 917 672 6764</strong></div><span>Free preview by <strong>Office Pigeon</strong> - Like this website? Contact us to claim it.</span><a href="${whatsappUrl}" target="_blank" rel="noreferrer">WhatsApp +1 917 672 6764</a><button class="office-pigeon-preview-minimize" type="button" aria-label="Minimize Office Pigeon preview banner">-</button><button class="office-pigeon-preview-icon" type="button" aria-label="Open Office Pigeon preview banner"><img src="/logos/office-pigeon-icon.svg" alt="Office Pigeon" /></button>';

    var isExpanded = sessionStorage.getItem("office-pigeon-preview-banner-expanded") === "1";
    if (!isExpanded) {
      banner.classList.add("is-minimized");
    }

    banner.querySelector(".office-pigeon-preview-minimize").addEventListener("click", function (e) {
      e.stopPropagation();
      sessionStorage.setItem("office-pigeon-preview-banner-expanded", "0");
      banner.classList.add("is-minimized");
      var tooltip = banner.querySelector(".office-pigeon-preview-tooltip");
      if (tooltip) tooltip.classList.remove("show");
    });

    banner.querySelector(".office-pigeon-preview-icon").addEventListener("click", function (e) {
      e.stopPropagation();
      sessionStorage.setItem("office-pigeon-preview-banner-expanded", "1");
      banner.classList.remove("is-minimized");
      var tooltip = banner.querySelector(".office-pigeon-preview-tooltip");
      if (tooltip) tooltip.classList.remove("show");
    });

    var tooltip = banner.querySelector(".office-pigeon-preview-tooltip");
    if (tooltip) {
      tooltip.addEventListener("click", function (e) {
        e.stopPropagation();
        sessionStorage.setItem("office-pigeon-preview-banner-expanded", "1");
        banner.classList.remove("is-minimized");
        tooltip.classList.remove("show");
      });
    }

    document.body.appendChild(banner);

    if (!isExpanded) {
      setTimeout(function () {
        if (tooltip && banner.classList.contains("is-minimized")) {
          tooltip.classList.add("show");
          setTimeout(function () {
            tooltip.classList.remove("show");
          }, 4000);
        }
      }, 600);
    }
  });
</script>`;
};

/**
 * Inject the preview banner + a <base href="/previews/<slug>/"> so the page's
 * relative asset URLs resolve regardless of trailing slash (Next strips
 * trailing slashes, unlike the Express redirect). Base goes at head start
 * (before any relative <link>/<script>); banner before </head>.
 */
export function injectPreviewHtml(html: string, slug: string): string {
  const base = `<base href="/previews/${slug}/" />`;
  const injection = buildPreviewInjection(slug);

  let out = html;
  const headOpen = out.match(/<head[^>]*>/i);
  if (headOpen) {
    out = out.replace(headOpen[0], `${headOpen[0]}\n${base}`);
  } else {
    out = `${base}\n${out}`;
  }

  if (out.includes('</head>')) return out.replace('</head>', `${injection}\n</head>`);
  if (out.includes('</body>')) return out.replace('</body>', `${injection}\n</body>`);
  return `${out}\n${injection}`;
}

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml; charset=utf-8',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

export const contentTypeFor = (filePath: string): string =>
  MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
