-- MindShift — Chat with the Lens (T-020-02)
-- Additive only. A bounded, arc-shaped multi-turn conversation with a figure.
-- The seed reframe still lives in lens_responses (one card per figure); the
-- back-and-forth accretes here, keyed on (session_id, figure_id). Does NOT touch
-- lens_responses or its unique(session_id, figure_id) constraint.
-- Run in Supabase SQL editor after 006_comp_users.sql, or via Supabase MCP.

create table if not exists lens_chat_messages (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references vent_sessions(id) on delete cascade,
  user_id     text not null,
  figure_id   text not null,
  role        text not null check (role in ('user','lens')),
  content     text not null,
  turn_index  int  not null,
  -- set true on the lens message that gracefully closed the thread (AI-decided
  -- wrap-up or the 20-user-message hard cap).
  done        boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Primary read: fetch a thread in order for one (session, figure).
create index if not exists lens_chat_session_figure_idx
  on lens_chat_messages(session_id, figure_id, turn_index);
create index if not exists lens_chat_user_idx on lens_chat_messages(user_id);

alter table lens_chat_messages enable row level security;

-- Owner policy mirrors the other journal tables. Routes use the service-role
-- admin client with a manual user_id filter; this is defense-in-depth.
create policy "lens_chat_owner" on lens_chat_messages
  for all using (user_id = requesting_user_id());
