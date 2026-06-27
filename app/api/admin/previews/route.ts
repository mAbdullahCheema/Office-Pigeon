import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/adminAuth';
import { mergePreviewRows } from '@/lib/server/previews';

/** Ported from server.ts `GET /api/admin/previews`. */
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request.headers);
  if ('error' in admin) {
    return NextResponse.json({ success: false, message: admin.error.message }, { status: admin.error.status });
  }
  const previews = await mergePreviewRows();
  return NextResponse.json({ previews });
}
