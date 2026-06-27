import { NextResponse, type NextRequest } from 'next/server';
import { canAccessPakistan } from '@/lib/geo/country';
import { pakistanRestrictedPage } from '@/lib/server/pakistanPage';

/**
 * Geo-gating for the PK-only page (Phase 3) — ports the Express `/pakistan`
 * gate. Allowed visitors (country PK, or dev fallback) pass through to the
 * prerendered page; everyone else gets the noindex region-restricted page.
 */
export async function middleware(request: NextRequest) {
  const allowed = await canAccessPakistan(request.headers, request.nextUrl.searchParams);
  if (allowed) return NextResponse.next();

  return new NextResponse(pakistanRestrictedPage(), {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'x-robots-tag': 'noindex, nofollow',
      'cache-control': 'private, no-store',
    },
  });
}

export const config = {
  matcher: ['/pakistan', '/pakistan/'],
};
