-- Wires the three edge functions to the database: two `after insert` triggers
-- and one cron schedule.
--
-- The functions are deployed with JWT verification on, so every call has to be
-- signed. The key lives in Vault rather than inline in a function body, and
-- only the SECURITY DEFINER dispatcher below ever reads it.
--
-- ─────────────────────────────────────────────────────────────────────────
-- BEFORE RUNNING THIS ON A NEW PROJECT
--
-- The two Vault secrets are deliberately placeholders here: a service-role JWT
-- must never live in a file that gets committed. Set them once, from the SQL
-- editor, and then run this migration:
--
--   select vault.create_secret('<service-role JWT>',              'edge_function_key',
--     'Service-role JWT used to sign calls from database triggers to edge functions.');
--   select vault.create_secret('https://<ref>.supabase.co/functions/v1', 'edge_function_url',
--     'Base URL for this project''s edge functions.');
--
-- The `do` block below is a no-op when they already exist, so setting them
-- first is the supported path.
-- ─────────────────────────────────────────────────────────────────────────

create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;

do $$
begin
  if not exists (select 1 from vault.secrets where name = 'edge_function_key') then
    raise warning
      'Vault secret "edge_function_key" is not set — triggers will skip until it is.';
  end if;

  if not exists (select 1 from vault.secrets where name = 'edge_function_url') then
    raise warning
      'Vault secret "edge_function_url" is not set — triggers will skip until it is.';
  end if;
end;
$$;

/**
 * Fires an edge function and returns immediately.
 *
 * `net.http_post` queues the request, so a slow function — or a mail provider
 * having a bad day — never holds open the transaction that triggered it.
 */
create or replace function private.call_edge_function(function_name text, body jsonb)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  base_url text;
  service_key text;
  request_id bigint;
begin
  select decrypted_secret into base_url
    from vault.decrypted_secrets where name = 'edge_function_url';
  select decrypted_secret into service_key
    from vault.decrypted_secrets where name = 'edge_function_key';

  if base_url is null or service_key is null then
    raise warning 'call_edge_function: vault secrets are missing, skipping %', function_name;
    return null;
  end if;

  select net.http_post(
    url := base_url || '/' || function_name,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_key
    ),
    body := body,
    timeout_milliseconds := 10000
  ) into request_id;

  return request_id;
end;
$$;

/**
 * Row trigger that posts the same shape Supabase's own webhooks use, so an
 * edge function written against a Database Webhook works here unchanged.
 *
 * `TG_ARGV[0]` names the function to call.
 */
create or replace function private.dispatch_webhook()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.call_edge_function(
    TG_ARGV[0],
    jsonb_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'schema', TG_TABLE_SCHEMA,
      'record', to_jsonb(new),
      'old_record', case when TG_OP = 'UPDATE' then to_jsonb(old) else null end
    )
  );
  return new;
end;
$$;

create trigger notify_new_lead
  after insert on public.leads
  for each row execute function private.dispatch_webhook('lead-notify');

create trigger score_new_lead
  after insert on public.leads
  for each row execute function private.dispatch_webhook('spam-check');

create trigger score_new_contact_message
  after insert on public.contact_messages
  for each row execute function private.dispatch_webhook('spam-check');

-- 06:00 UTC daily. Re-scheduling by name is idempotent.
select cron.unschedule('daily-digest') where exists (
  select 1 from cron.job where jobname = 'daily-digest'
);

select cron.schedule(
  'daily-digest',
  '0 6 * * *',
  $cron$ select private.call_edge_function('daily-digest', '{}'::jsonb) $cron$
);
