-- Portfolio backend schema. Run in Supabase: Dashboard → SQL Editor → New query → paste all → Run.
-- Safe to run again, and safe over the earlier version of this file (it upgrades that table in place).
--
-- Only the server touches these tables, using the secret key (it bypasses row-level security).
-- RLS stays on with no policies, so the public anon/publishable key can read or write nothing.

-- Messages -------------------------------------------------------------------------------------

create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name       text not null check (char_length(name) between 1 and 100),
  email      text not null check (char_length(email) between 3 and 254),
  subject    text not null default '' check (char_length(subject) <= 150),
  message    text not null check (char_length(message) between 1 and 5000),
  read       boolean not null default false,
  archived   boolean not null default false,
  notified   boolean not null default false  -- the Telegram alert went through
);

-- Upgrading the first version of the table (name, email, org, message).
alter table public.messages add column if not exists subject  text not null default '' check (char_length(subject) <= 150);
alter table public.messages add column if not exists read     boolean not null default false;
alter table public.messages add column if not exists archived boolean not null default false;
alter table public.messages add column if not exists notified boolean not null default false;

-- The inbox lists newest first.
create index if not exists messages_created_at_idx on public.messages (created_at desc);

alter table public.messages enable row level security;
drop policy if exists "Anyone can send a message" on public.messages;
drop policy if exists "Admin panel is open for now" on public.messages;
revoke all on public.messages from anon, authenticated;

-- Rate limiting --------------------------------------------------------------------------------
-- One row per (action, hashed IP): a hit counter for the current window.

create table if not exists public.rate_limits (
  key          text primary key,
  window_start timestamptz not null default now(),
  hits         integer not null default 0
);

alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from anon, authenticated;

-- Counts one hit for p_key and returns true while it is still within p_max per p_window_seconds.
-- A single upsert, so concurrent requests can't slip past the limit.
create or replace function public.hit_rate_limit(p_key text, p_window_seconds integer, p_max integer)
returns boolean
language sql
set search_path = public
as $$
  delete from rate_limits where window_start < now() - interval '1 day';

  insert into rate_limits as r (key, window_start, hits)
  values (p_key, now(), 1)
  on conflict (key) do update set
    hits         = case when r.window_start < now() - make_interval(secs => p_window_seconds) then 1 else r.hits + 1 end,
    window_start = case when r.window_start < now() - make_interval(secs => p_window_seconds) then now() else r.window_start end
  returning hits <= p_max;
$$;

revoke execute on function public.hit_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, integer, integer) to service_role;
