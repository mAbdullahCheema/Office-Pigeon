import { notifyStaff, rest, type WebhookPayload } from '../_shared/notify.ts';

/**
 * Raises an alert when a lead lands, and stamps the row so the dashboard can
 * show that the team has been told.
 *
 * Triggered by an `after insert` webhook on `public.leads`. The trigger signs
 * its call with the service key and the function is deployed with JWT
 * verification on, so nothing else can invoke it.
 */

type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  service_slug: string | null;
  budget: string | null;
  source: string;
  country: string | null;
  message: string | null;
  status: string;
};

Deno.serve(async (request) => {
  const payload = (await request.json().catch(() => null)) as WebhookPayload<Lead> | null;
  const lead = payload?.record;

  if (!lead?.id) {
    return Response.json({ ok: false, reason: 'no lead payload' }, { status: 400 });
  }

  // Anything the app already scored as spam is not worth an alert.
  if (lead.status === 'spam') {
    return Response.json({ ok: true, skipped: 'spam' });
  }

  const detail = [
    lead.email ?? lead.phone,
    lead.company,
    lead.service_slug,
    lead.budget,
    lead.country,
  ]
    .filter(Boolean)
    .join(' · ');

  const written = await notifyStaff({
    kind: 'lead',
    title: `New lead: ${lead.name}`,
    body: [detail, lead.message?.slice(0, 300)].filter(Boolean).join(' — '),
    href: '/dashboard/manage/leads',
  });

  if (written) {
    const response = await rest(`leads?id=eq.${lead.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ notified_at: new Date().toISOString() }),
    });
    if (!response.ok) console.error('[lead-notify] stamp failed:', await response.text());
  }

  return Response.json({ ok: true, notified: written });
});
