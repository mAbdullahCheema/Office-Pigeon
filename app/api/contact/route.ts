import { NextResponse } from 'next/server';

import { guard, sameOrigin, withHeaders } from '@/lib/api-guard';
import { createContactMessage } from '@/lib/data';
import { clientIp, edgeCountry } from '@/lib/request';
import { spamScore, SPAM_THRESHOLD } from '@/lib/spam';
import { contactSchema, fieldErrors } from '@/lib/validation';

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ errors: { form: 'Invalid request' } }, { status: 403 });
  }

  const limit = await guard(request, 'contact');
  if (!limit.ok) return limit.limited();

  const body = await request.json().catch(() => null);
  if (!body) {
    return withHeaders(
      NextResponse.json({ errors: { form: 'Invalid request' } }, { status: 400 }),
      limit.headers,
    );
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return withHeaders(
      NextResponse.json({ errors: fieldErrors(parsed.error) }, { status: 422 }),
      limit.headers,
    );
  }

  const input = parsed.data;
  const score = spamScore(input);

  const message = await createContactMessage({
    name: input.name,
    email: input.email,
    subject: input.subject || null,
    message: input.message,
    status: score >= SPAM_THRESHOLD ? 'spam' : 'unread',
    spam_score: score,
    ip: clientIp(request) ?? null,
    country: (typeof body.country === 'string' && body.country) || edgeCountry(request) || null,
  });

  return withHeaders(NextResponse.json({ ok: true, id: message.id }, { status: 201 }), limit.headers);
}
