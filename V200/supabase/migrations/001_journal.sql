-- MindShift Journal Schema
-- Run this once in Supabase SQL Editor: https://supabase.com/dashboard/project/wwszertnwbsdwbkzrupk/sql

-- One row per vent session
create table if not exists vent_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null,
  vent_text  text not null,
  theme      text not null default 'cyberpunk',
  created_at timestamptz default now()
);

-- One row per lens applied to a session
create table if not exists lens_responses (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid not null references vent_sessions(id) on delete cascade,
  user_id       text not null,
  figure_id     text not null,
  response_text text not null,
  created_at    timestamptz default now(),
  unique (session_id, figure_id)
);

-- Helper used by RLS policies (Clerk user_id via JWT sub)
create or replace function requesting_user_id() returns text
  language sql stable
  as $$ select nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text $$;

-- RLS: users can only see their own rows
alter table vent_sessions   enable row level security;
alter table lens_responses  enable row level security;

create policy "vent_sessions_owner" on vent_sessions
  for all using (user_id = requesting_user_id());

create policy "lens_responses_owner" on lens_responses
  for all using (user_id = requesting_user_id());
