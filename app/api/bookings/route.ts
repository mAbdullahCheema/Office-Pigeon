import { NextResponse } from 'next/server';

import { guard, sameOrigin, withHeaders } from '@/lib/api-guard';
import { createBooking, takenSlots } from '@/lib/data';
import { bookingSchema, fieldErrors } from '@/lib/validation';

export async function GET(request: Request) {
  const limit = await guard(request, 'api');
  if (!limit.ok) return limit.limited();

  const url = new URL(request.url);
  const from = url.searchParams.get('from') ?? new Date().toISOString();
  const to =
    url.searchParams.get('to') ?? new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString();

  const taken = await takenSlots(from, to);
  return withHeaders(
    // The calendar changes as bookings land, so a stale shared copy would show
    // a slot that is already gone.
    NextResponse.json({ taken }, { headers: { 'Cache-Control': 'no-store' } }),
    limit.headers,
  );
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ errors: { form: 'Invalid request' } }, { status: 403 });
  }

  const limit = await guard(request, 'booking');
  if (!limit.ok) return limit.limited();

  const body = await request.json().catch(() => null);
  if (!body) {
    return withHeaders(
      NextResponse.json({ errors: { form: 'Invalid request' } }, { status: 400 }),
      limit.headers,
    );
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return withHeaders(
      NextResponse.json({ errors: fieldErrors(parsed.error) }, { status: 422 }),
      limit.headers,
    );
  }

  const input = parsed.data;

  // Refuse a slot somebody else already holds.
  const clash = await takenSlots(input.slotAt, input.slotAt);
  if (clash.length > 0) {
    return withHeaders(
      NextResponse.json({ errors: { slotAt: 'That slot was just taken. Pick another one.' } }, { status: 409 }),
      limit.headers,
    );
  }

  const booking = await createBooking({
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    company: input.company || null,
    service_slug: input.serviceSlug || null,
    slot_at: input.slotAt,
    timezone: input.timezone,
    channel: input.channel,
    notes: input.notes || null,
    status: 'requested',
  });

  return withHeaders(NextResponse.json({ ok: true, id: booking.id }, { status: 201 }), limit.headers);
}
