import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/adminAuth';
import { getSupabaseAdmin, hasSupabaseAdminEnv } from '@/lib/supabase/admin';
import { isValidSlug } from '@/lib/server/previews';
import { nonEmptyString } from '@/lib/server/formUtils';

/** Ported from server.ts `PATCH /api/admin/previews/:slug` (metadata). */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const admin = await requireAdmin(request.headers);
  if ('error' in admin) {
    return NextResponse.json({ success: false, message: admin.error.message }, { status: admin.error.status });
  }

  const { slug } = await params;
  if (!isValidSlug(slug)) {
    return NextResponse.json({ success: false, message: 'Invalid preview slug.' }, { status: 400 });
  }
  if (!hasSupabaseAdminEnv()) {
    return NextResponse.json({ success: false, message: 'Supabase is not configured.' }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const { data, error } = await getSupabaseAdmin()
    .from('preview_statuses')
    .upsert(
      {
        slug,
        business_name: nonEmptyString(body.business_name) || null,
        notes: nonEmptyString(body.notes) || null,
      },
      { onConflict: 'slug' },
    )
    .select('*')
    .single();

  if (error) {
    console.error('[Office Pigeon API] Preview metadata upsert failed:', error);
    return NextResponse.json({ success: false, message: 'Unable to update preview metadata.' }, { status: 500 });
  }

  return NextResponse.json({ preview: data });
}
