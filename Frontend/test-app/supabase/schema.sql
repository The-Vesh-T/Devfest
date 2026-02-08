create extension if not exists pgcrypto;

create table if not exists custom_foods (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null,
  servings numeric not null default 1,
  calories int not null default 0,
  protein int not null default 0,
  carbs int not null default 0,
  fat int not null default 0,
  detail text not null default '',
  favorite boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists custom_foods_user_idx on custom_foods (user_id, created_at desc);

create table if not exists meal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  consumed_on date not null,
  name text not null,
  calories int not null default 0,
  protein int not null default 0,
  carbs int not null default 0,
  fat int not null default 0,
  detail text not null default '',
  source text not null default 'manual',
  barcode text,
  created_at timestamptz not null default now()
);

create index if not exists meal_entries_user_date_idx on meal_entries (user_id, consumed_on desc, created_at desc);

create table if not exists workout_routines (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text not null,
  meta text not null default '',
  description text not null default '',
  exercises jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists workout_routines_user_idx on workout_routines (user_id, created_at desc);

create table if not exists workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text not null,
  exercise_count int not null default 0,
  set_count int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists workout_sessions_user_idx on workout_sessions (user_id, created_at desc);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  author text not null,
  title text not null default 'Post',
  body text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists posts_created_idx on posts (created_at desc);
create index if not exists posts_user_idx on posts (user_id, created_at desc);

create table if not exists post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  user_id text not null,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index if not exists post_likes_post_idx on post_likes (post_id, created_at desc);

create table if not exists post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  user_id text not null,
  author text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists post_comments_post_idx on post_comments (post_id, created_at desc);
