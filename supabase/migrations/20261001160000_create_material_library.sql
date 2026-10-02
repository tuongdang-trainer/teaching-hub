-- ============================================================
-- TEACHING HUB
-- MATERIAL LIBRARY V1
-- ============================================================

-- ============================================================
-- 1. EXTEND MATERIALS
-- ============================================================

alter table public.materials
  add column if not exists file_name text,
  add column if not exists storage_path text,
  add column if not exists file_extension text,
  add column if not exists mime_type text,
  add column if not exists file_size bigint,
  add column if not exists course_id uuid
    references public.courses(id)
    on delete set null,
  add column if not exists unit_id uuid
    references public.curriculum_units(id)
    on delete set null,
  add column if not exists status text not null default 'active';


-- ============================================================
-- 2. TAGS
-- ============================================================

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),

  name text not null,

  slug text not null unique,

  created_at timestamptz not null default now()
);


-- ============================================================
-- 3. MATERIAL TAGS
-- ============================================================

create table if not exists public.material_tags (
  material_id uuid not null
    references public.materials(id)
    on delete cascade,

  tag_id uuid not null
    references public.tags(id)
    on delete cascade,

  created_at timestamptz not null default now(),

  primary key (material_id, tag_id)
);


-- ============================================================
-- 4. COLLECTIONS
-- ============================================================

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),

  name text not null,

  description text,

  created_by uuid
    references public.profiles(id)
    on delete set null,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);


-- ============================================================
-- 5. MATERIAL COLLECTIONS
-- ============================================================

create table if not exists public.material_collections (
  material_id uuid not null
    references public.materials(id)
    on delete cascade,

  collection_id uuid not null
    references public.collections(id)
    on delete cascade,

  created_at timestamptz not null default now(),

  primary key (material_id, collection_id)
);


-- ============================================================
-- 6. EXTEND LESSON MATERIALS
-- ============================================================

alter table public.lesson_materials
  add column if not exists sort_order integer,
  add column if not exists usage_note text;


-- ============================================================
-- 7. INDEXES — MATERIALS
-- ============================================================

create index if not exists idx_materials_course_id
  on public.materials(course_id);

create index if not exists idx_materials_unit_id
  on public.materials(unit_id);

create index if not exists idx_materials_type
  on public.materials(type);

create index if not exists idx_materials_level
  on public.materials(level);

create index if not exists idx_materials_status
  on public.materials(status);

create index if not exists idx_materials_created_by
  on public.materials(created_by);

create index if not exists idx_materials_created_at
  on public.materials(created_at desc);


-- ============================================================
-- 8. INDEXES — TAGS
-- ============================================================

create index if not exists idx_tags_name
  on public.tags(name);

create index if not exists idx_material_tags_tag_id
  on public.material_tags(tag_id);


-- ============================================================
-- 9. INDEXES — COLLECTIONS
-- ============================================================

create index if not exists idx_collections_created_by
  on public.collections(created_by);

create index if not exists idx_material_collections_collection_id
  on public.material_collections(collection_id);


-- ============================================================
-- 10. INDEXES — LESSON MATERIALS
-- ============================================================

create index if not exists idx_lesson_materials_material_id
  on public.lesson_materials(material_id);

create index if not exists idx_lesson_materials_lesson_id
  on public.lesson_materials(lesson_id);


-- ============================================================
-- 11. ENABLE ROW LEVEL SECURITY
-- ============================================================

alter table public.materials enable row level security;

alter table public.tags enable row level security;

alter table public.material_tags enable row level security;

alter table public.collections enable row level security;

alter table public.material_collections enable row level security;

alter table public.lesson_materials enable row level security;


-- ============================================================
-- 12. MATERIALS POLICIES
-- ============================================================

drop policy if exists "Authenticated users can view materials"
on public.materials;

create policy "Authenticated users can view materials"
on public.materials
for select
to authenticated
using (true);


drop policy if exists "Authenticated users can create materials"
on public.materials;

create policy "Authenticated users can create materials"
on public.materials
for insert
to authenticated
with check (
  created_by = auth.uid()
);


drop policy if exists "Users can update their own materials"
on public.materials;

create policy "Users can update their own materials"
on public.materials
for update
to authenticated
using (
  created_by = auth.uid()
)
with check (
  created_by = auth.uid()
);


drop policy if exists "Users can delete their own materials"
on public.materials;

create policy "Users can delete their own materials"
on public.materials
for delete
to authenticated
using (
  created_by = auth.uid()
);


-- ============================================================
-- 13. TAGS POLICIES
-- ============================================================

drop policy if exists "Authenticated users can view tags"
on public.tags;

create policy "Authenticated users can view tags"
on public.tags
for select
to authenticated
using (true);


drop policy if exists "Authenticated users can create tags"
on public.tags;

create policy "Authenticated users can create tags"
on public.tags
for insert
to authenticated
with check (true);


drop policy if exists "Authenticated users can update tags"
on public.tags;

create policy "Authenticated users can update tags"
on public.tags
for update
to authenticated
using (true)
with check (true);


drop policy if exists "Authenticated users can delete tags"
on public.tags;

create policy "Authenticated users can delete tags"
on public.tags
for delete
to authenticated
using (true);


-- ============================================================
-- 14. MATERIAL TAGS POLICIES
-- ============================================================

drop policy if exists "Authenticated users can view material tags"
on public.material_tags;

create policy "Authenticated users can view material tags"
on public.material_tags
for select
to authenticated
using (true);


drop policy if exists "Authenticated users can create material tags"
on public.material_tags;

create policy "Authenticated users can create material tags"
on public.material_tags
for insert
to authenticated
with check (true);


drop policy if exists "Authenticated users can delete material tags"
on public.material_tags;

create policy "Authenticated users can delete material tags"
on public.material_tags
for delete
to authenticated
using (true);


-- ============================================================
-- 15. COLLECTIONS POLICIES
-- ============================================================

drop policy if exists "Authenticated users can view collections"
on public.collections;

create policy "Authenticated users can view collections"
on public.collections
for select
to authenticated
using (true);


drop policy if exists "Authenticated users can create collections"
on public.collections;

create policy "Authenticated users can create collections"
on public.collections
for insert
to authenticated
with check (
  created_by = auth.uid()
);


drop policy if exists "Users can update their own collections"
on public.collections;

create policy "Users can update their own collections"
on public.collections
for update
to authenticated
using (
  created_by = auth.uid()
)
with check (
  created_by = auth.uid()
);


drop policy if exists "Users can delete their own collections"
on public.collections;

create policy "Users can delete their own collections"
on public.collections
for delete
to authenticated
using (
  created_by = auth.uid()
);


-- ============================================================
-- 16. MATERIAL COLLECTION POLICIES
-- ============================================================

drop policy if exists "Authenticated users can view material collections"
on public.material_collections;

create policy "Authenticated users can view material collections"
on public.material_collections
for select
to authenticated
using (true);


drop policy if exists "Authenticated users can create material collections"
on public.material_collections;

create policy "Authenticated users can create material collections"
on public.material_collections
for insert
to authenticated
with check (true);


drop policy if exists "Authenticated users can delete material collections"
on public.material_collections;

create policy "Authenticated users can delete material collections"
on public.material_collections
for delete
to authenticated
using (true);


-- ============================================================
-- 17. LESSON MATERIAL POLICIES
-- ============================================================

drop policy if exists "Authenticated users can view lesson materials"
on public.lesson_materials;

create policy "Authenticated users can view lesson materials"
on public.lesson_materials
for select
to authenticated
using (true);


drop policy if exists "Authenticated users can create lesson materials"
on public.lesson_materials;

create policy "Authenticated users can create lesson materials"
on public.lesson_materials
for insert
to authenticated
with check (true);


drop policy if exists "Authenticated users can update lesson materials"
on public.lesson_materials;

create policy "Authenticated users can update lesson materials"
on public.lesson_materials
for update
to authenticated
using (true)
with check (true);


drop policy if exists "Authenticated users can delete lesson materials"
on public.lesson_materials;

create policy "Authenticated users can delete lesson materials"
on public.lesson_materials
for delete
to authenticated
using (true);


-- ============================================================
-- 18. COMMENTS
-- ============================================================

comment on table public.materials is
'Reusable teaching material library. Files are stored in Supabase Storage and metadata is stored here.';

comment on column public.materials.type is
'Business classification of the material, e.g. presentation, worksheet, pdf, document, image, audio, video, template, assessment, other.';

comment on column public.materials.storage_path is
'Path of the physical file inside Supabase Storage.';

comment on column public.materials.course_id is
'Optional curriculum association. Null means the material is generic or reusable across courses.';

comment on column public.materials.unit_id is
'Optional curriculum unit association.';

comment on table public.tags is
'Re-usable tags for searching and organizing teaching materials.';

comment on table public.collections is
'User-defined material groups such as English 1, Speaking Activities, Berlitz Materials, etc.';

comment on table public.lesson_materials is
'Junction table allowing the same material to be reused across multiple lessons.';

comment on column public.lesson_materials.usage_note is
'Explains how the material is used in a specific lesson.';

comment on column public.lesson_materials.sort_order is
'Controls the display order of materials within a lesson.';