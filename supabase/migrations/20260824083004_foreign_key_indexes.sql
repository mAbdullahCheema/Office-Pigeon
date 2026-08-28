-- Every foreign key that had no index behind it. Postgres does not create one
-- automatically, and without it a delete on the parent has to scan the child
-- table to check the constraint.
create index leads_owner_idx on public.leads (owner_id);
create index bookings_lead_idx on public.bookings (lead_id);
create index chat_conversations_lead_idx on public.chat_conversations (lead_id);
create index thread_messages_author_idx on public.thread_messages (author_id);
create index payments_invoice_idx on public.payments (invoice_id);
create index audit_log_actor_idx on public.audit_log (actor_id);
