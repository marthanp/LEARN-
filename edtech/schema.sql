


-- ============================================================
-- EduHub – Supabase / PostgreSQL Schema  (Phase 1)
-- Paste into Supabase Dashboard → SQL Editor and Run All.
-- ============================================================

-- ─────────────────────────────────────────────
-- 0. Extensions
-- ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- 1. ENUMS
-- ─────────────────────────────────────────────
create type public.user_role          as enum ('student', 'tutor');
create type public.subscription_tier  as enum ('free', 'plus', 'pro');
create type public.rental_status      as enum ('active', 'returned');
create type public.booking_status     as enum ('pending', 'confirmed', 'completed');
create type public.message_sender     as enum ('user', 'assistant');

-- ─────────────────────────────────────────────
-- 2. PROFILES  (mirrors auth.users)
-- ─────────────────────────────────────────────
create table if not exists public.profiles (
  id                uuid        primary key references auth.users (id) on delete cascade,
  full_name         text,
  email             text        unique not null,
  role              public.user_role          not null default 'student',
  subscription_tier public.subscription_tier  not null default 'free',
  avatar_url        text,
  created_at        timestamptz not null default now()
);

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
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
-- 3. BOOKS  (catalog – digital & physical)
-- ─────────────────────────────────────────────
create table if not exists public.books (
  id             uuid           primary key default uuid_generate_v4(),
  title          text           not null,
  author         text,
  isbn           text,
  cover_url      text,
  description    text,
  subject        text,
  is_digital     boolean        not null default false,
  rental_price   numeric(10,2)  not null default 0 check (rental_price >= 0),
  stock_quantity integer        not null default 0 check (stock_quantity >= 0),
  created_at     timestamptz    not null default now()
);

create index if not exists books_isbn_idx       on public.books (isbn);
create index if not exists books_is_digital_idx on public.books (is_digital);
create index if not exists books_subject_idx    on public.books (subject);

-- Uganda library metadata. Files remain in Supabase Storage, never in Git.
alter table public.books add column if not exists country text not null default 'Uganda';
alter table public.books add column if not exists level text;
alter table public.books add column if not exists curriculum text;
alter table public.books add column if not exists resource_type text not null default 'textbook';
alter table public.books add column if not exists publisher text;
alter table public.books add column if not exists storage_path text;
alter table public.books add column if not exists document_url text;
alter table public.books add column if not exists source_attribution text;
alter table public.books add column if not exists content_status text not null default 'metadata_only';
alter table public.books add column if not exists content_license text;
alter table public.books add column if not exists publication_year integer;
create index if not exists books_level_subject_idx on public.books (level, subject);

create unique index if not exists rentals_one_active_book_per_student_idx
  on public.rentals (student_id, book_id) where status = 'active';

-- Library borrow records keep curriculum access separate from pricing.
create table if not exists public.library_borrows (
  id uuid primary key default uuid_generate_v4(),
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
drop policy if exists "library_borrows_select_own" on public.library_borrows;
create policy "library_borrows_select_own" on public.library_borrows for select using (auth.uid() = learner_id);
drop policy if exists "library_borrows_insert_own" on public.library_borrows;
create policy "library_borrows_insert_own" on public.library_borrows for insert with check (auth.uid() = learner_id);
drop policy if exists "library_borrows_update_own" on public.library_borrows;
create policy "library_borrows_update_own" on public.library_borrows for update using (auth.uid() = learner_id);

-- ─────────────────────────────────────────────
-- 4. RENTALS  (physical book rentals)
-- ─────────────────────────────────────────────
create table if not exists public.rentals (
  id          uuid                 primary key default uuid_generate_v4(),
  student_id  uuid                 not null references public.profiles (id) on delete cascade,
  book_id     uuid                 not null references public.books (id)    on delete cascade,
  start_date  date                 not null default current_date,
  due_date    date                 not null,
  returned_at timestamptz,
  status      public.rental_status not null default 'active',
  created_at  timestamptz          not null default now(),
  check (due_date > start_date)
);

create index if not exists rentals_student_id_idx on public.rentals (student_id);
create index if not exists rentals_book_id_idx    on public.rentals (book_id);
create index if not exists rentals_status_idx     on public.rentals (status);

-- Trigger: decrement stock on new rental, restore on return
create or replace function public.sync_book_stock()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if TG_OP = 'INSERT' then
    update public.books set stock_quantity = greatest(stock_quantity - 1, 0) where id = new.book_id;
  elsif TG_OP = 'UPDATE' and new.status = 'returned' and old.status = 'active' then
    update public.books set stock_quantity = stock_quantity + 1 where id = new.book_id;
    update public.rentals set returned_at = now() where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_rental_change on public.rentals;
create trigger on_rental_change
  after insert or update on public.rentals
  for each row execute procedure public.sync_book_stock();

-- ─────────────────────────────────────────────
-- 5. TUTOR_PROFILES  (tutor-specific data)
-- ─────────────────────────────────────────────
create table if not exists public.tutor_profiles (
  id          uuid           primary key references public.profiles (id) on delete cascade,
  subjects    text[]         not null default '{}',
  hourly_rate numeric(10,2)  not null default 0 check (hourly_rate >= 0),
  bio         text,
  rating      numeric(3,2)   check (rating >= 0 and rating <= 5),
  location    text,
  is_online   boolean        not null default true,
  updated_at  timestamptz    not null default now()
);

create index if not exists tutor_profiles_subjects_idx on public.tutor_profiles using gin (subjects);
create index if not exists tutor_profiles_rating_idx   on public.tutor_profiles (rating desc);

-- ─────────────────────────────────────────────
-- 6. TUTOR_BOOKINGS  (physical/online sessions)
-- ─────────────────────────────────────────────
create table if not exists public.tutor_bookings (
  id             uuid                   primary key default uuid_generate_v4(),
  student_id     uuid                   not null references public.profiles (id) on delete cascade,
  tutor_id       uuid                   not null references public.profiles (id) on delete cascade,
  scheduled_at   timestamptz            not null,
  duration_hours numeric(4,2)           not null default 1 check (duration_hours > 0),
  status         public.booking_status  not null default 'pending',
  notes          text,
  total_cost     numeric(10,2)          generated always as (
                   (select hourly_rate from public.tutor_profiles where id = tutor_id) * duration_hours
                 ) stored,
  created_at     timestamptz            not null default now(),
  check (student_id <> tutor_id)
);

create index if not exists bookings_student_id_idx    on public.tutor_bookings (student_id);
create index if not exists bookings_tutor_id_idx      on public.tutor_bookings (tutor_id);
create index if not exists bookings_scheduled_at_idx  on public.tutor_bookings (scheduled_at);
create index if not exists bookings_status_idx        on public.tutor_bookings (status);

-- ─────────────────────────────────────────────
-- 7. AI_CHATS  (study sessions)
-- ─────────────────────────────────────────────
create table if not exists public.ai_chats (
  id         uuid        primary key default uuid_generate_v4(),
  student_id uuid        not null references public.profiles (id) on delete cascade,
  title      text        not null default 'New Chat',
  subject    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_chats_student_id_idx on public.ai_chats (student_id);
create index if not exists ai_chats_updated_at_idx on public.ai_chats (updated_at desc);

-- ─────────────────────────────────────────────
-- 8. AI_MESSAGES  (individual turns)
-- ─────────────────────────────────────────────
create table if not exists public.ai_messages (
  id         uuid                   primary key default uuid_generate_v4(),
  chat_id    uuid                   not null references public.ai_chats (id) on delete cascade,
  sender     public.message_sender  not null,
  content    text                   not null,
  tokens     integer,               -- optional: track usage
  created_at timestamptz            not null default now()
);

create index if not exists ai_messages_chat_id_idx on public.ai_messages (chat_id);
create index if not exists ai_messages_created_idx on public.ai_messages (created_at);

-- Touch parent chat updated_at on new message
create or replace function public.touch_chat_updated_at()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.ai_chats set updated_at = now() where id = new.chat_id;
  return new;
end;
$$;

drop trigger if exists on_ai_message_insert on public.ai_messages;
create trigger on_ai_message_insert
  after insert on public.ai_messages
  for each row execute procedure public.touch_chat_updated_at();

-- ═══════════════════════════════════════════════
-- 9. ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════

-- ── profiles ──────────────────────────────────
alter table public.profiles enable row level security;
create policy "profiles_select_all"  on public.profiles for select using (true);
create policy "profiles_update_own"  on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- ── books ──────────────────────────────────────
alter table public.books enable row level security;
create policy "books_select_all"  on public.books for select using (true);
-- Only service_role / admin inserts books (no self-service in Phase 1)

-- ── rentals ────────────────────────────────────
alter table public.rentals enable row level security;
create policy "rentals_select_own"   on public.rentals for select  using (auth.uid() = student_id);
create policy "rentals_insert_own"   on public.rentals for insert  with check (auth.uid() = student_id);
create policy "rentals_update_own"   on public.rentals for update  using (auth.uid() = student_id);

-- ── tutor_profiles ─────────────────────────────
alter table public.tutor_profiles enable row level security;
create policy "tutor_profiles_select_all"  on public.tutor_profiles for select using (true);
create policy "tutor_profiles_insert_own"  on public.tutor_profiles for insert with check (auth.uid() = id);
create policy "tutor_profiles_update_own"  on public.tutor_profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- ── tutor_bookings ─────────────────────────────
alter table public.tutor_bookings enable row level security;
create policy "bookings_select_participant" on public.tutor_bookings for select
  using (auth.uid() = student_id or auth.uid() = tutor_id);
create policy "bookings_insert_student"     on public.tutor_bookings for insert
  with check (auth.uid() = student_id);
create policy "bookings_update_participant" on public.tutor_bookings for update
  using (auth.uid() = student_id or auth.uid() = tutor_id);

-- ── ai_chats ───────────────────────────────────
alter table public.ai_chats enable row level security;
create policy "ai_chats_select_own"  on public.ai_chats for select  using (auth.uid() = student_id);
create policy "ai_chats_insert_own"  on public.ai_chats for insert  with check (auth.uid() = student_id);
create policy "ai_chats_update_own"  on public.ai_chats for update  using (auth.uid() = student_id);
create policy "ai_chats_delete_own"  on public.ai_chats for delete  using (auth.uid() = student_id);

-- ── ai_messages ────────────────────────────────
alter table public.ai_messages enable row level security;
create policy "ai_messages_select_own" on public.ai_messages for select
  using (exists (select 1 from public.ai_chats where id = chat_id and student_id = auth.uid()));
create policy "ai_messages_insert_own" on public.ai_messages for insert
  with check (exists (select 1 from public.ai_chats where id = chat_id and student_id = auth.uid()));
