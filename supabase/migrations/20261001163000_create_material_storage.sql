-- ============================================================
-- TEACHING HUB
-- MATERIAL STORAGE V1
-- ============================================================


-- ============================================================
-- 1. CREATE PRIVATE STORAGE BUCKET
-- ============================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'teaching-materials',
  'teaching-materials',
  false,
  104857600,
  array[
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'audio/mpeg',
    'audio/wav',
    'video/mp4'
  ]
)
on conflict (id) do update
set
  public = false,
  file_size_limit = 104857600,
  allowed_mime_types = excluded.allowed_mime_types;


-- ============================================================
-- 2. STORAGE OBJECT READ POLICY
-- ============================================================
-- Files are private.
--
-- Path structure:
--
-- teaching-materials/
--   {user_id}/
--     file.ext
--
-- The first folder must match the authenticated user's ID.
-- ============================================================

drop policy if exists
  "Authenticated users can view their material files"
on storage.objects;

create policy
  "Authenticated users can view their material files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'teaching-materials'
  and (storage.foldername(name))[1] = auth.uid()::text
);


-- ============================================================
-- 3. STORAGE OBJECT UPLOAD POLICY
-- ============================================================

drop policy if exists
  "Authenticated users can upload material files"
on storage.objects;

create policy
  "Authenticated users can upload material files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'teaching-materials'
  and (storage.foldername(name))[1] = auth.uid()::text
);


-- ============================================================
-- 4. STORAGE OBJECT UPDATE POLICY
-- ============================================================

drop policy if exists
  "Authenticated users can update their material files"
on storage.objects;

create policy
  "Authenticated users can update their material files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'teaching-materials'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'teaching-materials'
  and (storage.foldername(name))[1] = auth.uid()::text
);


-- ============================================================
-- 5. STORAGE OBJECT DELETE POLICY
-- ============================================================

drop policy if exists
  "Authenticated users can delete their material files"
on storage.objects;

create policy
  "Authenticated users can delete their material files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'teaching-materials'
  and (storage.foldername(name))[1] = auth.uid()::text
);