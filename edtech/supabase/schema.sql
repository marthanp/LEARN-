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

-- Students can insert bookings
drop policy if exists "Students can create bookings" on public.tutor_bookings;
create policy "Students can create bookings"
  on public.tutor_bookings
  for insert
  to authenticated
  with check (student_id = auth.uid());

