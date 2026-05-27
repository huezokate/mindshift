-- MindShift Waitlist — upgrade existing table
-- The waitlist table was created earlier (manually) with: id uuid pk, email text unique, created_at timestamptz.
-- This migration brings it to spec: case-insensitive email + analytics source column.
-- Run in Supabase SQL editor (or applied via MCP apply_migration).

create extension if not exists citext;

alter table waitlist
  alter column email type citext using email::citext;

alter table waitlist
  add column if not exists source text;

create index if not exists waitlist_created_at_idx on waitlist(created_at desc);

-- RLS + the existing "anon insert" policy (INSERT WITH CHECK (true) to PUBLIC) are already in place.
-- No SELECT/UPDATE/DELETE policies = locked to service role for reads.
