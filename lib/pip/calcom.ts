import 'server-only';

import { calcomConfig } from './config';

/**
 * The free consultation, on Cal.com.
 *
 * Two operations: read the open slots, and take one. Reading is cheap and safe;
 * taking one writes to a real calendar and emails a real person, so the route
 * only ever calls `book` after the visitor has confirmed a specific slot.
 */

export type Slot = {
  /** Exactly as Cal.com returned it, offset included. */
  start: string;
  /** Grouping key in the event owner's day, `YYYY-MM-DD`. */
  day: string;
};

export type Booking = {
  id: number;
  uid: string;
  start: string;
  end: string;
  meetingUrl: string | null;
  /** Cancel/reschedule page for the visitor. */
  manageUrl: string;
};

export class CalcomError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'CalcomError';
    this.status = status;
  }
}

const TIMEOUT_MS = 20_000;

/**
 * Reads are retried once.
 *
 * A dropped request to Cal.com costs the visitor the whole booking flow — Pip
 * has to tell them the calendar is unavailable and fall back to a link. One
 * retry turns most of those into a slightly slower success. Writes are never
 * retried: a booking that actually landed before the connection dropped would
 * be taken twice.
 */
async function call<T>(
  path: string,
  version: string,
  init: RequestInit = {},
): Promise<T> {
  const idempotent = (init.method ?? 'GET') === 'GET';

  try {
    return await attempt<T>(path, version, init);
  } catch (error) {
    if (!idempotent || (error instanceof CalcomError && error.status < 500 && error.status !== 0)) {
      throw error;
    }
    return attempt<T>(path, version, init);
  }
}

async function attempt<T>(
  path: string,
  version: string,
  init: RequestInit = {},
): Promise<T> {
  const config = calcomConfig();
  if (!config) throw new CalcomError('Booking is not configured', 503);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`https://api.cal.com/v2${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'cal-api-version': version,
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
      cache: 'no-store',
    });

    const body = (await response.json().catch(() => null)) as
      | { status?: string; data?: T; error?: { message?: string } }
      | null;

    if (!response.ok || body?.status === 'error') {
      throw new CalcomError(
        body?.error?.message || `Cal.com refused the request (${response.status})`,
        response.status,
      );
    }

    return body?.data as T;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Open slots over the next `days`, in the visitor's own timezone.
 *
 * Cal.com already applies the event's notice period, buffers and booking
 * window, so whatever comes back is genuinely bookable — there is no second
 * availability rule to keep in step here.
 */
export async function listSlots(timeZone: string, days = 7, limit = 12): Promise<Slot[]> {
  const now = new Date();
  const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const query = new URLSearchParams({
    eventTypeId: String(calcomConfig()?.eventTypeId ?? ''),
    start: now.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
    timeZone,
  });

  const data = await call<Record<string, { start: string }[]>>(
    `/slots?${query.toString()}`,
    '2024-09-04',
  );

  const slots: Slot[] = [];
  for (const [day, entries] of Object.entries(data ?? {})) {
    for (const entry of entries) {
      if (entry?.start) slots.push({ start: entry.start, day });
    }
  }

  // Chronological, then capped: a visitor picks from a handful, and the whole
  // list would otherwise be a hundred half-hours of noise in the prompt.
  slots.sort((a, b) => a.start.localeCompare(b.start));
  return slots.slice(0, limit);
}

export type BookingRequest = {
  start: string;
  name: string;
  email: string;
  phone: string;
  timeZone: string;
  notes?: string;
};

/** Takes a slot. The visitor must have confirmed this exact start time. */
export async function book(request: BookingRequest): Promise<Booking> {
  const config = calcomConfig();
  if (!config) throw new CalcomError('Booking is not configured', 503);

  const data = await call<{
    id: number;
    uid: string;
    start: string;
    end: string;
    meetingUrl?: string | null;
  }>('/bookings', '2024-08-13', {
    method: 'POST',
    body: JSON.stringify({
      start: request.start,
      eventTypeId: config.eventTypeId,
      attendee: {
        name: request.name,
        email: request.email,
        phoneNumber: request.phone,
        timeZone: request.timeZone,
        language: 'en',
      },
      // The event type marks the phone field required, and Cal.com validates
      // the responses map rather than the attendee object.
      bookingFieldsResponses: { attendeePhoneNumber: request.phone },
      ...(request.notes ? { metadata: { note: request.notes.slice(0, 400) } } : {}),
    }),
  });

  return {
    id: data.id,
    uid: data.uid,
    start: data.start,
    end: data.end,
    meetingUrl: data.meetingUrl ?? null,
    manageUrl: `https://cal.com/booking/${data.uid}`,
  };
}

/** Gives a slot back. The visitor must have confirmed this specific booking. */
export async function cancel(uid: string, reason: string): Promise<void> {
  await call(`/bookings/${encodeURIComponent(uid)}/cancel`, '2024-08-13', {
    method: 'POST',
    body: JSON.stringify({ cancellationReason: reason.slice(0, 200) }),
  });
}
