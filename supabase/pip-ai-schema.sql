create extension if not exists pgcrypto;

create table if not exists public.pip_ai_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  name text,
  business_name text,
  email text,
  phone text,
  need_help_with text,
  consent boolean default false,
  source_page text,
  status text default 'new',
  ip_hash text,
  user_agent text,
  referrer text
);

create table if not exists public.pip_ai_conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  lead_id uuid references public.pip_ai_leads(id) on delete set null,
  messages_json jsonb default '[]'::jsonb,
  summary text,
  recommended_service text,
  last_user_message text,
  last_ai_message text,
  status text default 'active',
  provider_used text,
  fallback_triggered boolean default false,
  handoff_ticket_id uuid
);

create table if not exists public.pip_ai_handoff_tickets (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  lead_id uuid references public.pip_ai_leads(id) on delete set null,
  conversation_id uuid references public.pip_ai_conversations(id) on delete set null,
  reason text,
  user_question text,
  conversation_summary text,
  recommended_service text,
  priority text default 'normal',
  status text default 'open',
  whatsapp_message text,
  source_page text
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'pip_ai_conversations_handoff_ticket_id_fkey'
  ) then
    alter table public.pip_ai_conversations
      add constraint pip_ai_conversations_handoff_ticket_id_fkey
      foreign key (handoff_ticket_id)
      references public.pip_ai_handoff_tickets(id)
      on delete set null
      not valid;
  end if;
end $$;

create table if not exists public.pip_ai_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  lead_id uuid references public.pip_ai_leads(id) on delete set null,
  conversation_id uuid references public.pip_ai_conversations(id) on delete set null,
  event_type text not null,
  event_data jsonb default '{}'::jsonb,
  source_page text
);

create table if not exists public.pip_ai_knowledge_index_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  namespace text,
  chunk_count integer,
  status text,
  error_message text
);

create index if not exists idx_pip_ai_leads_created_at on public.pip_ai_leads(created_at desc);
create index if not exists idx_pip_ai_conversations_lead_id on public.pip_ai_conversations(lead_id);
create index if not exists idx_pip_ai_conversations_handoff_ticket_id on public.pip_ai_conversations(handoff_ticket_id);
create index if not exists idx_pip_ai_handoff_tickets_lead_id on public.pip_ai_handoff_tickets(lead_id);
create index if not exists idx_pip_ai_handoff_tickets_conversation_id on public.pip_ai_handoff_tickets(conversation_id);
create index if not exists idx_pip_ai_handoff_status on public.pip_ai_handoff_tickets(status);
create index if not exists idx_pip_ai_events_type on public.pip_ai_events(event_type);
create index if not exists idx_pip_ai_events_lead_id on public.pip_ai_events(lead_id);
create index if not exists idx_pip_ai_events_conversation_id on public.pip_ai_events(conversation_id);

alter table public.pip_ai_leads enable row level security;
alter table public.pip_ai_conversations enable row level security;
alter table public.pip_ai_handoff_tickets enable row level security;
alter table public.pip_ai_events enable row level security;
alter table public.pip_ai_knowledge_index_log enable row level security;

revoke all on public.pip_ai_leads from anon, authenticated;
revoke all on public.pip_ai_conversations from anon, authenticated;
revoke all on public.pip_ai_handoff_tickets from anon, authenticated;
revoke all on public.pip_ai_events from anon, authenticated;
revoke all on public.pip_ai_knowledge_index_log from anon, authenticated;
