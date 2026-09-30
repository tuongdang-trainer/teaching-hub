-- ============================================================
-- TEACHING HUB
-- Initial database schema
-- ============================================================

create extension if not exists "uuid-ossp";


-- ============================================================
-- 1. PROFILES
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text not null default 'teacher',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- 2. COURSES
-- ============================================================

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text,
  description text,
  level text,
  provider text,
  duration text,
  status text not null default 'active',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- 3. CURRICULUM UNITS
-- ============================================================

create table public.curriculum_units (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  parent_id uuid references public.curriculum_units(id) on delete cascade,
  unit_number integer,
  title text not null,
  description text,
  objectives text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- 4. CLASSES
-- ============================================================

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  course_id uuid references public.courses(id) on delete set null,
  teacher_id uuid references public.profiles(id) on delete set null,
  level text,
  location text,
  schedule jsonb,
  start_date date,
  end_date date,
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- 5. LEARNERS
-- ============================================================

create table public.learners (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  preferred_name text,
  email text,
  phone text,
  employee_id text,
  current_level text,
  status text not null default 'active',
  avatar_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- 6. CLASS ENROLLMENTS
-- ============================================================

create table public.class_enrollments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  learner_id uuid not null references public.learners(id) on delete cascade,
  enrolled_at date not null default current_date,
  left_at date,
  status text not null default 'active',
  notes text,
  unique(class_id, learner_id)
);


-- ============================================================
-- 7. LESSONS
-- ============================================================

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete set null,
  unit_id uuid references public.curriculum_units(id) on delete set null,
  class_id uuid references public.classes(id) on delete set null,
  teacher_id uuid references public.profiles(id) on delete set null,
  title text not null,
  lesson_number integer,
  topic text,
  duration integer,
  objective text,
  language_focus text,
  vocabulary_focus text,
  skill_focus text,
  status text not null default 'draft',
  scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- 8. LESSON PLANS
-- ============================================================

create table public.lesson_plans (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null unique references public.lessons(id) on delete cascade,
  opening text,
  presentation text,
  guided_practice text,
  general_practice text,
  performance text,
  retry text,
  teacher_notes text,
  learner_notes text,
  materials_notes text,
  homework text,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- 9. LESSON STEPS
-- ============================================================

create table public.lesson_steps (
  id uuid primary key default gen_random_uuid(),
  lesson_plan_id uuid not null references public.lesson_plans(id) on delete cascade,
  step_order integer not null,
  section text not null,
  title text,
  duration integer,
  story_beat text,
  teacher_action text,
  learner_action text,
  rationale text,
  notes text,
  created_at timestamptz not null default now()
);


-- ============================================================
-- 10. ACTIVITIES
-- ============================================================

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  activity_type text,
  level text,
  skill text,
  duration integer,
  instructions text,
  teacher_notes text,
  learner_instructions text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- 11. LESSON ACTIVITIES
-- ============================================================

create table public.lesson_activities (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  activity_id uuid not null references public.activities(id) on delete cascade,
  order_index integer,
  notes text,
  unique(lesson_id, activity_id)
);


-- ============================================================
-- 12. MATERIALS
-- ============================================================

create table public.materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  type text not null,
  file_url text,
  thumbnail_url text,
  level text,
  topic text,
  skill text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- 13. LESSON MATERIALS
-- ============================================================

create table public.lesson_materials (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  material_id uuid not null references public.materials(id) on delete cascade,
  usage text,
  unique(lesson_id, material_id)
);


-- ============================================================
-- 14. ATTENDANCE SESSIONS
-- ============================================================

create table public.attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete set null,
  date date not null,
  start_time time,
  end_time time,
  status text not null default 'scheduled',
  notes text,
  created_at timestamptz not null default now()
);


-- ============================================================
-- 15. ATTENDANCE RECORDS
-- ============================================================

create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.attendance_sessions(id) on delete cascade,
  learner_id uuid not null references public.learners(id) on delete cascade,
  status text not null,
  check_in_time timestamptz,
  note text,
  unique(session_id, learner_id)
);


-- ============================================================
-- 16. LEARNER NOTES
-- ============================================================

create table public.learner_notes (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.learners(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  lesson_id uuid references public.lessons(id) on delete set null,
  note_type text not null default 'general',
  content text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- 17. ASSESSMENTS
-- ============================================================

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  course_id uuid references public.courses(id) on delete set null,
  class_id uuid references public.classes(id) on delete set null,
  lesson_id uuid references public.lessons(id) on delete set null,
  max_score numeric,
  date date,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- 18. ASSESSMENT RESULTS
-- ============================================================

create table public.assessment_results (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  learner_id uuid not null references public.learners(id) on delete cascade,
  score numeric,
  percentage numeric,
  feedback text,
  strengths text,
  areas_to_improve text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(assessment_id, learner_id)
);


-- ============================================================
-- INDEXES
-- ============================================================

create index idx_classes_course_id
  on public.classes(course_id);

create index idx_classes_teacher_id
  on public.classes(teacher_id);

create index idx_class_enrollments_class_id
  on public.class_enrollments(class_id);

create index idx_class_enrollments_learner_id
  on public.class_enrollments(learner_id);

create index idx_lessons_class_id
  on public.lessons(class_id);

create index idx_lessons_course_id
  on public.lessons(course_id);

create index idx_lessons_scheduled_at
  on public.lessons(scheduled_at);

create index idx_attendance_sessions_class_id
  on public.attendance_sessions(class_id);

create index idx_attendance_records_learner_id
  on public.attendance_records(learner_id);

create index idx_learner_notes_learner_id
  on public.learner_notes(learner_id);

create index idx_assessment_results_learner_id
  on public.assessment_results(learner_id);