-- Storage buckets: two public, three private.
--
-- Private buckets carry no public read; access to them is mediated by the
-- storage policies in `storage_policies` and by the server routes under
-- /api/files/* that hold the secret key.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'media', 'media', true, 20971520,
    array['image/jpeg','image/png','image/webp','image/avif','image/svg+xml','image/gif']
  ),
  (
    'attachments', 'attachments', false, 26214400,
    array[
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png','image/jpeg','application/zip'
    ]
  ),
  (
    'proofs', 'proofs', false, 10485760,
    array['image/png','image/jpeg','image/webp','application/pdf']
  ),
  (
    'avatars', 'avatars', true, 5242880,
    array['image/png','image/jpeg','image/webp','image/avif']
  ),
  (
    'documents', 'documents', false, 52428800,
    array[
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/csv','text/plain',
      'image/png','image/jpeg','image/webp','image/svg+xml',
      'application/zip'
    ]
  )
on conflict (id) do nothing;
