-- MindShift Journal v2 — privacy, favorites, share log
-- Additive only. Existing vent_sessions + lens_responses keep working.
-- Run in Supabase SQL editor after 001_journal.sql.

alter table vent_sessions
  add column if not exists is_public boolean not null default false;

alter table vent_sessions
  add column if not exists is_demo boolean not null default false;

alter table lens_responses
  add column if not exists is_favorite boolean not null default false;

create table if not exists lens_shares (
  id          uuid primary key default gen_random_uuid(),
  response_id uuid not null references lens_responses(id) on delete cascade,
  user_id     text not null,
  platform    text not null check (platform in ('instagram','tiktok','facebook','link','native','download')),
  shared_at   timestamptz not null default now()
);

create index if not exists lens_shares_response_id_idx on lens_shares(response_id);
create index if not exists lens_shares_user_id_idx on lens_shares(user_id);

alter table lens_shares enable row level security;

create policy "lens_shares_owner" on lens_shares
  for all using (user_id = requesting_user_id());

-- Convenience view: favorite lens responses with their session context
create or replace view favorite_lenses as
  select
    lr.id            as response_id,
    lr.figure_id,
    lr.response_text,
    lr.is_favorite,
    lr.created_at    as response_created_at,
    vs.id            as session_id,
    vs.vent_text,
    vs.is_public,
    vs.theme,
    vs.created_at    as session_created_at,
    vs.user_id
  from lens_responses lr
  join vent_sessions vs on vs.id = lr.session_id
  where lr.is_favorite = true;
