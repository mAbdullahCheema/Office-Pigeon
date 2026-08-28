-- Turns row level security on for every table, and writes the first pass of the
-- policies.
--
-- These policies reference the helpers while they still lived in `public`;
-- `move_role_helpers_to_private_schema` replaces every one of them. What
-- survives from this migration is the `enable row level security` loop.

do $$
declare
  t text;
begin
  foreach t in array array[
    'staff', 'profiles', 'catalog_items', 'catalog_plans', 'examples', 'reviews',
    'faqs', 'settings', 'academy_classes', 'leads', 'bookings', 'contact_messages',
    'subscribers', 'chat_conversations', 'chat_messages', 'orders', 'invoices',
    'payment_methods', 'payments', 'threads', 'thread_messages', 'customer_files',
    'enrollments', 'audit_log'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end;
$$;

/* Published marketing content: readable by anyone. */

create policy "published catalog items are public"
  on public.catalog_items for select to anon, authenticated
  using (published or public.is_staff());

create policy "catalog plans are public"
  on public.catalog_plans for select to anon, authenticated
  using (true);

create policy "published examples are public"
  on public.examples for select to anon, authenticated
  using (published or public.is_staff());

create policy "published reviews are public"
  on public.reviews for select to anon, authenticated
  using (published or public.is_staff());

create policy "published faqs are public"
  on public.faqs for select to anon, authenticated
  using (published or public.is_staff());

create policy "published classes are public"
  on public.academy_classes for select to anon, authenticated
  using (published or public.is_staff());

create policy "settings are public"
  on public.settings for select to anon, authenticated
  using (true);

create policy "enabled payment methods are public"
  on public.payment_methods for select to anon, authenticated
  using (enabled or public.is_staff());

/* Editable content: staff writes. */

do $$
declare
  t text;
begin
  foreach t in array array[
    'catalog_items', 'catalog_plans', 'examples', 'reviews', 'faqs', 'settings',
    'academy_classes', 'payment_methods'
  ]
  loop
    execute format(
      'create policy "editors write %1$s" on public.%1$I
         for all to authenticated
         using (public.can_edit()) with check (public.can_edit())',
      t
    );
  end loop;
end;
$$;

/* Private tables: staff read everything, editors change it. */

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'leads', 'bookings', 'contact_messages', 'subscribers',
    'chat_conversations', 'chat_messages', 'orders', 'invoices', 'payments',
    'threads', 'thread_messages', 'customer_files', 'enrollments', 'audit_log'
  ]
  loop
    execute format(
      'create policy "staff read %1$s" on public.%1$I
         for select to authenticated using (public.is_staff())',
      t
    );
    execute format(
      'create policy "editors insert %1$s" on public.%1$I
         for insert to authenticated with check (public.can_edit())',
      t
    );
    execute format(
      'create policy "editors update %1$s" on public.%1$I
         for update to authenticated
         using (public.can_edit()) with check (public.can_edit())',
      t
    );
    execute format(
      'create policy "editors delete %1$s" on public.%1$I
         for delete to authenticated using (public.can_edit())',
      t
    );
  end loop;
end;
$$;

/* The team itself. */

create policy "staff see the team"
  on public.staff for select to authenticated
  using (public.is_staff());

create policy "owners and admins change the team"
  on public.staff for all to authenticated
  using (public.can_manage_team()) with check (public.can_manage_team());

/* A customer's own records. */

create policy "own profile is readable"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "own profile is editable"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "own orders are readable"
  on public.orders for select to authenticated
  using ((select auth.uid()) = user_id or lower(email) = public.auth_email());

create policy "own invoices are readable"
  on public.invoices for select to authenticated
  using ((select auth.uid()) = user_id or lower(email) = public.auth_email());

create policy "own payments are readable"
  on public.payments for select to authenticated
  using ((select auth.uid()) = user_id or lower(email) = public.auth_email());

create policy "own payments can be submitted"
  on public.payments for insert to authenticated
  with check ((select auth.uid()) = user_id and status = 'submitted');

create policy "own visible files are readable"
  on public.customer_files for select to authenticated
  using ((select auth.uid()) = user_id and visible);

create policy "own files can be uploaded"
  on public.customer_files for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "own files can be removed"
  on public.customer_files for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "own threads are readable"
  on public.threads for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "own threads can be opened"
  on public.threads for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "own thread messages are readable"
  on public.thread_messages for select to authenticated
  using (
    exists (
      select 1 from public.threads
      where threads.id = thread_messages.thread_id
        and threads.user_id = (select auth.uid())
    )
  );

create policy "own thread messages can be posted"
  on public.thread_messages for insert to authenticated
  with check (
    (select auth.uid()) = author_id
    and exists (
      select 1 from public.threads
      where threads.id = thread_messages.thread_id
        and threads.user_id = (select auth.uid())
    )
  );

create policy "own enrollments are readable"
  on public.enrollments for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "own conversations are readable"
  on public.chat_conversations for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "own chat messages are readable"
  on public.chat_messages for select to authenticated
  using (
    exists (
      select 1 from public.chat_conversations
      where chat_conversations.id = chat_messages.conversation_id
        and chat_conversations.user_id = (select auth.uid())
    )
  );
