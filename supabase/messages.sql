-- Run once in Supabase: Dashboard → SQL Editor → New query → paste → Run.

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 200),
  email text not null check (char_length(email) between 3 and 320),
  org text check (char_length(org) <= 200),
  message text not null check (char_length(message) between 1 and 5000)
);

alter table public.messages enable row level security;

grant insert, select on public.messages to anon;

-- Visitors can leave a message.
create policy "Anyone can send a message"
  on public.messages for insert to anon with check (true);

-- The admin panel is open for now: anyone holding the public anon key can read messages.
-- Drop this policy once the panel gets a login.
create policy "Admin panel is open for now"
  on public.messages for select to anon using (true);
