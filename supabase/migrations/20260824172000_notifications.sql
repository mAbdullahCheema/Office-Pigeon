-- In-app notifications, replacing the outbound email the app used to send.
--
-- A row with a null `user_id` is addressed to the team; one with a `user_id` is
-- addressed to that customer. Realtime carries it to whoever is entitled to see
-- it, so a new lead lands in front of staff without a mail provider in the path.

create type public.notification_kind as enum (
  'lead', 'payment', 'booking', 'contact', 'message', 'digest', 'system'
);

create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  kind       public.notification_kind not null default 'system',
  title      text not null,
  body       text,
  -- Where clicking it should go, relative to the site root.
  href       text,
  -- Null means "the whole team"; otherwise the one customer it belongs to.
  user_id    uuid references auth.users (id) on delete cascade,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.notifications is
  'In-app alerts. Null user_id addresses the team; a set user_id addresses that customer.';

create index notifications_recent_idx on public.notifications (created_at desc);
create index notifications_user_idx on public.notifications (user_id, created_at desc);
-- The unread count is read on every dashboard render, so it gets its own index.
create index notifications_unread_idx on public.notifications (user_id, created_at desc)
  where read_at is null;

alter table public.notifications enable row level security;

-- Staff see the team's notifications and every customer's.
create policy "staff read notifications"
  on public.notifications for select to authenticated
  using (private.is_staff());

create policy "staff update notifications"
  on public.notifications for update to authenticated
  using (private.is_staff()) with check (private.is_staff());

create policy "editors delete notifications"
  on public.notifications for delete to authenticated
  using (private.can_edit());

-- A customer sees only their own, and may only ever mark one read.
create policy "own notifications are readable"
  on public.notifications for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "own notifications can be marked read"
  on public.notifications for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

alter publication supabase_realtime add table public.notifications;
