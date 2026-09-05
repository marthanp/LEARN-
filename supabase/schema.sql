-- ============================================================
-- LEARN+ – Supabase RBAC SQL Schema
-- Defines user roles ('learner', 'tutor', 'admin') and automated
-- profile sync via PostgreSQL triggers.
-- ============================================================

create extension if not exists "pgcrypto";

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

-- 5. Student library metadata
-- Documents belong in Supabase Storage, not in the repository or this table.
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text,
  level text,
  country text not null default 'Uganda',
  curriculum text,
  resource_type text not null default 'textbook',
  publisher text,
  author text,
  description text,
  cover_url text,
  storage_path text,
  document_url text,
  source_attribution text,
  content_status text not null default 'metadata_only',
  content_license text,
  publication_year integer,
  is_digital boolean not null default true,
  stock_quantity integer not null default 0,
  created_at timestamptz not null default now(),
  check (resource_type in ('textbook', 'syllabus', 'teacher_guide', 'revision', 'notes', 'other')),
  check (content_status in ('available', 'metadata_only', 'restricted'))
);

create index if not exists books_level_subject_idx on public.books (level, subject);
create index if not exists books_curriculum_idx on public.books (curriculum);
alter table public.books enable row level security;

drop policy if exists "Anyone can view published library metadata" on public.books;
create policy "Anyone can view published library metadata"
  on public.books for select
  using (content_status <> 'restricted');

-- Borrowed resources are distinct from payments: a learner can save a resource
-- before content is attached, and access is granted only when content is available.
create table if not exists public.library_borrows (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  status text not null default 'active',
  borrowed_at timestamptz not null default now(),
  returned_at timestamptz,
  unique (learner_id, book_id),
  check (status in ('active', 'returned'))
);

create index if not exists library_borrows_learner_idx on public.library_borrows (learner_id, status);
alter table public.library_borrows enable row level security;

drop policy if exists "Learners manage their library borrows" on public.library_borrows;
create policy "Learners manage their library borrows"
  on public.library_borrows for all
  using (auth.uid() = learner_id)
  with check (auth.uid() = learner_id);
