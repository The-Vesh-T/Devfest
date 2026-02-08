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

create table if not exists common_meals (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  calories int not null default 0,
  protein int not null default 0,
  carbs int not null default 0,
  fat int not null default 0,
  detail text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists common_meals_created_idx on common_meals (created_at asc);

insert into common_meals (name, calories, protein, carbs, fat, detail)
values
  ('Chicken Rice Bowl', 520, 40, 58, 14, 'Grilled chicken • jasmine rice • mixed veggies'),
  ('Turkey Sandwich', 430, 30, 46, 12, 'Turkey breast • whole wheat bread • light mayo'),
  ('Greek Yogurt Parfait', 280, 20, 30, 8, 'Greek yogurt • berries • granola'),
  ('Salmon Salad', 460, 36, 18, 24, 'Salmon • greens • olive oil vinaigrette'),
  ('Oatmeal With Banana', 350, 12, 58, 7, 'Rolled oats • banana • peanut butter'),
  ('Egg White Scramble', 300, 28, 16, 12, 'Egg whites • spinach • feta'),
  ('Beef Burrito Bowl', 610, 42, 62, 20, 'Lean beef • rice • beans • salsa'),
  ('Protein Smoothie', 320, 32, 28, 8, 'Whey protein • milk • banana'),
  ('Tuna Wrap', 390, 33, 34, 12, 'Tuna • whole wheat wrap • lettuce'),
  ('Avocado Toast And Eggs', 410, 19, 34, 22, 'Sourdough • avocado • 2 eggs'),
  ('Shrimp Stir Fry', 470, 39, 44, 14, 'Shrimp • veggies • rice'),
  ('Grilled Chicken Caesar', 440, 41, 16, 24, 'Chicken • romaine • parmesan'),
  ('Tofu Veggie Bowl', 420, 24, 48, 14, 'Tofu • quinoa • roasted veggies'),
  ('Pasta With Meat Sauce', 640, 35, 72, 22, 'Penne • lean beef • tomato sauce'),
  ('Cottage Cheese Bowl', 260, 28, 18, 8, 'Cottage cheese • berries • chia'),
  ('Peanut Butter Toast', 300, 11, 31, 15, 'Whole grain toast • peanut butter'),
  ('Chicken Quesadilla', 560, 36, 42, 28, 'Chicken • tortilla • cheese'),
  ('Veggie Omelet', 290, 25, 10, 16, 'Eggs • peppers • mushrooms • onion'),
  ('Steak And Potatoes', 690, 48, 52, 30, 'Sirloin • roasted potatoes • greens'),
  ('Overnight Oats', 360, 16, 49, 11, 'Oats • milk • berries'),
  ('Poke Bowl', 520, 34, 56, 16, 'Ahi tuna • rice • edamame'),
  ('Chicken Alfredo', 720, 42, 58, 34, 'Chicken • fettuccine • alfredo sauce'),
  ('Lentil Soup And Bread', 410, 21, 58, 9, 'Lentil soup • whole grain bread'),
  ('Breakfast Burrito', 540, 29, 46, 24, 'Eggs • beans • tortilla • salsa'),
  ('Ground Turkey Bowl', 500, 38, 44, 18, 'Ground turkey • rice • veggies'),
  ('Sushi Roll Set', 430, 21, 62, 10, '2 rolls • miso soup'),
  ('Chickpea Salad', 370, 15, 42, 14, 'Chickpeas • cucumber • tomato'),
  ('Chicken Noodle Soup', 310, 23, 28, 10, 'Chicken broth • noodles • veg'),
  ('Yogurt Protein Bowl', 340, 29, 32, 10, 'Skyr • fruit • granola'),
  ('Rice And Beans Plate', 480, 17, 74, 12, 'Rice • black beans • pico'),
  ('Teriyaki Chicken Plate', 590, 37, 68, 18, 'Chicken • rice • teriyaki sauce'),
  ('Turkey Chili', 450, 34, 38, 16, 'Ground turkey • beans • tomato')
on conflict (name) do nothing;

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

create table if not exists workout_set_entries (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  session_id uuid not null references workout_sessions(id) on delete cascade,
  exercise_name text not null,
  set_index int not null default 1,
  weight numeric,
  reps int,
  failure boolean not null default false,
  dropset boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists workout_set_entries_user_idx on workout_set_entries (user_id, exercise_name, created_at desc);

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
