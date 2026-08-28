import 'server-only';

import { admin } from './supabase/admin';
import type { NotificationKind } from './supabase/types';

/**
 * In-app notifications.
 *
 * The app used to send its own email for these — a new lead, a payment
 * submitted, the daily digest. That needed a third-party mail provider, an API
 * key, a verified sending domain, and it still failed silently when any of the
 * three was wrong. A row in a table and the Realtime subscription the dashboard
 * already holds does the same job with none of that: staff see the alert the
 * moment it is written, and it is still there tomorrow if nobody was looking.
 *
 * Nothing in this app sends email at all: registration creates a confirmed
 * account, and a locked-out customer is recovered by a manager from the
 * dashboard rather than by a link that has to reach an inbox.
 */

type Notification = {
  kind?: NotificationKind;
  title: string;
  body?: string;
  /** Where clicking it should go, relative to the site root. */
  href?: string;
};

async function write(notification: Notification & { user_id: string | null }) {
  try {
    const { error } = await admin().from('notifications').insert({
      kind: notification.kind ?? 'system',
      title: notification.title,
      body: notification.body ?? null,
      href: notification.href ?? null,
      user_id: notification.user_id,
    });
    if (error) throw new Error(error.message);
    return true;
  } catch (error) {
    // A failed notification must never fail the thing being notified about.
    console.error('[notify] could not record notification:', (error as Error).message);
    return false;
  }
}

/** Tells the team. Every staff member sees it. */
export function notifyStaff(notification: Notification) {
  return write({ ...notification, user_id: null });
}

/** Tells one customer. Only they see it. */
export function notifyUser(userId: string, notification: Notification) {
  return write({ ...notification, user_id: userId });
}
