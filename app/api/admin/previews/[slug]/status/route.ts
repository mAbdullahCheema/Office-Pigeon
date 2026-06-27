import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/adminAuth';
import { getSupabaseAdmin, hasSupabaseAdminEnv } from '@/lib/supabase/admin';
import { isValidSlug, VALID_STATUSES, type PreviewStatus } from '@/lib/server/previews';
import { nonEmptyString } from '@/lib/server/formUtils';

/** Ported from server.ts `PATCH /api/admin/previews/:slug/status`. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const admin = await requireAdmin(request.headers);
  if ('error' in admin) {
    return NextResponse.json({ success: false, message: admin.error.message }, { status: admin.error.status });
  }

  const { slug } = await params;
  const body = await request.json().catch(() => ({}));
  const status = nonEmptyString(body.status) as PreviewStatus | undefined;

  if (!isValidSlug(slug)) {
    return NextResponse.json({ success: false, message: 'Invalid preview slug.' }, { status: 400 });
  }
  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ success: false, message: 'Invalid preview status.' }, { status: 400 });
  }
  if (!hasSupabaseAdminEnv()) {
    return NextResponse.json({ success: false, message: 'Supabase is not configured.' }, { status: 503 });
  }

  const payload = {
    slug,
    status,
    business_name: nonEmptyString(body.business_name) || null,
    notes: nonEmptyString(body.notes) || null,
    removed_at: status === 'expired' ? new Date().toISOString() : status === 'live' ? null : undefined,
    removed_by_email: status === 'expired' ? admin.email : status === 'live' ? null : undefined,
  };

  const { data, error } = await getSupabaseAdmin()
    .from('preview_statuses')
    .upsert(payload, { onConflict: 'slug' })
    .select('*')
    .single();

  if (error) {
    console.error('[Office Pigeon API] Preview status upsert failed:', error);
    return NextResponse.json({ success: false, message: 'Unable to update preview status.' }, { status: 500 });
  }

  return NextResponse.json({ preview: data });
}
