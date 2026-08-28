/**
 * End-to-end check against the live Supabase project.
 *
 *   npm run test:e2e
 *
 * Exercises the whole stack the way the app uses it — auth, the database, row
 * level security, storage, edge functions and realtime — then deletes
 * everything it created. Anything left behind is reported at the end.
 *
 * The negative cases matter most: several of these assert that an anonymous or
 * wrong-account client is *refused*. A change that quietly opens a table up
 * fails here rather than in production.
 */

import { config as loadEnv } from 'dotenv';

loadEnv({ path: '.env.local' });
loadEnv();

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const publishable =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const secret = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !publishable || !secret) {
  console.error('Missing Supabase environment variables. Check .env.local.');
  process.exit(1);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const admin: SupabaseClient<any> = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function anon(): SupabaseClient<any> {
  return createClient(url, publishable, { auth: { persistSession: false } });
}

/* ── Test harness ───────────────────────────────────────────────────── */

let passed = 0;
let failed = 0;
const failures: string[] = [];

async function check(name: string, run: () => Promise<void>) {
  try {
    await run();
    passed += 1;
    console.log(`  PASS  ${name}`);
  } catch (error) {
    failed += 1;
    failures.push(`${name}: ${(error as Error).message}`);
    console.log(`  FAIL  ${name}\n        ${(error as Error).message}`);
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function section(title: string) {
  console.log(`\n${title}`);
}

/** Random enough that two runs never collide, obvious enough to spot in a table. */
const stamp = Date.now().toString(36);
const customerEmail = `e2e-customer-${stamp}@example.com`;
const otherEmail = `e2e-other-${stamp}@example.com`;
const password = `E2e-${stamp}-Passw0rd!`;

const created: { users: string[]; orders: string[]; payments: string[]; objects: [string, string][] } = {
  users: [],
  orders: [],
  payments: [],
  objects: [],
};

const runStartedAt = new Date().toISOString();

async function main() {
  console.log(`End-to-end check against ${url}`);

  /* ── Public reads ─────────────────────────────────────────────────── */

  section('Public content (anonymous)');
  const guest = anon();

  await check('anonymous can read published catalog items', async () => {
    const { data, error } = await guest.from('catalog_items').select('item_id, name').limit(5);
    assert(!error, error?.message ?? '');
    assert((data?.length ?? 0) > 0, 'no catalog items came back');
  });

  await check('anonymous can read plans, reviews, faqs and payment methods', async () => {
    for (const table of ['catalog_plans', 'reviews', 'faqs', 'payment_methods', 'settings']) {
      const { error } = await guest.from(table).select('*').limit(1);
      assert(!error, `${table}: ${error?.message}`);
    }
  });

  section('Private tables are closed to anonymous callers');

  for (const table of ['orders', 'payments', 'invoices', 'leads', 'profiles', 'threads', 'staff']) {
    await check(`anonymous cannot read ${table}`, async () => {
      const { data, error } = await guest.from(table).select('*').limit(1);
      // RLS shows an empty result rather than an error, which is the correct
      // behaviour — either way, no row may come back.
      assert(error || (data?.length ?? 0) === 0, `${table} returned ${data?.length} row(s)`);
    });
  }

  await check('anonymous cannot insert a lead directly', async () => {
    const { error } = await guest.from('leads').insert({ name: 'RLS probe', email: 'probe@example.com' });
    assert(error, 'the insert was allowed');
  });

  await check('anonymous cannot write to the media bucket', async () => {
    const { error } = await guest.storage
      .from('media')
      .upload(`e2e-${stamp}.txt`, new Blob(['nope']), { contentType: 'text/plain' });
    assert(error, 'the upload was allowed');
  });

  /* ── Accounts ─────────────────────────────────────────────────────── */

  section('Accounts');

  let customerId = '';
  let otherId = '';

  await check('an account can be created and signs in', async () => {
    const { data, error } = await admin.auth.admin.createUser({
      email: customerEmail,
      password,
      email_confirm: true,
      user_metadata: { name: 'E2E Customer' },
    });
    assert(!error && data.user, error?.message ?? 'no user returned');
    customerId = data.user!.id;
    created.users.push(customerId);
  });

  await check('a second account can be created', async () => {
    const { data, error } = await admin.auth.admin.createUser({
      email: otherEmail,
      password,
      email_confirm: true,
      user_metadata: { name: 'E2E Other' },
    });
    assert(!error && data.user, error?.message ?? 'no user returned');
    otherId = data.user!.id;
    created.users.push(otherId);
  });

  await check('the sign-up trigger created a profile', async () => {
    const { data, error } = await admin.from('profiles').select('id, name, email').eq('id', customerId).single();
    assert(!error, error?.message ?? '');
    assert(data.email === customerEmail, `profile email is ${data.email}`);
    assert(data.name === 'E2E Customer', `profile name is ${data.name}`);
  });

  const customer = anon();
  const other = anon();

  await check('password sign-in works', async () => {
    const { data, error } = await customer.auth.signInWithPassword({ email: customerEmail, password });
    assert(!error && data.session, error?.message ?? 'no session');
  });

  await check('the second account signs in too', async () => {
    const { error } = await other.auth.signInWithPassword({ email: otherEmail, password });
    assert(!error, error?.message ?? '');
  });

  await check('a wrong password is refused', async () => {
    const client = anon();
    const { error } = await client.auth.signInWithPassword({ email: customerEmail, password: 'wrong-password' });
    assert(error, 'the wrong password was accepted');
  });

  await check('a signed-in customer is not staff', async () => {
    const { data } = await customer.from('staff').select('*');
    assert((data?.length ?? 0) === 0, 'a customer could read the staff table');
  });

  /* ── Orders and ownership ─────────────────────────────────────────── */

  section('Orders and row level security');

  let orderId = '';

  await check('an order can be raised for the customer', async () => {
    const { data, error } = await admin
      .from('orders')
      .insert({
        ref: `E2E-${stamp}`,
        item_id: 'website',
        item_name: 'Website',
        plan_id: 'web-starter',
        plan_name: 'Starter',
        price: 500,
        amount_due: 500,
        status: 'Awaiting payment',
        payment_status: 'unpaid',
        name: 'E2E Customer',
        email: customerEmail,
        user_id: customerId,
      })
      .select('id')
      .single();
    assert(!error && data, error?.message ?? '');
    orderId = data!.id;
    created.orders.push(orderId);
  });

  await check('the owner can read their own order', async () => {
    const { data, error } = await customer.from('orders').select('id, ref').eq('id', orderId).maybeSingle();
    assert(!error, error?.message ?? '');
    assert(data?.id === orderId, 'the owner could not see their own order');
  });

  await check('another account cannot read it', async () => {
    const { data } = await other.from('orders').select('id').eq('id', orderId).maybeSingle();
    assert(!data, 'another account read someone else’s order');
  });

  await check('the owner cannot change their own order', async () => {
    const { data } = await customer.from('orders').update({ amount_due: 1 }).eq('id', orderId).select('id');
    assert((data?.length ?? 0) === 0, 'a customer edited their own order');
  });

  await check('a guest order is claimed by matching email', async () => {
    const ref = `E2E-GUEST-${stamp}`;
    const { data: guestOrder } = await admin
      .from('orders')
      .insert({
        ref,
        item_id: 'chatbot',
        price: 300,
        amount_due: 300,
        name: 'E2E Customer',
        email: customerEmail,
      })
      .select('id')
      .single();
    created.orders.push(guestOrder!.id);

    // Email-only ownership is what the policy has to cover.
    const { data: visible } = await customer.from('orders').select('id').eq('id', guestOrder!.id).maybeSingle();
    assert(visible?.id === guestOrder!.id, 'an order matching the address was not visible');
  });

  /* ── Storage ──────────────────────────────────────────────────────── */

  section('Storage');

  const proofPath = `${customerId}/${stamp}.png`;
  // A one-pixel PNG, so the bucket's MIME allowlist is genuinely exercised.
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  );

  await check('the owner can upload a proof under their own prefix', async () => {
    const { error } = await customer.storage
      .from('proofs')
      .upload(proofPath, png, { contentType: 'image/png' });
    assert(!error, error?.message ?? '');
    created.objects.push(['proofs', proofPath]);
  });

  await check('another account cannot upload into that prefix', async () => {
    const { error } = await other.storage
      .from('proofs')
      .upload(`${customerId}/${stamp}-intruder.png`, png, { contentType: 'image/png' });
    assert(error, 'an upload into another account’s folder was allowed');
  });

  await check('another account cannot download the proof', async () => {
    const { error } = await other.storage.from('proofs').download(proofPath);
    assert(error, 'another account downloaded the proof');
  });

  await check('anonymous cannot download the proof', async () => {
    const { error } = await guest.storage.from('proofs').download(proofPath);
    assert(error, 'an anonymous caller downloaded the proof');
  });

  await check('the server can sign a URL for it', async () => {
    const { data, error } = await admin.storage.from('proofs').createSignedUrl(proofPath, 60);
    assert(!error && data?.signedUrl, error?.message ?? '');
    const response = await fetch(data!.signedUrl);
    assert(response.ok, `signed URL returned ${response.status}`);
  });

  await check('a non-image is refused by the proofs bucket', async () => {
    const { error } = await customer.storage
      .from('proofs')
      .upload(`${customerId}/${stamp}.exe`, new Blob(['MZ']), { contentType: 'application/x-msdownload' });
    assert(error, 'a disallowed MIME type was accepted');
  });

  await check('media is readable straight from the CDN', async () => {
    const mediaPath = `e2e-${stamp}.png`;
    const { error } = await admin.storage.from('media').upload(mediaPath, png, { contentType: 'image/png' });
    assert(!error, error?.message ?? '');
    created.objects.push(['media', mediaPath]);

    const response = await fetch(`${url}/storage/v1/object/public/media/${mediaPath}`);
    assert(response.ok, `public media URL returned ${response.status}`);
  });

  /* ── Payments ─────────────────────────────────────────────────────── */

  section('Payments');

  let paymentId = '';

  await check('the customer can submit a payment against their order', async () => {
    const { data, error } = await customer
      .from('payments')
      .insert({
        ref: `E2E-PAY-${stamp}`,
        order_id: orderId,
        user_id: customerId,
        email: customerEmail,
        name: 'E2E Customer',
        method: 'usdt-trc20',
        currency: 'USD',
        amount: 500,
        amount_usd: 500,
        proof_path: proofPath,
        status: 'submitted',
      })
      .select('id')
      .single();
    assert(!error && data, error?.message ?? '');
    paymentId = data!.id;
    created.payments.push(paymentId);
  });

  await check('the customer cannot submit one already marked verified', async () => {
    const { error } = await customer.from('payments').insert({
      ref: `E2E-PAY-CHEAT-${stamp}`,
      user_id: customerId,
      method: 'usdt-trc20',
      amount: 500,
      status: 'verified',
    });
    assert(error, 'a customer inserted a pre-verified payment');
  });

  await check('another account cannot read the payment', async () => {
    const { data } = await other.from('payments').select('id').eq('id', paymentId).maybeSingle();
    assert(!data, 'another account read the payment');
  });

  await check('verifying it settles the order', async () => {
    await admin.from('payments').update({ status: 'verified' }).eq('id', paymentId);
    await admin
      .from('orders')
      .update({ amount_paid: 500, payment_status: 'paid', status: 'Confirmed', verified: true })
      .eq('id', orderId);

    const { data } = await admin.from('orders').select('payment_status, status, verified').eq('id', orderId).single();
    assert(data, 'the order disappeared');
    assert(data.payment_status === 'paid', `payment_status is ${data.payment_status}`);
    assert(data.verified === true, 'the order was not marked verified');
  });

  await check('updated_at moved with the write', async () => {
    const { data } = await admin.from('orders').select('created_at, updated_at').eq('id', orderId).single();
    assert(data, 'the order disappeared');
    assert(data.updated_at > data.created_at, 'the updated_at trigger did not fire');
  });

  /* ── Constraints ──────────────────────────────────────────────────── */

  section('Constraints');

  await check('a duplicate order reference is rejected', async () => {
    const { error } = await admin.from('orders').insert({
      ref: `E2E-${stamp}`,
      item_id: 'website',
      name: 'Duplicate',
      email: customerEmail,
    });
    assert(error, 'a duplicate ref was accepted');
  });

  await check('a lead with neither email nor phone is rejected', async () => {
    const { error } = await admin.from('leads').insert({ name: 'Unreachable' });
    assert(error, 'an unreachable lead was accepted');
  });

  await check('a plan for a missing catalog item is rejected', async () => {
    const { error } = await admin.from('catalog_plans').insert({
      plan_id: `e2e-${stamp}`,
      item_id: 'no-such-item',
      name: 'Orphan',
    });
    assert(error, 'an orphaned plan was accepted');
  });

  await check('an out-of-range attendance is rejected', async () => {
    const { error } = await admin.from('enrollments').insert({
      class_id: '00000000-0000-0000-0000-000000000000',
      user_id: customerId,
      attendance: 140,
    });
    assert(error, 'attendance of 140% was accepted');
  });

  /* ── Edge functions ───────────────────────────────────────────────── */

  section('Edge functions');

  await check('inserting a lead fires the triggers and scores it', async () => {
    const { data, error } = await admin
      .from('leads')
      .insert({
        name: 'zzzzzzzzzzzzzzzzzzzzzzzzzz',
        email: `q7w8e9r0t1y2-${stamp}@example.com`,
        message:
          'crypto bitcoin casino https://a.example https://b.example https://c.example https://d.example',
        source: 'website',
        status: 'new',
      })
      .select('id')
      .single();
    assert(!error && data, error?.message ?? '');

    // net.http_post is queued, so the function answers a moment later.
    let scored: { spam_score: number; status: string } | null = null;
    for (let attempt = 0; attempt < 15; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const { data: row } = await admin
        .from('leads')
        .select('spam_score, status')
        .eq('id', data!.id)
        .single();
      if (Number(row?.spam_score) > 0) {
        scored = row as { spam_score: number; status: string };
        break;
      }
    }

    await admin.from('leads').delete().eq('id', data!.id);

    assert(scored, 'spam-check never updated the lead');
    assert(scored!.status === 'spam', `status is ${scored!.status}`);
  });

  await check('an edge function refuses an unsigned call', async () => {
    const response = await fetch(`${url}/functions/v1/daily-digest`, { method: 'POST' });
    assert(response.status === 401, `unsigned call returned ${response.status}`);
  });

  await check('daily-digest answers when it is signed', async () => {
    const response = await fetch(`${url}/functions/v1/daily-digest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
    });
    assert(response.ok, `signed call returned ${response.status}: ${await response.text()}`);
  });

  /* ── Registration and recovery without email ──────────────────────── */

  section('Registration and recovery without email');

  const walkInEmail = `e2e-walkin-${stamp}@example.com`;
  let walkInId = '';

  await check('registering produces an account that is usable immediately', async () => {
    // Exactly what `signUp()` in lib/auth.ts does: create it already confirmed
    // rather than calling signUp(), which would try to send a confirmation the
    // project has no provider for.
    const { data, error } = await admin.auth.admin.createUser({
      email: walkInEmail,
      password,
      email_confirm: true,
      user_metadata: { name: 'E2E Walk-in' },
    });
    assert(!error && data.user, error?.message ?? '');
    walkInId = data.user!.id;
    created.users.push(walkInId);

    assert(data.user!.email_confirmed_at, 'the account was left unconfirmed');

    // No confirmation step: it signs in on the spot.
    const client = anon();
    const { data: session, error: signInError } = await client.auth.signInWithPassword({
      email: walkInEmail,
      password,
    });
    assert(!signInError && session.session, signInError?.message ?? 'no session');
    await client.auth.signOut();
  });

  await check('a manager can set a customer password, and the old one stops working', async () => {
    const replacement = `Reset-${stamp}-Passw0rd!`;

    const { error } = await admin.auth.admin.updateUserById(walkInId, {
      password: replacement,
      email_confirm: true,
    });
    assert(!error, error?.message ?? '');

    const fresh = anon();
    const { error: newFails } = await fresh.auth.signInWithPassword({
      email: walkInEmail,
      password: replacement,
    });
    assert(!newFails, `the new password did not work: ${newFails?.message}`);
    await fresh.auth.signOut();

    const stale = anon();
    const { error: oldWorks } = await stale.auth.signInWithPassword({
      email: walkInEmail,
      password,
    });
    assert(oldWorks, 'the old password still worked');
  });

  await check('the guard that protects staff accounts sees a staff row', async () => {
    // setCustomerPasswordAction refuses when the target has a staff row, so
    // that lookup is the whole guard. It must be true for staff and false for
    // a customer, or the guard is either useless or blocks support.
    const { data: staffRow } = await admin
      .from('staff')
      .select('user_id')
      .limit(1)
      .maybeSingle();
    assert(staffRow, 'there is no staff account to test the guard against');

    const { data: onStaff } = await admin
      .from('staff')
      .select('user_id')
      .eq('user_id', staffRow!.user_id)
      .maybeSingle();
    assert(onStaff, 'the guard would not recognise a staff account');

    const { data: onCustomer } = await admin
      .from('staff')
      .select('user_id')
      .eq('user_id', walkInId)
      .maybeSingle();
    assert(!onCustomer, 'the guard would wrongly refuse a customer');
  });

  /* ── Notifications ────────────────────────────────────────────────── */

  section('Notifications');

  let teamNoteId = '';
  let ownNoteId = '';

  await check('a team notification is written', async () => {
    const { data, error } = await admin
      .from('notifications')
      .insert({ kind: 'system', title: `E2E team ${stamp}`, user_id: null })
      .select('id')
      .single();
    assert(!error && data, error?.message ?? '');
    teamNoteId = data!.id;
  });

  await check('a customer notification is written', async () => {
    const { data, error } = await admin
      .from('notifications')
      .insert({ kind: 'payment', title: `E2E own ${stamp}`, user_id: customerId })
      .select('id')
      .single();
    assert(!error && data, error?.message ?? '');
    ownNoteId = data!.id;
  });

  await check('the customer sees their own notification', async () => {
    const { data } = await customer.from('notifications').select('id').eq('id', ownNoteId).maybeSingle();
    assert(data?.id === ownNoteId, 'the owner could not see their own notification');
  });

  await check('the customer cannot see the team notification', async () => {
    const { data } = await customer.from('notifications').select('id').eq('id', teamNoteId).maybeSingle();
    assert(!data, 'a customer read a team notification');
  });

  await check('another account cannot see it either', async () => {
    const { data } = await other.from('notifications').select('id').eq('id', ownNoteId).maybeSingle();
    assert(!data, 'another account read someone else’s notification');
  });

  await check('anonymous sees no notifications at all', async () => {
    const { data } = await guest.from('notifications').select('id').limit(1);
    assert((data?.length ?? 0) === 0, 'an anonymous caller read notifications');
  });

  await check('the customer can mark their own read', async () => {
    const { data } = await customer
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', ownNoteId)
      .select('id');
    assert((data?.length ?? 0) === 1, 'the owner could not mark their own read');
  });

  await check('the customer cannot mark the team one read', async () => {
    const { data } = await customer
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', teamNoteId)
      .select('id');
    assert((data?.length ?? 0) === 0, 'a customer wrote to a team notification');
  });

  /* ── Rate limiting ────────────────────────────────────────────────── */

  section('Rate limiting');

  await check('the Lua limiter counts, refuses and expires correctly', async () => {
    if (!process.env.REDIS_URL) {
      // Not a failure: the app is designed to run without Redis.
      console.log('        (REDIS_URL is not set, so the in-process fallback is what runs)');
      return;
    }

    const { default: RedisClient } = await import('ioredis');
    const { RATE_LIMIT_LUA } = await import('../lib/redis-scripts');

    const client = new RedisClient(process.env.REDIS_URL, {
      connectTimeout: 8000,
      commandTimeout: 5000,
      tls: process.env.REDIS_URL.startsWith('rediss://') ? {} : undefined,
    }) as InstanceType<typeof RedisClient> & {
      rateLimit(key: string, window: number): Promise<[number, number]>;
    };

    client.defineCommand('rateLimit', { numberOfKeys: 1, lua: RATE_LIMIT_LUA });

    const key = `e2e:rl:${stamp}`;
    try {
      const first = await client.rateLimit(key, 60_000);
      assert(first[0] === 1, `first call counted ${first[0]}`);
      assert(first[1] > 0 && first[1] <= 60_000, `ttl was ${first[1]}`);

      for (let i = 0; i < 4; i += 1) await client.rateLimit(key, 60_000);
      const sixth = await client.rateLimit(key, 60_000);
      assert(sixth[0] === 6, `sixth call counted ${sixth[0]}`);

      // The window must not be extended by traffic inside it.
      assert(sixth[1] <= first[1], 'the window was extended by a later request');

      // A counter left without an expiry has to repair itself.
      await client.persist(key);
      const repaired = await client.rateLimit(key, 60_000);
      assert(repaired[1] > 0, 'a counter with no expiry was not repaired');

      await client.del(key);
    } finally {
      client.disconnect();
    }
  });

  /* ── Realtime ─────────────────────────────────────────────────────── */

  section('Realtime');

  await check('the owner receives a change to their own order', async () => {
    const stream = anon();
    await stream.auth.signInWithPassword({ email: customerEmail, password });

    let lastStatus = 'never subscribed';

    const outcome = await new Promise<string>((resolve) => {
      stream
        .channel(`e2e-${stamp}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
          (payload) => resolve(`received ${payload.eventType}`),
        )
        .subscribe(async (status, error) => {
          lastStatus = status;
          // Surface a refused subscription as itself rather than as a timeout:
          // a broken policy and a slow socket need different fixes.
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            resolve(`subscription ${status}${error ? `: ${error.message}` : ''}`);
            return;
          }
          if (status !== 'SUBSCRIBED') return;

          // The write has to happen after the socket is listening.
          const { error: writeError } = await admin
            .from('orders')
            .update({ admin_notes: `touched ${stamp}` })
            .eq('id', orderId);
          if (writeError) resolve(`write failed: ${writeError.message}`);
        });

      setTimeout(() => resolve(`timed out (last status: ${lastStatus})`), 30000);
    });

    await stream.auth.signOut();
    assert(outcome.startsWith('received'), outcome);
  });

  /* ── Cleanup ──────────────────────────────────────────────────────── */

  section('Cleanup');

  await check('everything this run created is removed', async () => {
    for (const [bucket, path] of created.objects) {
      await admin.storage.from(bucket).remove([path]);
    }
    // Three things in this run write notifications: the two written directly
    // above, the lead-notify trigger firing on the planted spam lead (it runs
    // before spam-check flags it), and daily-digest when the window has
    // anything in it. All three have to go, and none of them may take a real
    // notification with it — hence matching on this run's stamp, and bounding
    // the digest by when the run started.
    await admin.from('notifications').delete().like('title', `E2E%${stamp}`);
    await admin.from('notifications').delete().like('body', `%${stamp}%`);
    await admin
      .from('notifications')
      .delete()
      .eq('kind', 'digest')
      .is('user_id', null)
      .gte('created_at', runStartedAt);
    if (created.payments.length) await admin.from('payments').delete().in('id', created.payments);
    if (created.orders.length) await admin.from('orders').delete().in('id', created.orders);
    // Deleting the account cascades the profile with it.
    for (const id of created.users) await admin.auth.admin.deleteUser(id);

    const { count } = await admin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .like('ref', `E2E-%${stamp}%`);
    assert(!count, `${count} test order(s) survived`);

    const { count: notes } = await admin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', runStartedAt);
    assert(!notes, `${notes} notification(s) from this run survived`);
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failures.length) {
    console.log('\nFailures:');
    for (const failure of failures) console.log(`  - ${failure}`);
    process.exit(1);
  }

  // The realtime socket keeps the event loop alive, so say when we are done
  // rather than leaving the process hanging on a connection nobody is reading.
  process.exit(0);
}

main().catch((error) => {
  console.error('\nThe run itself failed:', error);
  process.exit(1);
});
