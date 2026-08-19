-- Archétype tracker-streak — migration de base.
-- Renomme `items`/`item_id` selon l'entité réelle (ex. `habits`/`habit_id`) avant d'appliquer.

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  -- adapte/ajoute les champs métier ici selon APP-SPEC.md (ex. target_per_week int, color text…)
  created_at timestamptz not null default now()
);

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  item_id uuid not null references public.items (id) on delete cascade,
  done_on date not null default current_date,
  created_at timestamptz not null default now(),
  unique (item_id, done_on) -- une seule entrée par élément et par jour
);

alter table public.items enable row level security;
alter table public.entries enable row level security;

create policy "own items only" on public.items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own entries only" on public.entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists entries_item_id_idx on public.entries (item_id);
create index if not exists entries_done_on_idx on public.entries (done_on desc);
