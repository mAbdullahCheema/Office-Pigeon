import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/adminAuth';

/** Ported from server.ts `/api/admin/me`. */
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request.headers);
  if ('error' in admin) {
    return NextResponse.json({ success: false, message: admin.error.message }, { status: admin.error.status });
  }
  return NextResponse.json({ email: admin.email });
}
