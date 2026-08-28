/**
 * What the Supabase project currently holds.
 *
 *   npm run db:status
 */

import { createServiceClient } from '../lib/supabase/service';
import { BUCKETS } from '../lib/supabase/config';
import type { KeyedTable } from '../lib/supabase/types';

const supabase = createServiceClient();

const TABLES: KeyedTable[] = [
  'catalog_items',
  'catalog_plans',
  'examples',
  'reviews',
  'faqs',
  'settings',
  'academy_classes',
  'leads',
  'bookings',
  'contact_messages',
  'subscribers',
  'chat_conversations',
  'chat_messages',
  'orders',
  'invoices',
  'payment_methods',
  'payments',
  'threads',
  'thread_messages',
  'customer_files',
  'enrollments',
  'audit_log',
];

async function main() {
  console.log(`Project ${process.env.NEXT_PUBLIC_SUPABASE_URL}\n`);

  console.log('Tables');
  for (const table of TABLES) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    console.log(`  ${table.padEnd(20)} ${error ? `ERROR ${error.message}` : `rows=${count ?? 0}`}`);
  }

  console.log('\nStorage');
  for (const bucket of Object.values(BUCKETS)) {
    const { data, error } = await supabase.storage.from(bucket).list('', { limit: 1000 });
    console.log(
      `  ${bucket.padEnd(20)} ${error ? `ERROR ${error.message}` : `objects=${data?.length ?? 0}`}`,
    );
  }

  console.log('\nTeam');
  const { data } = await supabase.from('staff').select('role, profiles(email)');
  const team = (data ?? []) as unknown as { role: string; profiles: { email: string | null } | null }[];

  for (const member of team) {
    const email = member.profiles?.email ?? '(no profile)';
    console.log(`  ${email.padEnd(36)} ${member.role}`);
  }
  if (team.length === 0) console.log('  NONE — run npm run db:create-admin');

  console.log('\nAccounts');
  const { data: users } = await supabase.auth.admin.listUsers({ perPage: 200 });
  console.log(`  ${users?.users.length ?? 0} account(s)`);

  console.log('\nNotifications');
  const { count: unread } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .is('read_at', null)
    .is('user_id', null);
  console.log(`  ${unread ?? 0} unread for the team`);
  console.log('  delivered in-app; no mail provider is involved');

  console.log('\nCache and rate limiting');
  console.log(
    process.env.REDIS_URL
      ? '  Redis configured — counters and cache are shared across instances'
      : '  REDIS_URL is not set — per-instance fallback (fine on a single node)',
  );
}

main().catch((error) => {
  console.error('\nStatus check failed:', error);
  process.exit(1);
});
