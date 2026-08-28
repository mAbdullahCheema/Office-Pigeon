-- The role helpers were reachable as PostgREST RPC endpoints because they lived
-- in `public`. Nothing should be able to call a SECURITY DEFINER function over
-- the API, so they move to a schema PostgREST does not expose. Policies still
-- reach them; `/rest/v1/rpc/is_staff` no longer exists.
--
-- This is the migration that defines the policies actually in force. Every
-- policy from the two before it is dropped and rewritten here.

create schema if not exists private;
grant usage on schema private to anon, authenticated, service_role;

create or replace function private.staff_role()
returns public.staff_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.staff where user_id = (select auth.uid());
$$;

create or replace function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.staff where user_id = (select auth.uid()));
$$;

create or replace function private.can_edit()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.staff_role() in ('owner', 'admin', 'editor');
$$;

create or replace function private.can_manage_team()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.staff_role() in ('owner', 'admin');
$$;

create or replace function private.auth_email()
returns text
language sql
stable
set search_path = ''
as $$
  select lower(nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'email', ''));
$$;

/* ── Rebuild every policy against the private helpers ────────────────── */

do $$
declare
  p record;
begin
  for p in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
       or (schemaname = 'storage' and tablename = 'objects')
  loop
    execute format('drop policy %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;
end;
$$;

/* Published marketing content: readable by anyone. */

create policy "published catalog items are public"
  on public.catalog_items for select to anon, authenticated
  using (published or private.is_staff());

create policy "catalog plans are public"
  on public.catalog_plans for select to anon, authenticated
  using (true);

create policy "published examples are public"
  on public.examples for select to anon, authenticated
  using (published or private.is_staff());

create policy "published reviews are public"
  on public.reviews for select to anon, authenticated
  using (published or private.is_staff());

create policy "published faqs are public"
  on public.faqs for select to anon, authenticated
  using (published or private.is_staff());

create policy "published classes are public"
  on public.academy_classes for select to anon, authenticated
  using (published or private.is_staff());

create policy "settings are public"
  on public.settings for select to anon, authenticated
  using (true);

-- Receiving addresses, published by design: the payment screen has to render
-- them. Writes stay with staff.
create policy "enabled payment methods are public"
  on public.payment_methods for select to anon, authenticated
  using (enabled or private.is_staff());

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
         using (private.can_edit()) with check (private.can_edit())',
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
         for select to authenticated using (private.is_staff())',
      t
    );
    execute format(
      'create policy "editors insert %1$s" on public.%1$I
         for insert to authenticated with check (private.can_edit())',
      t
    );
    execute format(
      'create policy "editors update %1$s" on public.%1$I
         for update to authenticated
         using (private.can_edit()) with check (private.can_edit())',
      t
    );
    execute format(
      'create policy "editors delete %1$s" on public.%1$I
         for delete to authenticated using (private.can_edit())',
      t
    );
  end loop;
end;
$$;

/* The team itself. */

create policy "staff see the team"
  on public.staff for select to authenticated
  using (private.is_staff());

create policy "owners and admins change the team"
  on public.staff for all to authenticated
  using (private.can_manage_team()) with check (private.can_manage_team());

/* A customer's own records. */

create policy "own profile is readable"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "own profile is editable"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Ownership matches on the account first and the address second: an order
-- placed before the customer had an account carries only the email.
create policy "own orders are readable"
  on public.orders for select to authenticated
  using ((select auth.uid()) = user_id or lower(email) = private.auth_email());

create policy "own invoices are readable"
  on public.invoices for select to authenticated
  using ((select auth.uid()) = user_id or lower(email) = private.auth_email());

create policy "own payments are readable"
  on public.payments for select to authenticated
  using ((select auth.uid()) = user_id or lower(email) = private.auth_email());

create policy "own payments can be submitted"
  on public.payments for insert to authenticated
  with check ((select auth.uid()) = user_id and status = 'submitted');

-- `visible` is honoured: staff can stage a deliverable before the customer is
-- meant to see it.
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

/* Storage. Every private object is filed under its owner's user id, so the
   policy is one comparison and a leaked object name is useless elsewhere. */

create policy "media is world readable"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'media');

create policy "editors manage media"
  on storage.objects for all to authenticated
  using (bucket_id = 'media' and private.can_edit())
  with check (bucket_id = 'media' and private.can_edit());

create policy "avatars are world readable"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'avatars');

create policy "own avatar is writable"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "own avatar is replaceable"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "own avatar is removable"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and ((storage.foldername(name))[1] = (select auth.uid())::text or private.can_edit())
  );

do $$
declare
  b text;
begin
  foreach b in array array['proofs', 'documents', 'attachments']
  loop
    execute format(
      'create policy "own %1$s are readable" on storage.objects
         for select to authenticated
         using (
           bucket_id = %1$L
           and ((storage.foldername(name))[1] = (select auth.uid())::text
                or private.is_staff())
         )',
      b
    );
    execute format(
      'create policy "own %1$s are writable" on storage.objects
         for insert to authenticated
         with check (
           bucket_id = %1$L
           and ((storage.foldername(name))[1] = (select auth.uid())::text
                or private.can_edit())
         )',
      b
    );
    execute format(
      'create policy "own %1$s are removable" on storage.objects
         for delete to authenticated
         using (
           bucket_id = %1$L
           and ((storage.foldername(name))[1] = (select auth.uid())::text
                or private.can_edit())
         )',
      b
    );
  end loop;
end;
$$;

/* The public copies are no longer referenced. */

drop function if exists public.can_edit();
drop function if exists public.can_manage_team();
drop function if exists public.is_staff();
drop function if exists public.staff_role();
drop function if exists public.auth_email();

-- The new-user trigger stays in `public` (auth.users owns the trigger) but must
-- not be callable over the API.
revoke execute on function public.handle_new_user() from anon, authenticated, public;
