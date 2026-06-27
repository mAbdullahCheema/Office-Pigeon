import { NextRequest, NextResponse } from 'next/server';
import { devPakistanFallback, resolveVisitorCountry } from '@/lib/geo/country';

/** Ported 1:1 from server.ts `/api/region-offer`. Drives the PK offer curtain. */
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const country = await resolveVisitorCountry(request.headers, request.nextUrl.searchParams);
  const showPakistanOffer = country ? country === 'PK' : devPakistanFallback(request.headers);

  return NextResponse.json(
    { showPakistanOffer, region: showPakistanOffer ? 'PK' : null },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
