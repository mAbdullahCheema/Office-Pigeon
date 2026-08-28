-- Enum types, the shared updated_at trigger, and the staff table the role
-- helpers are built on. Applied before any table so the tables can reference
-- these types.
--
-- The role helpers created here are later moved into the `private` schema by
-- `move_role_helpers_to_private_schema`, which is where they live now.

create type public.staff_role as enum ('owner', 'admin', 'editor');

create type public.catalog_group as enum ('Products', 'Services', 'Academy');

-- Order and payment lifecycle labels are rendered verbatim as badges, so the
-- enum carries the display text rather than a slug the app would have to map.
create type public.order_status as enum (
  'Awaiting confirmation',
  'Awaiting payment',
  'Confirmed',
  'In build',
  'Live',
  'Closed',
  'Cancelled'
);

create type public.payment_status as enum (
  'unpaid',
  'awaiting_verification',
  'paid',
  'partially_paid',
  'refunded'
);

create type public.priority_level as enum ('low', 'normal', 'high');

create type public.lead_source as enum ('website', 'chatbot', 'referral', 'manual');
create type public.lead_status as enum ('new', 'contacted', 'qualified', 'won', 'lost', 'spam');

create type public.booking_channel as enum ('call', 'whatsapp', 'meet');
create type public.booking_status as enum ('requested', 'confirmed', 'completed', 'cancelled', 'no_show');

create type public.message_status as enum ('unread', 'read', 'replied', 'spam');

create type public.conversation_status as enum ('open', 'handoff', 'closed');
create type public.chat_role as enum ('visitor', 'assistant', 'agent', 'system');
create type public.chat_kind as enum (
  'text', 'quick_replies', 'recommendation', 'lead_form', 'booking', 'handoff'
);

create type public.payment_method_kind as enum ('crypto', 'bank');
create type public.payment_review_status as enum ('submitted', 'verified', 'rejected', 'refunded');

create type public.invoice_status as enum ('draft', 'sent', 'paid', 'overdue', 'void');

create type public.thread_status as enum ('open', 'pending', 'resolved', 'closed');
create type public.thread_party as enum ('customer', 'staff');

create type public.file_category as enum ('brand', 'scope', 'invoice', 'report', 'handover', 'other');

create type public.class_status as enum (
  'scheduled', 'confirmed', 'rescheduling', 'cancelled', 'completed'
);
create type public.enrollment_status as enum ('active', 'paused', 'completed', 'cancelled');

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.touch_updated_at is
  'BEFORE UPDATE trigger. Keeps updated_at honest without the app having to remember it.';

-- Staff membership is a table, and these helpers are what the policies consult.
-- SECURITY DEFINER so a policy on `staff` itself cannot recurse into the policy
-- that would be needed to read `staff`.

create table public.staff (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  role       public.staff_role not null default 'editor',
  created_at timestamptz not null default now()
);

comment on table public.staff is 'Members of the Office Pigeon team and what they may do.';

create or replace function public.staff_role()
returns public.staff_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.staff where user_id = (select auth.uid());
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.staff where user_id = (select auth.uid()));
$$;

create or replace function public.can_edit()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.staff_role() in ('owner', 'admin', 'editor');
$$;

create or replace function public.can_manage_team()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.staff_role() in ('owner', 'admin');
$$;

create or replace function public.auth_email()
returns text
language sql
stable
set search_path = ''
as $$
  select lower(nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'email', ''));
$$;
