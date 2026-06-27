import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, hasSupabaseAdminEnv } from '@/lib/supabase/admin';
import { getClientIp } from '@/lib/geo/country';
import { compactObject, nonEmptyString } from '@/lib/server/formUtils';
import { isValidSlug } from '@/lib/server/previews';

/** Ported 1:1 from server.ts `/api/preview-leads`. The preview banner posts here. */

const previewLeadAttempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const current = previewLeadAttempts.get(ip);
  if (!current || current.resetAt < now) {
    previewLeadAttempts.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }
  current.count += 1;
  return current.count > 20;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers) || 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json({ success: false, message: 'Too many submissions. Please try again later.' }, { status: 429 });
  }

  if (!hasSupabaseAdminEnv()) {
    return NextResponse.json({ success: false, message: 'Supabase is not configured.' }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));

  const previewSlug = nonEmptyString(body.preview_slug) || nonEmptyString(body.slug);
  if (!previewSlug || !isValidSlug(previewSlug)) {
    return NextResponse.json({ success: false, message: 'A valid preview_slug is required.' }, { status: 400 });
  }

  const email = nonEmptyString(body.email);
  const phone = nonEmptyString(body.phone);
  const name = nonEmptyString(body.name);
  const message = nonEmptyString(body.message);

  if (!email && !phone) {
    return NextResponse.json({ success: false, message: 'Please include an email or phone number.' }, { status: 400 });
  }

  const formData =
    body.form_data && typeof body.form_data === 'object' && !Array.isArray(body.form_data)
      ? body.form_data
      : compactObject({ ...body });

  const { error } = await getSupabaseAdmin()
    .from('preview_leads')
    .insert({
      preview_slug: previewSlug,
      business_name: nonEmptyString(body.business_name) || null,
      name: name || null,
      email: email || null,
      phone: phone || null,
      message: message || null,
      form_data: formData,
      source: 'preview_website',
    });

  if (error) {
    console.error('[Office Pigeon API] Preview lead insert failed:', error);
    return NextResponse.json({ success: false, message: 'Unable to save preview lead.' }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Preview lead saved.' });
}
