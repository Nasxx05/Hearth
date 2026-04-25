-- Hearth: Habit Tracker Schema
-- Paste into Supabase SQL editor to create all tables with RLS policies

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null default 'You',
  tagline text not null default 'Building quiet daily wins.',
  avatar_url text,
  vacation_start date,
  vacation_end date,
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users manage own profile"
  on profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================
-- HABITS
-- ============================================================
create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  icon text not null default 'Flame',
  color text not null default 'moss',
  category text not null default 'General',
  target_value integer not null default 1,
  target_unit text not null default 'times',
  schedule integer[] not null default '{0,1,2,3,4,5,6}',
  reminder_time text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table habits enable row level security;

create policy "Users manage own habits"
  on habits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- HABIT COMPLETIONS
-- ============================================================
create table if not exists habit_completions (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  completed_on date not null,
  unique (habit_id, completed_on)
);

alter table habit_completions enable row level security;

create policy "Users manage own completions"
  on habit_completions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- HABIT SKIPS
-- ============================================================
create table if not exists habit_skips (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  skipped_on date not null,
  unique (habit_id, skipped_on)
);

alter table habit_skips enable row level security;

create policy "Users manage own skips"
  on habit_skips for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- HABIT PAUSES
-- ============================================================
create table if not exists habit_pauses (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  start_date date not null,
  end_date date not null
);

alter table habit_pauses enable row level security;

create policy "Users manage own pauses"
  on habit_pauses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- REFLECTIONS
-- ============================================================
create table if not exists reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  habit_id uuid references habits on delete set null,
  reflection_date date not null,
  content text not null,
  created_at timestamptz default now()
);

alter table reflections enable row level security;

create policy "Users manage own reflections"
  on reflections for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- PREMIUM + STREAK FREEZE COLUMNS
-- ============================================================
alter table profiles add column if not exists is_premium boolean not null default false;
alter table habits
  add column if not exists streak_freezes integer not null default 0,
  add column if not exists last_freeze_refill date;

-- Split habit policies to enforce free-tier 3-habit limit
drop policy if exists "Users manage own habits" on habits;

create policy "Users read own habits" on habits
  for select using (auth.uid() = user_id);

create policy "Users update own habits" on habits
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own habits" on habits
  for delete using (auth.uid() = user_id);

create policy "Free users limited to 3 habits" on habits
  for insert
  with check (
    auth.uid() = user_id AND (
      (select is_premium from profiles where id = auth.uid()) = true
      OR (select count(*) from habits where user_id = auth.uid()) < 3
    )
  );

-- Weekly freeze refill (call via rpc on sign-in / mount)
create or replace function refill_freezes_weekly(p_user_id uuid)
returns void language plpgsql security definer as $$
begin
  update habits
  set streak_freezes = least(2, streak_freezes + 2),
      last_freeze_refill = current_date
  where user_id = p_user_id
    and (last_freeze_refill is null or last_freeze_refill < date_trunc('week', current_date));
end;
$$;
grant execute on function refill_freezes_weekly(uuid) to authenticated;
