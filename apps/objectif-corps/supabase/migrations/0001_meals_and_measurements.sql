-- Objectif Corps — migration de base.
-- Compose deux archétypes (voir APP-SPEC.md) : `meals` (content-library : chaque repas scanné, enrichi
-- par IA) et `measurements` (tracker-streak : progression dans le temps ; la régularité du journal, elle,
-- se dérive de `meals.created_at` côté client, voir lib/streak.ts — pas de table entries séparée ici).

create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  photo_uri text,
  detected_foods text[] not null default '{}',
  calories_estimate integer,
  advice text,
  swap_suggestions text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  weight_kg numeric(5, 2) not null check (weight_kg > 0),
  measured_on date not null default current_date,
  created_at timestamptz not null default now(),
  unique (user_id, measured_on)
);

alter table public.meals enable row level security;
alter table public.measurements enable row level security;

create policy "own meals only" on public.meals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own measurements only" on public.measurements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists meals_user_created_idx on public.meals (user_id, created_at desc);
create index if not exists measurements_user_date_idx on public.measurements (user_id, measured_on desc);
