import 'server-only';

import { admin } from './supabase/admin';
import type { StaffUser } from './auth';

/** Records a staff action. Failures never block the action being recorded. */
export async function audit(
  staff: StaffUser | null,
  action: string,
  target?: string,
  detail?: string,
) {
  try {
    const { error } = await admin().from('audit_log').insert({
      actor_id: staff?.id ?? null,
      actor_name: staff?.name ?? null,
      action,
      target: target ?? null,
      detail: detail ?? null,
    });
    if (error) throw new Error(error.message);
  } catch (error) {
    console.error('[audit] failed to write entry:', error);
  }
}
