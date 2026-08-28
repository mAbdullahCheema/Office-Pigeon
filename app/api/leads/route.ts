import { NextResponse } from 'next/server';

import { guard, sameOrigin, withHeaders } from '@/lib/api-guard';
import { createLead, touchConversation } from '@/lib/data';
import { clientIp, edgeCountry } from '@/lib/request';
import { spamScore, SPAM_THRESHOLD } from '@/lib/spam';
import { fieldErrors, leadSchema } from '@/lib/validation';

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ errors: { form: 'Invalid request' } }, { status: 403 });
  }

  const limit = await guard(request, 'lead');
  if (!limit.ok) return limit.limited();

  const body = await request.json().catch(() => null);
  if (!body) {
    return withHeaders(
      NextResponse.json({ errors: { form: 'Invalid request' } }, { status: 400 }),
      limit.headers,
    );
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return withHeaders(
      NextResponse.json({ errors: fieldErrors(parsed.error) }, { status: 422 }),
      limit.headers,
    );
  }

  const input = parsed.data;
  const score = spamScore(input);

  const lead = await createLead({
    name: input.name,
    email: input.email || null,
    phone: input.phone || null,
    company: input.company || null,
    website: input.website || null,
    service_slug: input.serviceSlug || null,
    package_slug: input.packageSlug || null,
    budget: input.budget || null,
    message: input.message || null,
    source: input.source,
    status: score >= SPAM_THRESHOLD ? 'spam' : 'new',
    spam_score: score,
    country: (typeof body.country === 'string' && body.country) || edgeCountry(request) || null,
    ip: clientIp(request) ?? null,
    user_agent: request.headers.get('user-agent')?.slice(0, 512) ?? null,
  });

  // A lead raised from the chat window gets stitched back to its transcript.
  if (typeof body.conversationId === 'string' && body.conversationId) {
    await touchConversation(body.conversationId, {
      lead_id: lead.id,
      name: input.name,
      email: input.email || null,
    }).catch(() => undefined);
  }

  return withHeaders(NextResponse.json({ ok: true, id: lead.id }, { status: 201 }), limit.headers);
}
