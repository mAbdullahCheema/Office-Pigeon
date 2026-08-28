import { notifyStaff, rest } from '../_shared/notify.ts';

/**
 * Summarises yesterday's activity for the team.
 *
 * Invoked by `pg_cron` at 06:00 UTC. Nothing is passed in: the window is always
 * the last twenty-four hours, so a missed run simply overlaps the next rather
 * than leaving a gap that has to be reconciled.
 */

async function countSince(table: string, from: string): Promise<number> {
  // `head` plus an exact count returns the number in a header and no rows.
  const response = await rest(`${table}?select=id&created_at=gte.${from}`, {
    method: 'HEAD',
    headers: { Prefer: 'count=exact' },
  });

  if (!response.ok) throw new Error(`${table}: ${response.status}`);

  // content-range looks like `＊/12`; the total is after the slash.
  const total = response.headers.get('content-range')?.split('/')[1];
  return Number(total) || 0;
}

Deno.serve(async () => {
  const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  let leads: number;
  let bookings: number;
  let messages: number;
  let payments: number;

  try {
    [leads, bookings, messages, payments] = await Promise.all([
      countSince('leads', from),
      countSince('bookings', from),
      countSince('contact_messages', from),
      countSince('payments', from),
    ]);
  } catch (error) {
    console.error('[daily-digest] read failed:', (error as Error).message);
    return Response.json({ ok: false }, { status: 500 });
  }

  const total = leads + bookings + messages + payments;
  console.log(`digest: ${leads} leads, ${bookings} bookings, ${messages} messages, ${payments} payments`);

  if (total === 0) {
    return Response.json({ ok: true, skipped: 'nothing to report' });
  }

  const parts = [
    leads ? `${leads} lead${leads === 1 ? '' : 's'}` : '',
    bookings ? `${bookings} booking${bookings === 1 ? '' : 's'}` : '',
    messages ? `${messages} contact message${messages === 1 ? '' : 's'}` : '',
    payments ? `${payments} payment${payments === 1 ? '' : 's'}` : '',
  ].filter(Boolean);

  const written = await notifyStaff({
    kind: 'digest',
    title: `Yesterday: ${total} new item${total === 1 ? '' : 's'}`,
    body: parts.join(', '),
    href: '/dashboard',
  });

  return Response.json({ ok: true, total, notified: written });
});
