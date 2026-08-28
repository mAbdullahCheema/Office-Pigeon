-- Tables the dashboard subscribes to. Realtime honours RLS, so a customer only
-- ever receives changes to rows their own policies already let them read.
do $$
declare
  t text;
begin
  foreach t in array array[
    'orders', 'payments', 'invoices', 'threads', 'thread_messages',
    'chat_conversations', 'chat_messages', 'customer_files', 'enrollments',
    'leads', 'bookings', 'contact_messages'
  ]
  loop
    execute format('alter publication supabase_realtime add table public.%I', t);
  end loop;
end;
$$;
