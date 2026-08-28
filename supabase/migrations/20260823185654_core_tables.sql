-- The whole application schema. snake_case throughout, with real Postgres
-- types rather than strings: uuid keys, timestamptz, inet, jsonb for line
-- items, text[] for the repeated fields, and foreign keys to auth.users so a
-- deleted account takes its records with it.

/* ── Account holders ────────────────────────────────────────────────── */

create table public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  name            text,
  email           text,
  phone           text,
  company         text,
  country         text,
  city            text,
  address         text,
  -- Object path inside the avatars bucket, not a file id: Supabase Storage is
  -- addressed by path.
  avatar_path     text,
  notify_orders   boolean not null default true,
  notify_invoices boolean not null default true,
  notify_classes  boolean not null default true,
  notify_news     boolean not null default false,
  timezone        text not null default 'Asia/Karachi',
  referral_code   text,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.profiles is
  'The customer-editable half of an account. One row per auth user, created by trigger.';

create index profiles_email_idx on public.profiles (lower(email));

/**
 * Every new account gets its profile immediately.
 *
 * Doing it here rather than lazily on first read means no page render ever has
 * to perform a write, and the app can simply assume the row exists.
 */
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'name', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      new.email
    ),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

/* ── Catalog ────────────────────────────────────────────────────────── */

create table public.catalog_items (
  id           uuid primary key default gen_random_uuid(),
  item_id      text not null unique,
  group_key    public.catalog_group not null,
  name         text not null,
  icon         text,
  tint         text,
  blurb        text,
  body         text,
  tagline      text,
  href         text,
  slot         text,
  photo        text,
  audience     text,
  accent       text,
  wash         text,
  detail_body  text,
  -- Each entry is `title|body`.
  features     text[] not null default '{}',
  -- Each entry is `value|label`.
  stats        text[] not null default '{}',
  detail_slot  text,
  detail_photo text,
  page         text,
  sort_order   integer not null default 0,
  published    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index catalog_items_group_idx on public.catalog_items (group_key, sort_order);

create table public.catalog_plans (
  id         uuid primary key default gen_random_uuid(),
  plan_id    text not null unique,
  item_id    text not null references public.catalog_items (item_id)
               on update cascade on delete cascade,
  name       text not null,
  price      integer not null default 0,
  unit       text,
  note       text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index catalog_plans_item_idx on public.catalog_plans (item_id, sort_order);

create table public.examples (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  -- Filter key on the Examples page: websites, chatbots, calling, …
  group_key  text not null,
  kind       text,
  sector     text,
  body       text,
  -- Headline numbers, each `value|label|colour`.
  results    text[] not null default '{}',
  tint       text,
  slot       text,
  photo      text,
  sort_order integer not null default 0,
  published  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index examples_order_idx on public.examples (sort_order);

create table public.reviews (
  id         uuid primary key default gen_random_uuid(),
  quote      text not null,
  name       text not null,
  role       text,
  initials   text,
  tint       text,
  sort_order integer not null default 0,
  published  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reviews_order_idx on public.reviews (sort_order);

create table public.faqs (
  id         uuid primary key default gen_random_uuid(),
  question   text not null,
  answer     text not null,
  category   text not null default 'general',
  sort_order integer not null default 0,
  published  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index faqs_category_idx on public.faqs (category, sort_order);
create index faqs_question_search_idx on public.faqs
  using gin (to_tsvector('english', question));

create table public.settings (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique,
  value      text,
  group_key  text not null default 'general',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.academy_classes (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  subject       text,
  tutor         text,
  level         text,
  icon          text,
  tint          text,
  -- Human label for the recurring slot, e.g. "Mon 6:00 PM GST".
  time_label    text,
  starts_at     timestamptz,
  duration_mins integer not null default 60 check (duration_mins >= 0),
  meeting_url   text,
  capacity      integer not null default 6 check (capacity >= 0),
  status        public.class_status not null default 'scheduled',
  notes         text,
  published     boolean not null default true,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index academy_classes_order_idx on public.academy_classes (sort_order);

/* ── Inbound ────────────────────────────────────────────────────────── */

create table public.leads (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  -- Optional: Pip collects a single free-form contact, often a WhatsApp
  -- number, so a lead can legitimately arrive without an address.
  email        text,
  phone        text,
  company      text,
  website      text,
  service_slug text,
  package_slug text,
  budget       text,
  message      text,
  source       public.lead_source not null default 'website',
  status       public.lead_status not null default 'new',
  owner_id     uuid references auth.users (id) on delete set null,
  notes        text,
  country      text,
  ip           inet,
  user_agent   text,
  spam_score   numeric(3, 2) not null default 0 check (spam_score between 0 and 1),
  notified_at  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint leads_reachable check (email is not null or phone is not null)
);

create index leads_status_idx on public.leads (status, created_at desc);
create index leads_email_idx on public.leads (lower(email));

create table public.bookings (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text not null,
  phone        text,
  company      text,
  service_slug text,
  slot_at      timestamptz not null,
  timezone     text not null default 'Asia/Karachi',
  channel      public.booking_channel not null default 'call',
  notes        text,
  status       public.booking_status not null default 'requested',
  lead_id      uuid references public.leads (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index bookings_slot_idx on public.bookings (slot_at);
create index bookings_status_idx on public.bookings (status);

create table public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text,
  message    text not null,
  status     public.message_status not null default 'unread',
  spam_score numeric(3, 2) not null default 0 check (spam_score between 0 and 1),
  ip         inet,
  country    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contact_messages_status_idx on public.contact_messages (status, created_at desc);

create table public.subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  name       text,
  confirmed  boolean not null default false,
  source     text not null default 'footer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index subscribers_email_key on public.subscribers (lower(email));

/* ── Pip transcripts ────────────────────────────────────────────────── */

create table public.chat_conversations (
  id              uuid primary key default gen_random_uuid(),
  -- Null for the anonymous transcripts the widget recorded before sign-in
  -- became a requirement.
  user_id         uuid references auth.users (id) on delete cascade,
  name            text,
  email           text,
  status          public.conversation_status not null default 'open',
  last_message_at timestamptz,
  message_count   integer not null default 0,
  lead_id         uuid references public.leads (id) on delete set null,
  summary         text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index chat_conversations_user_idx on public.chat_conversations (user_id);
create index chat_conversations_recent_idx on public.chat_conversations (last_message_at desc);

create table public.chat_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations (id) on delete cascade,
  role            public.chat_role not null,
  content         text not null,
  kind            public.chat_kind not null default 'text',
  payload         jsonb,
  created_at      timestamptz not null default now()
);

create index chat_messages_conversation_idx on public.chat_messages (conversation_id, created_at);

/* ── Orders, invoices, payments ─────────────────────────────────────── */

create table public.orders (
  id             uuid primary key default gen_random_uuid(),
  ref            text not null unique,
  status         public.order_status not null default 'Awaiting confirmation',
  verified       boolean not null default false,
  -- Free text, not a catalog reference: a bespoke order uses "custom".
  item_id        text not null,
  item_name      text,
  plan_id        text,
  plan_name      text,
  price          integer not null default 0,
  unit           text,
  group_key      text,
  name           text not null,
  email          text not null,
  phone          text,
  company        text,
  country        text,
  notes          text,
  user_id        uuid references auth.users (id) on delete set null,
  ip             inet,
  spam_score     numeric(3, 2) not null default 0 check (spam_score between 0 and 1),
  currency       text not null default 'USD',
  -- What the customer actually owes. Distinct from `price`, the published
  -- catalog figure: staff can discount or quote a custom job, and only this
  -- column drives the payment screen.
  amount_due     numeric(14, 2) not null default 0 check (amount_due >= 0),
  payment_status public.payment_status not null default 'unpaid',
  amount_paid    numeric(14, 2) not null default 0 check (amount_paid >= 0),
  paid_at        timestamptz,
  custom         boolean not null default false,
  -- `[{ "description": …, "qty": …, "unitPrice": … }]`
  custom_items   jsonb,
  assigned_to    text,
  priority       public.priority_level not null default 'normal',
  due_at         timestamptz,
  admin_notes    text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index orders_user_idx on public.orders (user_id, created_at desc);
create index orders_email_idx on public.orders (lower(email), created_at desc);
create index orders_status_idx on public.orders (status);
create index orders_payment_status_idx on public.orders (payment_status);

create table public.invoices (
  id         uuid primary key default gen_random_uuid(),
  number     text not null unique,
  order_id   uuid references public.orders (id) on delete set null,
  order_ref  text,
  user_id    uuid references auth.users (id) on delete set null,
  email      text,
  name       text,
  company    text,
  title      text,
  currency   text not null default 'USD',
  -- `[{ "description": …, "qty": …, "unitPrice": … }]`
  line_items jsonb,
  subtotal   numeric(14, 2) not null default 0,
  discount   numeric(14, 2) not null default 0,
  tax        numeric(14, 2) not null default 0,
  total      numeric(14, 2) not null default 0,
  status     public.invoice_status not null default 'draft',
  issued_at  timestamptz,
  due_at     timestamptz,
  paid_at    timestamptz,
  notes      text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index invoices_user_idx on public.invoices (user_id, created_at desc);
create index invoices_status_idx on public.invoices (status);
create index invoices_order_idx on public.invoices (order_id);

create table public.payment_methods (
  id           uuid primary key default gen_random_uuid(),
  method_id    text not null unique,
  label        text not null,
  kind         public.payment_method_kind not null,
  currency     text not null,
  -- Wallet address for crypto, account number or IBAN for a bank.
  address      text not null,
  network      text,
  account_name text,
  bank_name    text,
  branch       text,
  iban         text,
  swift        text,
  instructions text,
  icon         text,
  tint         text,
  enabled      boolean not null default true,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index payment_methods_order_idx on public.payment_methods (sort_order);

create table public.payments (
  id             uuid primary key default gen_random_uuid(),
  ref            text not null unique,
  order_id       uuid references public.orders (id) on delete set null,
  order_ref      text,
  invoice_id     uuid references public.invoices (id) on delete set null,
  invoice_number text,
  user_id        uuid references auth.users (id) on delete set null,
  email          text,
  name           text,
  method         text not null,
  method_label   text,
  currency       text not null default 'USD',
  -- Eight decimal places because a BTC transfer means nothing at two.
  amount         numeric(24, 8) not null default 0 check (amount >= 0),
  -- The same payment converted to USD, so totals across methods add up.
  amount_usd     numeric(14, 2) not null default 0 check (amount_usd >= 0),
  -- Transaction hash, wire reference or transfer id.
  reference      text,
  -- Object path inside the private proofs bucket.
  proof_path     text,
  proof_name     text,
  status         public.payment_review_status not null default 'submitted',
  note           text,
  admin_note     text,
  reviewed_by    text,
  reviewed_at    timestamptz,
  ip             inet,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index payments_order_idx on public.payments (order_id);
create index payments_user_idx on public.payments (user_id, created_at desc);
create index payments_status_idx on public.payments (status);

/* ── Support ────────────────────────────────────────────────────────── */

create table public.threads (
  id                   uuid primary key default gen_random_uuid(),
  subject              text not null,
  user_id              uuid not null references auth.users (id) on delete cascade,
  email                text,
  name                 text,
  status               public.thread_status not null default 'open',
  order_ref            text,
  last_message_at      timestamptz,
  last_message_from    public.thread_party not null default 'customer',
  message_count        integer not null default 0,
  unread_for_staff     boolean not null default true,
  unread_for_customer  boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index threads_user_idx on public.threads (user_id, last_message_at desc);
create index threads_status_idx on public.threads (status);
create index threads_unread_idx on public.threads (unread_for_staff) where unread_for_staff;

create table public.thread_messages (
  id              uuid primary key default gen_random_uuid(),
  thread_id       uuid not null references public.threads (id) on delete cascade,
  author_id       uuid references auth.users (id) on delete set null,
  author_name     text,
  role            public.thread_party not null,
  body            text not null,
  attachment_path text,
  attachment_name text,
  created_at      timestamptz not null default now()
);

create index thread_messages_thread_idx on public.thread_messages (thread_id, created_at);

create table public.customer_files (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  email       text,
  -- Object path inside the private documents bucket.
  path        text not null,
  name        text not null,
  mime_type   text,
  size        bigint not null default 0 check (size >= 0),
  category    public.file_category not null default 'other',
  uploaded_by public.thread_party not null default 'staff',
  order_ref   text,
  note        text,
  -- Staff can stage a deliverable before the customer is meant to see it.
  visible     boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index customer_files_user_idx on public.customer_files (user_id, created_at desc);
create index customer_files_category_idx on public.customer_files (category);

create table public.enrollments (
  id           uuid primary key default gen_random_uuid(),
  class_id     uuid not null references public.academy_classes (id) on delete cascade,
  class_title  text,
  user_id      uuid not null references auth.users (id) on delete cascade,
  email        text,
  student_name text,
  status       public.enrollment_status not null default 'active',
  attendance   integer not null default 0 check (attendance between 0 and 100),
  mock_average integer not null default 0 check (mock_average between 0 and 100),
  homework     integer not null default 0 check (homework between 0 and 100),
  order_ref    text,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (class_id, user_id)
);

create index enrollments_user_idx on public.enrollments (user_id);

/* ── Audit ──────────────────────────────────────────────────────────── */

create table public.audit_log (
  id         uuid primary key default gen_random_uuid(),
  actor_id   uuid references auth.users (id) on delete set null,
  actor_name text,
  action     text not null,
  target     text,
  detail     text,
  created_at timestamptz not null default now()
);

create index audit_log_action_idx on public.audit_log (action, created_at desc);
create index audit_log_recent_idx on public.audit_log (created_at desc);

/* ── updated_at triggers ────────────────────────────────────────────── */

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'catalog_items', 'catalog_plans', 'examples', 'reviews', 'faqs',
    'settings', 'academy_classes', 'leads', 'bookings', 'contact_messages',
    'subscribers', 'chat_conversations', 'orders', 'invoices', 'payment_methods',
    'payments', 'threads', 'customer_files', 'enrollments'
  ]
  loop
    execute format(
      'create trigger touch_updated_at before update on public.%I
         for each row execute function public.touch_updated_at()',
      t
    );
  end loop;
end;
$$;
