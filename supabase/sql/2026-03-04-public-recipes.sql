create extension if not exists pgcrypto;

create table if not exists public.public_recipes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  minutes_total integer not null check (minutes_total > 0 and minutes_total <= 300),
  difficulty text not null check (difficulty in ('קל', 'בינוני')),
  ingredients text[] not null default '{}',
  steps text[] not null default '{}',
  tags text[] not null default '{}',
  recipe_text text not null,
  created_at timestamptz not null default now()
);

create index if not exists public_recipes_created_at_idx on public.public_recipes(created_at desc);
create index if not exists public_recipes_author_id_idx on public.public_recipes(author_id);

alter table public.public_recipes enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'public_recipes'
      and policyname = 'public_recipes_select_all'
  ) then
    create policy public_recipes_select_all
      on public.public_recipes
      for select
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'public_recipes'
      and policyname = 'public_recipes_insert_own'
  ) then
    create policy public_recipes_insert_own
      on public.public_recipes
      for insert
      to authenticated
      with check (auth.uid() = author_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'public_recipes'
      and policyname = 'public_recipes_update_own'
  ) then
    create policy public_recipes_update_own
      on public.public_recipes
      for update
      to authenticated
      using (auth.uid() = author_id)
      with check (auth.uid() = author_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'public_recipes'
      and policyname = 'public_recipes_delete_own'
  ) then
    create policy public_recipes_delete_own
      on public.public_recipes
      for delete
      to authenticated
      using (auth.uid() = author_id);
  end if;
end $$;

