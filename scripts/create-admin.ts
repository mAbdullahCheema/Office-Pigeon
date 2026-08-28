/**
 * Creates the first owner account, or promotes an existing one.
 *
 *   npm run db:create-admin
 *
 * Reads ADMIN_EMAIL, ADMIN_PASSWORD and ADMIN_NAME from the environment. Safe
 * to re-run: an account that already exists is promoted rather than duplicated.
 */

import { createServiceClient } from '../lib/supabase/service';

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME ?? 'Office Pigeon Admin';

if (!email || !password) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local and run again.');
  process.exit(1);
}

const supabase = createServiceClient();

async function main() {
  const address = email!.toLowerCase();

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .ilike('email', address)
    .maybeSingle();

  let userId = existing?.id ?? null;

  if (userId) {
    console.log(`= ${address} already has an account`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: address,
      password,
      // The first owner is created by whoever holds the secret key, so there is
      // nobody left to verify the address to.
      email_confirm: true,
      user_metadata: { name },
    });

    if (error || !data.user) {
      console.error(`Could not create ${address}: ${error?.message}`);
      process.exit(1);
    }
    userId = data.user.id;
    console.log(`+ created ${address}`);
  }

  const { error } = await supabase.from('staff').upsert({ user_id: userId, role: 'owner' });
  if (error) {
    console.error(`Could not grant the owner role: ${error.message}`);
    process.exit(1);
  }

  console.log(`+ ${address} is an owner`);
  console.log('\nSign in at /login with that address and password.');
}

main().catch((error) => {
  console.error('\nFailed:', error);
  process.exit(1);
});
