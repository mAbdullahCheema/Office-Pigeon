/**
 * Shared helpers for the edge functions.
 *
 * Alerts are rows in `public.notifications`, not email. The dashboard holds a
 * Realtime subscription to that table, so writing a row is what puts a new lead
 * in front of the team — no mail provider, no API key, no sending domain, and
 * nothing to fail silently when one of those is wrong.
 */

/** A client's worth of config, injected into every function by the platform. */
function service() {
  return {
    url: Deno.env.get('SUPABASE_URL')!,
    key: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  };
}

/**
 * A minimal PostgREST call.
 *
 * These functions need two verbs between them, so pulling in supabase-js would
 * cost a cold start for nothing.
 */
export async function rest(
  path: string,
  init: RequestInit & { method: string },
): Promise<Response> {
  const { url, key } = service();
  return fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
}

export type NotificationKind =
  | 'lead'
  | 'payment'
  | 'booking'
  | 'contact'
  | 'message'
  | 'digest'
  | 'system';

/**
 * Records an alert for the team.
 *
 * Returns false rather than throwing: a failed notification must never turn a
 * lead into a failed insert, because the trigger runs inside that transaction's
 * aftermath and the row matters more than the alert.
 */
export async function notifyStaff(notification: {
  kind: NotificationKind;
  title: string;
  body?: string;
  href?: string;
}): Promise<boolean> {
  const response = await rest('notifications', {
    method: 'POST',
    body: JSON.stringify({
      kind: notification.kind,
      title: notification.title,
      body: notification.body ?? null,
      href: notification.href ?? null,
      user_id: null,
    }),
  });

  if (!response.ok) {
    console.error('[notify] could not write notification:', await response.text());
    return false;
  }
  return true;
}

export type WebhookPayload<T> = {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  record: T;
  old_record: T | null;
};
