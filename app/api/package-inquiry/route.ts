import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, hasSupabaseAdminEnv } from '@/lib/supabase/admin';
import { compactObject, nonEmptyString } from '@/lib/server/formUtils';

/** Ported 1:1 from server.ts `/api/package-inquiry`. */
export async function POST(request: NextRequest) {
  if (!hasSupabaseAdminEnv()) {
    return NextResponse.json(
      { success: false, message: 'Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY.' },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => ({}));

  const packageName = nonEmptyString(body.package_name) || nonEmptyString(body.packageName);
  const contactEmail = nonEmptyString(body.contact_email) || nonEmptyString(body.email);

  if (!packageName || !contactEmail) {
    return NextResponse.json(
      { success: false, message: 'package_name/packageName and contact_email/email are required.' },
      { status: 400 },
    );
  }

  const { error } = await getSupabaseAdmin()
    .from('package_inquiries')
    .insert({
      package_id: nonEmptyString(body.package_id) || nonEmptyString(body.packageId) || null,
      package_name: packageName,
      price: nonEmptyString(body.price) || null,
      custom_details: compactObject({
        package_type: body.packageType,
        name: body.name,
        business_name: body.businessName,
        phone: body.phone,
        answers: body.answers,
        whatsapp_message: body.whatsappMessage,
      }),
      contact_email: contactEmail,
    });

  if (error) {
    console.error('[Office Pigeon API] Package inquiry insert failed:', error);
    return NextResponse.json({ success: false, message: 'Unable to save package inquiry.' }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Package inquiry saved.' });
}
