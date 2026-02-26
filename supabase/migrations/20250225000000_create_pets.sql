-- One pet per user; replaces reading companion. Run with Supabase CLI or SQL editor.
create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  seed text not null,
  name text not null default 'Companion',
  stage text not null check (stage in ('egg', 'hatchling', 'adult')),
  traits jsonb not null default '{}',
  created_at timestamptz not null default now(),
  last_evolved_at timestamptz not null default now(),
  unique(user_id)
);

-- RLS: users can only read/update their own pet
alter table public.pets enable row level security;

create policy "Users can read own pet"
  on public.pets for select
  using (auth.uid() = user_id);

create policy "Users can insert own pet"
  on public.pets for insert
  with check (auth.uid() = user_id);

create policy "Users can update own pet"
  on public.pets for update
  using (auth.uid() = user_id);

create policy "Users can delete own pet"
  on public.pets for delete
  using (auth.uid() = user_id);

-- Index for fast lookup by user
create index if not exists pets_user_id_idx on public.pets(user_id);
