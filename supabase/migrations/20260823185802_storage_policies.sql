-- First pass of the storage policies. Replaced wholesale by
-- `move_role_helpers_to_private_schema`, which recreates them against the
-- helpers in the `private` schema.

create policy "media is world readable"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'media');

create policy "editors manage media"
  on storage.objects for all to authenticated
  using (bucket_id = 'media' and public.can_edit())
  with check (bucket_id = 'media' and public.can_edit());

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
    and ((storage.foldername(name))[1] = (select auth.uid())::text or public.can_edit())
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
                or public.is_staff())
         )',
      b
    );
    execute format(
      'create policy "own %1$s are writable" on storage.objects
         for insert to authenticated
         with check (
           bucket_id = %1$L
           and ((storage.foldername(name))[1] = (select auth.uid())::text
                or public.can_edit())
         )',
      b
    );
    execute format(
      'create policy "own %1$s are removable" on storage.objects
         for delete to authenticated
         using (
           bucket_id = %1$L
           and ((storage.foldername(name))[1] = (select auth.uid())::text
                or public.can_edit())
         )',
      b
    );
  end loop;
end;
$$;
