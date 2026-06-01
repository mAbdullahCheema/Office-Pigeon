create extension if not exists pgcrypto;

create table if not exists public.preview_statuses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  business_name text,
  status text not null default 'live',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  removed_at timestamptz,
  removed_by_email text,
  constraint preview_statuses_slug_format check (slug ~ '^[a-z0-9-]+$'),
  constraint preview_statuses_status_check check (status in ('live', 'expired', 'sold', 'draft', 'archived'))
);

create table if not exists public.preview_leads (
  id uuid primary key default gen_random_uuid(),
  preview_slug text not null,
  business_name text,
  name text,
  email text,
  phone text,
  message text,
  form_data jsonb default '{}'::jsonb,
  source text default 'preview_website',
  created_at timestamptz default now(),
  constraint preview_leads_slug_format check (preview_slug ~ '^[a-z0-9-]+$')
);

alter table public.preview_statuses enable row level security;
alter table public.preview_leads enable row level security;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists preview_statuses_set_updated_at on public.preview_statuses;
create trigger preview_statuses_set_updated_at
before update on public.preview_statuses
for each row execute function public.set_updated_at();

revoke all on table public.preview_statuses from anon, authenticated;
revoke all on table public.preview_leads from anon, authenticated;
