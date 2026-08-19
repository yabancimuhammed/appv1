-- Archétype content-library — migration de base.
-- Renomme `library_items` selon l'entité réelle (ex. `notes`, `recipes`) avant d'appliquer.

create table if not exists public.library_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  body text not null default '',
  tags text[] not null default '{}',
  ai_summary text, -- rempli par l'edge function d'enrichissement si l'app a de l'IA, sinon reste null
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.library_items enable row level security;

create policy "own items only" on public.library_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists library_items_user_id_idx on public.library_items (user_id);
create index if not exists library_items_created_at_idx on public.library_items (created_at desc);
-- Recherche simple par titre — passe à une extension full-text si le volume grandit.
create index if not exists library_items_title_idx on public.library_items using gin (to_tsvector('simple', title));
