import { rest, type WebhookPayload } from '../_shared/notify.ts';
import { spamScore, SPAM_THRESHOLD } from '../_shared/spam.ts';

/**
 * Re-scores an inbound submission after it lands.
 *
 * The app already scores on the way in; this is the second pair of eyes for
 * anything that reached the table another way, and the place to tune scoring
 * without a deploy of the site. Triggered by `after insert` on `public.leads`
 * and `public.contact_messages`.
 */

type Submission = {
  id: string;
  name: string | null;
  email: string | null;
  message: string | null;
  spam_score: number;
  status: string;
};

const SCORED_TABLES = new Set(['leads', 'contact_messages']);

Deno.serve(async (request) => {
  const payload = (await request.json().catch(() => null)) as WebhookPayload<Submission> | null;
  const record = payload?.record;
  const table = payload?.table;

  if (!record?.id || !table || !SCORED_TABLES.has(table)) {
    return Response.json({ ok: false, reason: 'unrecognised event' }, { status: 400 });
  }

  const score = spamScore(record);
  console.log(`${table}/${record.id} scored ${score}`);

  if (score === Number(record.spam_score)) {
    return Response.json({ ok: true, score, changed: false });
  }

  const patch: Record<string, unknown> = { spam_score: score };
  if (score >= SPAM_THRESHOLD) patch.status = 'spam';

  const response = await rest(`${table}?id=eq.${record.id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });

  if (!response.ok) {
    console.error('[spam-check] update failed:', await response.text());
    return Response.json({ ok: false }, { status: 500 });
  }

  return Response.json({ ok: true, score, flagged: score >= SPAM_THRESHOLD });
});
