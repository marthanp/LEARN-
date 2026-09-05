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
