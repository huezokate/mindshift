-- Comped users — emails granted Pro access for free (testers, recruited users).
-- Replaces the hardcoded COMP_EMAILS allowlist that used to live in
-- src/lib/user-tier.ts. getUserTier() reads this table server-side via the
-- service-role client (which bypasses RLS).
--
-- To grant Pro: insert a row with the user's sign-up email (Supabase Table
-- Editor → comp_users → Insert row). To revoke: delete the row. Changes are
-- live immediately — no redeploy needed.

create extension if not exists citext;

create table comp_users (
  email      citext primary key,          -- case-insensitive; one row per email
  note       text,                        -- optional: who/why (e.g. "beta tester - jane")
  created_at timestamptz not null default now()
);

-- Lock it down. RLS on + NO policies = no access for anon or authenticated
-- clients through the public API. Only the service-role key (server-side,
-- which bypasses RLS) can read this list. The comp list is never exposed
-- to the browser.
alter table comp_users enable row level security;

-- Seed the existing comp email so nothing regresses on deploy.
insert into comp_users (email, note) values
  ('test@minds-shift.com', 'original QA / catch-all account')
on conflict (email) do nothing;
