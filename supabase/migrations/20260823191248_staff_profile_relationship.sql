-- Both columns already hold an auth.users id, so this constraint costs nothing
-- and buys the team screen a single joined read instead of an N+1.
alter table public.staff
  add constraint staff_user_id_profiles_fkey
  foreign key (user_id) references public.profiles (id) on delete cascade;
