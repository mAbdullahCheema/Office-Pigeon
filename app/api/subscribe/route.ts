import { NextResponse } from 'next/server';

import { guard, sameOrigin, withHeaders } from '@/lib/api-guard';
import { upsertSubscriber } from '@/lib/data';
import { fieldErrors, subscribeSchema } from '@/lib/validation';

/**
 * Newsletter signups.
 *
 * The list is a table, and whatever eventually sends the newsletter reads it.
 * One address, one row, whether or not they have signed up before.
 */
export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ errors: { form: 'Invalid request' } }, { status: 403 });
  }

  const limit = await guard(request, 'subscribe');
  if (!limit.ok) return limit.limited();

  const body = await request.json().catch(() => null);
  if (!body) {
    return withHeaders(
      NextResponse.json({ errors: { form: 'Invalid request' } }, { status: 400 }),
      limit.headers,
    );
  }

  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return withHeaders(
      NextResponse.json({ errors: fieldErrors(parsed.error) }, { status: 422 }),
      limit.headers,
    );
  }

  const { email, name, source } = parsed.data;

  await upsertSubscriber(email, { name: name || null, source });

  return withHeaders(NextResponse.json({ ok: true }, { status: 201 }), limit.headers);
}
