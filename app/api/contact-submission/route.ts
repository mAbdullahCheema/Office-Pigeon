import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, hasSupabaseAdminEnv } from '@/lib/supabase/admin';
import { compactObject, nonEmptyString } from '@/lib/server/formUtils';

/** Ported 1:1 from server.ts `/api/contact-submission`. */
export async function POST(request: NextRequest) {
  if (!hasSupabaseAdminEnv()) {
    return NextResponse.json(
      { success: false, message: 'Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY.' },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => ({}));

  const fullName = nonEmptyString(body.full_name) || nonEmptyString(body.name);
  const businessEmail = nonEmptyString(body.business_email) || nonEmptyString(body.email);

  if (!fullName || !businessEmail) {
    return NextResponse.json(
      { success: false, message: 'full_name/name and business_email/email are required.' },
      { status: 400 },
    );
  }

  const messageParts = [
    nonEmptyString(body.message),
    nonEmptyString(body.main_problem),
    JSON.stringify(
      compactObject({
        business_name: body.business_name,
        service_interest: body.service_interest,
        existing_website: body.existing_website,
        industry: body.industry,
        timeline: body.timeline,
        preferred_contact: body.preferred_contact,
        budget_range: body.budget_range,
      }),
    ),
  ].filter(Boolean);

  const { error } = await getSupabaseAdmin()
    .from('contact_submissions')
    .insert({
      full_name: fullName,
      business_email: businessEmail,
      phone: nonEmptyString(body.phone) || null,
      message: messageParts.join('\n\n'),
    });

  if (error) {
    console.error('[Office Pigeon API] Contact submission insert failed:', error);
    return NextResponse.json({ success: false, message: 'Unable to save contact submission.' }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Contact submission saved.' });
}
