import { NextResponse } from 'next/server';
import { mergePreviewRows } from '@/lib/server/previews';

/** Ported from server.ts `GET /api/public/previews`. Drives the Examples page. */
export const dynamic = 'force-dynamic';

export async function GET() {
  const previews = await mergePreviewRows();
  return NextResponse.json({
    previews: previews
      .filter((p) => p.exists_on_disk && p.has_index && p.status === 'live')
      .map((p) => ({ slug: p.slug, business_name: p.business_name, url: p.url, status: p.status })),
  });
}
