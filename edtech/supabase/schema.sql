-- ============================================================
-- LEARN+ – Supabase RBAC SQL Schema
-- Defines user roles ('learner', 'tutor', 'admin') and automated
-- profile sync via PostgreSQL triggers.
-- ============================================================

-- 1. Custom User Role Enum
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('learner', 'tutor', 'admin');
  end if;
end$$;

-- 2. Profiles Table (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text not null,
  role public.user_role not null default 'learner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for quick role lookups
create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_email_idx on public.profiles (email);

-- 3. Automatic Profile Creation Function & Trigger on auth.users insert
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  raw_role_str text;
  assigned_role public.user_role;
begin
  -- Extract role from metadata, falling back to 'learner'
  raw_role_str := lower(coalesce(new.raw_user_meta_data ->> 'role', 'learner'));

  -- Cast safely to user_role enum
  begin
    assigned_role := raw_role_str::public.user_role;
  exception when others then
    assigned_role := 'learner'::public.user_role;
  end;

  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    assigned_role
  )
  on conflict (id) do update
  set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    email = excluded.email,
    role = coalesce(excluded.role, public.profiles.role),
    updated_at = now();

  return new;
end;
$$;

-- Trigger firing AFTER INSERT on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 4. Configure Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Policy: Users can read their own profile
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- Policy: Users can update their own profile
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Policy: Admins can view all profiles
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- 5. Tutor Profiles Table & RLS
-- ============================================================
create table if not exists public.tutor_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  subjects text[] not null default '{}',
  hourly_rate integer not null default 35000, -- in UGX
  bio text,
  rating numeric(3, 2) default 4.90,
  location text default 'Makerere Main Campus',
  campus_venue text default 'Main Library Study Carrels',
  is_online boolean not null default true,
  verification_status text not null default 'verified', -- 'pending', 'verified', 'rejected'
  credentials_url text,
  updated_at timestamptz not null default now()
);

alter table public.tutor_profiles enable row level security;

-- Public read for active verified tutors (learners need to browse tutors)
drop policy if exists "Public can view verified tutor profiles" on public.tutor_profiles;
create policy "Public can view verified tutor profiles"
  on public.tutor_profiles
  for select
  to authenticated
  using (true);

-- Tutors can update strictly their own profile
drop policy if exists "Tutors can update own tutor profile" on public.tutor_profiles;
create policy "Tutors can update own tutor profile"
  on public.tutor_profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Tutors can insert their own profile
drop policy if exists "Tutors can insert own tutor profile" on public.tutor_profiles;
create policy "Tutors can insert own tutor profile"
  on public.tutor_profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

-- ============================================================
-- 6. Tutor Bookings Table & RLS
-- ============================================================
create table if not exists public.tutor_bookings (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  tutor_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null,
  topic text,
  physical_location text not null default 'Makerere Main Library, Room 3B',
  scheduled_at timestamptz not null,
  duration_hours numeric(3, 1) not null default 1.0,
  status text not null default 'pending', -- 'pending', 'confirmed', 'completed', 'declined'
  notes text,
  total_cost integer not null default 35000, -- in UGX
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tutor_bookings enable row level security;

-- Tutors can select bookings where tutor_id = auth.uid()
drop policy if exists "Tutors can view their own bookings" on public.tutor_bookings;
create policy "Tutors can view their own bookings"
  on public.tutor_bookings
  for select
  to authenticated
  using (tutor_id = auth.uid() or student_id = auth.uid());

-- Tutors can update status of their own bookings
drop policy if exists "Tutors can update their assigned bookings" on public.tutor_bookings;
create policy "Tutors can update their assigned bookings"
  on public.tutor_bookings
  for update
  to authenticated
  using (tutor_id = auth.uid())
  with check (tutor_id = auth.uid());

drop policy if exists "Students can create bookings" on public.tutor_bookings;
create policy "Students can create bookings"
  on public.tutor_bookings
  for insert
  to authenticated
  with check (student_id = auth.uid());

-- ============================================================
-- 7. EXAMINATIONS, RESULTS & NATIVE PAST PAPERS
-- ============================================================

create or replace function public.is_exam_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('tutor', 'admin')
  );
$$;

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text not null,
  description text not null default '',
  duration_minutes integer not null check (duration_minutes between 1 and 1440),
  starts_at timestamptz not null,
  closes_at timestamptz not null,
  total_marks numeric(8,2) not null default 0 check (total_marks >= 0),
  published boolean not null default false,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (closes_at > starts_at)
);

create table if not exists public.exam_questions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  question_number integer not null check (question_number > 0),
  question_text text not null,
  question_type text not null check (question_type in ('multiple_choice', 'true_false', 'short_answer', 'long_text')),
  marks numeric(8,2) not null check (marks > 0),
  options jsonb not null default '[]'::jsonb,
  correct_answer text,
  rubric text,
  topic text,
  unique (exam_id, question_number)
);

create table if not exists public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  learner_id uuid not null references public.profiles(id) on delete cascade,
  started_at timestamptz not null default now(),
  due_at timestamptz not null,
  submitted_at timestamptz,
  status text not null default 'in_progress' check (status in ('in_progress', 'submitted', 'expired')),
  result_status text not null default 'in_progress' check (result_status in ('in_progress', 'submitted', 'marking', 'marked', 'marking_failed')),
  marks_obtained numeric(8,2),
  maximum_marks numeric(8,2),
  percentage numeric(5,2),
  created_at timestamptz not null default now(),
  unique (id, learner_id)
);

create unique index if not exists one_active_exam_attempt_per_learner
  on public.exam_attempts (exam_id, learner_id) where status = 'in_progress';

create table if not exists public.exam_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.exam_attempts(id) on delete cascade,
  question_id uuid not null references public.exam_questions(id) on delete cascade,
  answer_text text not null default '',
  saved_at timestamptz not null default now(),
  marks_awarded numeric(8,2),
  result_status text check (result_status in ('correct', 'partially_correct', 'incorrect')),
  feedback text,
  explanation text,
  unique (attempt_id, question_id)
);

create table if not exists public.exam_results (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null unique references public.exam_attempts(id) on delete cascade,
  overall_feedback text not null default '',
  areas_to_improve jsonb not null default '[]'::jsonb,
  result_status text not null default 'marked' check (result_status in ('submitted', 'marking', 'marked', 'marking_failed')),
  marked_at timestamptz not null default now(),
  marked_by text not null default 'system'
);

-- Additive migration for deployments that already created the exam tables.
alter table public.exam_attempts add column if not exists result_status text not null default 'in_progress';
alter table public.exam_attempts add column if not exists maximum_marks numeric(8,2);
alter table public.exam_results add column if not exists result_status text not null default 'marked';
alter table public.exam_attempts drop constraint if exists exam_attempts_result_status_check;
alter table public.exam_attempts add constraint exam_attempts_result_status_check check (result_status in ('in_progress', 'submitted', 'marking', 'marked', 'marking_failed'));
alter table public.exam_results drop constraint if exists exam_results_result_status_check;
alter table public.exam_results add constraint exam_results_result_status_check check (result_status in ('submitted', 'marking', 'marked', 'marking_failed'));

create table if not exists public.past_papers (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  year integer not null check (year between 1900 and 2100),
  examination_name text not null,
  paper_number text not null,
  level text,
  instructions text not null default '',
  source_file_path text,
  published boolean not null default false,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.past_paper_questions (
  id uuid primary key default gen_random_uuid(),
  past_paper_id uuid not null references public.past_papers(id) on delete cascade,
  question_number integer not null check (question_number > 0),
  question_text text not null,
  question_type text not null check (question_type in ('multiple_choice', 'true_false', 'short_answer', 'long_text')),
  marks numeric(8,2) not null check (marks > 0),
  options jsonb not null default '[]'::jsonb,
  correct_answer text,
  marking_guide text,
  topic text,
  unique (past_paper_id, question_number)
);

create table if not exists public.practice_attempts (
  id uuid primary key default gen_random_uuid(),
  past_paper_id uuid not null references public.past_papers(id) on delete cascade,
  learner_id uuid not null references public.profiles(id) on delete cascade,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  marks_obtained numeric(8,2),
  total_marks numeric(8,2),
  feedback text,
  areas_to_improve jsonb not null default '[]'::jsonb
);

create table if not exists public.practice_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.practice_attempts(id) on delete cascade,
  question_id uuid not null references public.past_paper_questions(id) on delete cascade,
  answer_text text not null default '',
  marks_awarded numeric(8,2),
  result_status text check (result_status in ('correct', 'partially_correct', 'incorrect')),
  feedback text,
  explanation text,
  unique (attempt_id, question_id)
);

alter table public.exams enable row level security;
alter table public.exam_questions enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.exam_answers enable row level security;
alter table public.exam_results enable row level security;
alter table public.past_papers enable row level security;
alter table public.past_paper_questions enable row level security;
alter table public.practice_attempts enable row level security;
alter table public.practice_answers enable row level security;

drop policy if exists "Published exams are visible to learners" on public.exams;
create policy "Published exams are visible to learners" on public.exams for select to authenticated
  using (published = true or public.is_exam_staff());
drop policy if exists "Exam staff manage exams" on public.exams;
create policy "Exam staff manage exams" on public.exams for all to authenticated
  using (public.is_exam_staff()) with check (public.is_exam_staff());
drop policy if exists "Exam questions follow exam access" on public.exam_questions;
create policy "Exam questions follow exam access" on public.exam_questions for select to authenticated
  using (exists (select 1 from public.exams e where e.id = exam_id and (e.published = true or public.is_exam_staff())));
drop policy if exists "Exam staff manage questions" on public.exam_questions;
create policy "Exam staff manage questions" on public.exam_questions for all to authenticated
  using (public.is_exam_staff()) with check (public.is_exam_staff());
drop policy if exists "Learners own attempts" on public.exam_attempts;
create policy "Learners own attempts" on public.exam_attempts for all to authenticated
  using (learner_id = auth.uid() or public.is_exam_staff())
  with check (learner_id = auth.uid() or public.is_exam_staff());
drop policy if exists "Learners own answers" on public.exam_answers;
create policy "Learners own answers" on public.exam_answers for all to authenticated
  using (exists (select 1 from public.exam_attempts a where a.id = attempt_id and (a.learner_id = auth.uid() or public.is_exam_staff())))
  with check (exists (select 1 from public.exam_attempts a where a.id = attempt_id and (a.learner_id = auth.uid() or public.is_exam_staff())));
drop policy if exists "Learners own results" on public.exam_results;
create policy "Learners own results" on public.exam_results for select to authenticated
  using (exists (select 1 from public.exam_attempts a where a.id = attempt_id and (a.learner_id = auth.uid() or public.is_exam_staff())));
drop policy if exists "Learners create own results" on public.exam_results;
create policy "Learners create own results" on public.exam_results for insert to authenticated
  with check (exists (select 1 from public.exam_attempts a where a.id = attempt_id and (a.learner_id = auth.uid() or public.is_exam_staff())));
drop policy if exists "Learners update own results" on public.exam_results;
create policy "Learners update own results" on public.exam_results for update to authenticated
  using (exists (select 1 from public.exam_attempts a where a.id = attempt_id and (a.learner_id = auth.uid() or public.is_exam_staff())))
  with check (exists (select 1 from public.exam_attempts a where a.id = attempt_id and (a.learner_id = auth.uid() or public.is_exam_staff())));

drop policy if exists "Published papers are visible" on public.past_papers;
create policy "Published papers are visible" on public.past_papers for select to authenticated
  using (published = true or public.is_exam_staff());
drop policy if exists "Paper staff manage papers" on public.past_papers;
create policy "Paper staff manage papers" on public.past_papers for all to authenticated
  using (public.is_exam_staff()) with check (public.is_exam_staff());
drop policy if exists "Published paper questions are visible" on public.past_paper_questions;
create policy "Published paper questions are visible" on public.past_paper_questions for select to authenticated
  using (exists (select 1 from public.past_papers p where p.id = past_paper_id and (p.published = true or public.is_exam_staff())));
drop policy if exists "Paper staff manage questions" on public.past_paper_questions;
create policy "Paper staff manage questions" on public.past_paper_questions for all to authenticated
  using (public.is_exam_staff()) with check (public.is_exam_staff());
drop policy if exists "Learners own practice attempts" on public.practice_attempts;
create policy "Learners own practice attempts" on public.practice_attempts for all to authenticated
  using (learner_id = auth.uid() or public.is_exam_staff())
  with check (learner_id = auth.uid() or public.is_exam_staff());
drop policy if exists "Learners own practice answers" on public.practice_answers;
create policy "Learners own practice answers" on public.practice_answers for all to authenticated
  using (exists (select 1 from public.practice_attempts a where a.id = attempt_id and (a.learner_id = auth.uid() or public.is_exam_staff())))
  with check (exists (select 1 from public.practice_attempts a where a.id = attempt_id and (a.learner_id = auth.uid() or public.is_exam_staff())));

