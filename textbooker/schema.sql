-- ============================================================
-- TextBooker – Supabase / PostgreSQL Schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- ─────────────────────────────────────────────
-- 0. Extensions
-- ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- 1. PROFILES
--    Mirrors auth.users; created via trigger on sign-up.
-- ─────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  email       text unique not null,
  created_at  timestamptz not null default now()
);

-- Trigger: auto-create profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────
-- 2. BOOKS
--    Textbook listings created by sellers.
-- ─────────────────────────────────────────────
create type public.book_condition as enum ('new', 'like_new', 'good', 'fair', 'poor');
create type public.book_status    as enum ('available', 'sold');

create table if not exists public.books (
  id          uuid primary key default uuid_generate_v4(),
  seller_id   uuid not null references public.profiles (id) on delete cascade,
  title       text not null,
  author      text,
  isbn        text,
  cover_url   text,
  condition   public.book_condition not null default 'good',
  price       numeric(10, 2) not null check (price >= 0),
  course_code text,
  status      public.book_status not null default 'available',
  created_at  timestamptz not null default now()
);

create index if not exists books_seller_id_idx   on public.books (seller_id);
create index if not exists books_status_idx      on public.books (status);
create index if not exists books_course_code_idx on public.books (course_code);
create index if not exists books_isbn_idx        on public.books (isbn);

-- ─────────────────────────────────────────────
-- 3. REQUESTS
--    Community book-request pool.
-- ─────────────────────────────────────────────
create type public.request_status as enum ('open', 'fulfilled');

create table if not exists public.requests (
  id            uuid primary key default uuid_generate_v4(),
  requester_id  uuid not null references public.profiles (id) on delete cascade,
  title         text not null,
  author        text,
  isbn          text,
  course_code   text,
  upvote_count  integer not null default 0,
  status        public.request_status not null default 'open',
  created_at    timestamptz not null default now()
);

create index if not exists requests_requester_id_idx on public.requests (requester_id);
create index if not exists requests_status_idx       on public.requests (status);
create index if not exists requests_upvote_count_idx on public.requests (upvote_count desc);

-- ─────────────────────────────────────────────
-- 4. REQUEST_UPVOTES
--    Junction table – one row per (user, request) pair.
-- ─────────────────────────────────────────────
create table if not exists public.request_upvotes (
  id          uuid primary key default uuid_generate_v4(),
  request_id  uuid not null references public.requests (id) on delete cascade,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (request_id, user_id)
);

create index if not exists request_upvotes_request_id_idx on public.request_upvotes (request_id);
create index if not exists request_upvotes_user_id_idx    on public.request_upvotes (user_id);

-- Trigger: keep upvote_count in sync automatically
create or replace function public.sync_upvote_count()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if (TG_OP = 'INSERT') then
    update public.requests
    set upvote_count = upvote_count + 1
    where id = new.request_id;
  elsif (TG_OP = 'DELETE') then
    update public.requests
    set upvote_count = greatest(upvote_count - 1, 0)
    where id = old.request_id;
  end if;
  return null;
end;
$$;

drop trigger if exists on_upvote_change on public.request_upvotes;
create trigger on_upvote_change
  after insert or delete on public.request_upvotes
  for each row execute procedure public.sync_upvote_count();

-- ─────────────────────────────────────────────
-- 5. ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────

-- ── profiles ──────────────────────────────────
alter table public.profiles enable row level security;

create policy "profiles_select_all"
  on public.profiles for select using (true);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ── books ──────────────────────────────────────
alter table public.books enable row level security;

create policy "books_select_all"
  on public.books for select using (true);

create policy "books_insert_own"
  on public.books for insert
  with check (auth.uid() = seller_id);

create policy "books_update_own"
  on public.books for update
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

create policy "books_delete_own"
  on public.books for delete
  using (auth.uid() = seller_id);

-- ── requests ───────────────────────────────────
alter table public.requests enable row level security;

create policy "requests_select_all"
  on public.requests for select using (true);

create policy "requests_insert_own"
  on public.requests for insert
  with check (auth.uid() = requester_id);

create policy "requests_update_own"
  on public.requests for update
  using (auth.uid() = requester_id)
  with check (auth.uid() = requester_id);

create policy "requests_delete_own"
  on public.requests for delete
  using (auth.uid() = requester_id);

-- ── request_upvotes ────────────────────────────
alter table public.request_upvotes enable row level security;

create policy "upvotes_select_all"
  on public.request_upvotes for select using (true);

create policy "upvotes_insert_own"
  on public.request_upvotes for insert
  with check (auth.uid() = user_id);

create policy "upvotes_delete_own"
  on public.request_upvotes for delete
  using (auth.uid() = user_id);
