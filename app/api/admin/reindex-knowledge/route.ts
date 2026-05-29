import { NextRequest, NextResponse } from 'next/server';
import { indexKnowledge } from '@/scripts/indexKnowledge';

function authorized(request: NextRequest) {
  const secret = process.env.ADMIN_REINDEX_SECRET;
  if (!secret) return false;

  const auth = request.headers.get('authorization');
  const querySecret = request.nextUrl.searchParams.get('secret');
  return auth === `Bearer ${secret}` || querySecret === secret;
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const result = await indexKnowledge();
  return NextResponse.json({ ok: true, ...result });
}

export async function GET(request: NextRequest) {
  return POST(request);
}
