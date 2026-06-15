-- MindShift — Gemini-generated entry titles (T-018-07)
-- Additive only. Existing vent_sessions rows read NULL and fall back to a
-- first-words title at render. Run in Supabase SQL editor after 003, or via
-- the Supabase MCP apply_migration.

alter table vent_sessions
  add column if not exists title text;
