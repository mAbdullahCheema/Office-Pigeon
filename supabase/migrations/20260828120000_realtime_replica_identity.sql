-- Realtime could not deliver UPDATE or DELETE to a signed-in subscriber.
--
-- Realtime authorises each subscriber by running that account's row level
-- security policies against the change record, and for an UPDATE it checks the
-- old record as well as the new one. Under the default replica identity the old
-- record in the write-ahead log carries only the primary key, so a policy of
-- the form `user_id = auth.uid()` has no `user_id` to test and cannot pass. The
-- message is then dropped for that subscriber — silently, because from the
-- socket's point of view nothing went wrong.
--
-- The effect was that `LiveRefresh` worked for nothing that matters: an order
-- moving status, a payment being verified and a staff reply landing are all
-- updates. Only inserts got through, and only because an insert has no old
-- record to check.
--
-- `replica identity full` writes the whole previous row to the WAL instead of
-- just the key. That costs write-ahead log volume proportional to row width on
-- every update and delete, which at this scale is not measurable, and it is the
-- only way to have row level security and Postgres Changes at the same time.
--
-- Only the tables actually in the `supabase_realtime` publication are changed;
-- there is nothing to gain from paying the cost on a table nobody subscribes to.
do $$
declare
  t text;
begin
  foreach t in array array[
    'orders', 'payments', 'invoices', 'threads', 'thread_messages',
    'chat_conversations', 'chat_messages', 'customer_files', 'enrollments',
    'leads', 'bookings', 'contact_messages', 'notifications'
  ]
  loop
    execute format('alter table public.%I replica identity full', t);
  end loop;
end;
$$;
