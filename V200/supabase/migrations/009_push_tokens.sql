-- MindShift — native weekly-nudge push tokens (T-030-05)
-- Additive only. One row per device push token; the token is the primary key
-- so re-registration is an upsert and a device changing accounts transfers
-- ownership. The Sunday cron reads these to send the weekly nudge alongside
-- the email digest; tokens Expo reports as DeviceNotRegistered are pruned.
-- Apply via Supabase MCP as part of releasing the T-030-05 PR (gated process
-- in docs/knowledge/migration-process.md) — never by hand in the SQL editor.

create table if not exists push_tokens (
  token      text primary key,
  user_id    text not null,
  platform   text not null default 'ios' check (platform in ('ios', 'android')),
  updated_at timestamptz not null default now()
);

-- Primary read: all tokens for the digest users (cron), and per-user revoke.
create index if not exists push_tokens_user_idx on push_tokens(user_id);

alter table push_tokens enable row level security;

-- No anon/user policies on purpose: every access path is the service-role
-- admin client behind /api/push/register (owner-scoped in the route) and the
-- CRON_SECRET-gated sunday-reminder. Defense-in-depth owner policy mirrors
-- the other journal tables for any future authenticated-client access.
create policy "push_tokens_owner" on push_tokens
  for all using (requesting_user_id() = user_id)
  with check (requesting_user_id() = user_id);
