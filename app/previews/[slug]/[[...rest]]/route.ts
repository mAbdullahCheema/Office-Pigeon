import fs from 'fs/promises';
import path from 'path';
import { NextRequest } from 'next/server';
import {
  buildExpiredPreviewPage,
  contentTypeFor,
  getPreviewStatus,
  injectPreviewHtml,
  isValidSlug,
  previewPathForRequest,
} from '@/lib/server/previews';

/**
 * Free-preview file serving, ported 1:1 from server.ts `/previews/:slug/*`.
 * Reads the built static site from disk, gates by Supabase status, injects the
 * Office Pigeon banner into HTML, and serves assets with correct content-types.
 * Always noindex.
 */

const NOINDEX = 'noindex, nofollow, noarchive';

const htmlResponse = (body: string, status = 200) =>
  new Response(body, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8', 'x-robots-tag': NOINDEX, 'cache-control': 'no-store' },
  });

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string; rest?: string[] }> }) {
  const { slug, rest } = await params;
  const restPath = rest?.length ? rest.join('/') : 'index.html';

  if (!isValidSlug(slug)) {
    return htmlResponse(buildExpiredPreviewPage(slug, 'missing'), 404);
  }

  const paths = await previewPathForRequest(slug, restPath);
  if (!paths) {
    return htmlResponse(buildExpiredPreviewPage(slug, 'missing'), 404);
  }

  const indexPath = path.join(paths.baseDir, 'index.html');
  const hasIndex = await fs.access(indexPath).then(() => true).catch(() => false);
  if (!hasIndex) {
    return htmlResponse(buildExpiredPreviewPage(slug, 'missing'), 404);
  }

  const statusRow = await getPreviewStatus(slug);
  const status = statusRow?.status || 'live';
  if (status !== 'live') {
    return htmlResponse(buildExpiredPreviewPage(slug, status), 200);
  }

  const targetExists = await fs.access(paths.targetPath).then(() => true).catch(() => false);
  const isHtmlRequest = paths.targetPath.endsWith('.html') || !path.extname(paths.targetPath);

  // Static (non-HTML) asset.
  if (targetExists && !paths.targetPath.endsWith('.html')) {
    const file = await fs.readFile(paths.targetPath);
    return new Response(new Uint8Array(file), {
      status: 200,
      headers: {
        'content-type': contentTypeFor(paths.targetPath),
        'x-robots-tag': NOINDEX,
        'cache-control': 'private, max-age=300',
      },
    });
  }

  // Explicit .html file → inject banner.
  if (targetExists && paths.targetPath.endsWith('.html')) {
    const html = await fs.readFile(paths.targetPath, 'utf8');
    return htmlResponse(injectPreviewHtml(html, slug));
  }

  // Extensionless / SPA route → serve the injected index.html.
  if (isHtmlRequest) {
    const html = await fs.readFile(indexPath, 'utf8');
    return htmlResponse(injectPreviewHtml(html, slug));
  }

  return Response.json({ success: false, message: 'Preview asset not found.' }, { status: 404 });
}
