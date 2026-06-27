-- MindShift Mindmap — life-goal planning (migration 005)
-- Additive only. Independent of journal tables. Run in Supabase SQL editor
-- after 004, or via the Supabase MCP apply_migration.
--
-- Shape mirrors the create flow (`/app/mindmap/new`):
--   one MAP  = a scope (horizon + selected life areas)
--   each AREA → one GOAL  ({ outcome, obstacle, identity }, per `WoopData`)
--   each GOAL → MILESTONES (outcome + first_action + if_then)  and
--               WEEKLY_GOALS (cadence layer the Sunday email reads)
--
-- Tier caps (1 map free / 3 pro) are enforced in the API (POST /maps),
-- the same way journal usage limits are — NOT in RLS, which can't cheaply
-- count rows per user. RLS here only scopes rows to their owner.

-- ── Top-level container ──────────────────────────────────────────────────────
-- The 1-free / 3-pro cap sits on this table. One map holds several goals.
create table if not exists mindmaps (
  id            uuid primary key default gen_random_uuid(),
  user_id       text not null,
  title         text,                         -- AI/first-words summary, nullable like vent_sessions.title
  horizon_label text not null,                -- 'month' | 'quarter' | 'year' | '5 years' | 'custom'
  horizon_date  date,                          -- set only when horizon_label = 'custom'
  theme         text not null default 'notepad',
  status        text not null default 'active', -- active | archived
  created_at    timestamptz default now()
);

-- ── One goal per selected life area ──────────────────────────────────────────
create table if not exists mindmap_goals (
  id         uuid primary key default gen_random_uuid(),
  map_id     uuid not null references mindmaps(id) on delete cascade,
  user_id    text not null,
  category   text not null,                    -- AreaId: career|health|relationship|personal|finance
  outcome    text not null,                    -- "Desired outcome in {horizon}"
  obstacle   text,                             -- "Main obstacle"
  identity   text,                             -- "I want to become…"
  position   int  not null default 0,
  created_at timestamptz default now(),
  unique (map_id, category)                    -- one goal per area within a map
);

-- ── Milestones (the curated steps) ───────────────────────────────────────────
create table if not exists mindmap_milestones (
  id             uuid primary key default gen_random_uuid(),
  goal_id        uuid not null references mindmap_goals(id) on delete cascade,
  user_id        text not null,
  position       int  not null,
  outcome        text not null,                -- milestone headline / desired outcome
  first_action   text,                          -- the < 2-min "FIRST ACTION (X MIN)" tiny-habit
  if_then        text,                          -- implementation intention
  status         text not null default 'pending', -- pending | done  (no feedback loop yet; display-only)
  created_at     timestamptz default now()
);

-- ── Weekly goals (cadence layer the Sunday email reads) ──────────────────────
-- Horizon drives how many exist: month→4, quarter→~13, year→roll forward
-- (don't pre-generate 52). week_index is 1-based within the plan.
create table if not exists mindmap_weekly_goals (
  id          uuid primary key default gen_random_uuid(),
  map_id      uuid not null references mindmaps(id) on delete cascade,
  goal_id     uuid references mindmap_goals(id) on delete cascade,
  user_id     text not null,
  week_index  int  not null,
  goal_text   text not null,
  status      text not null default 'pending',
  created_at  timestamptz default now()
);

-- ── Indexes (foreign-key lookups the API + cron hit) ─────────────────────────
create index if not exists mindmaps_user_id_idx           on mindmaps(user_id);
create index if not exists mindmap_goals_map_id_idx        on mindmap_goals(map_id);
create index if not exists mindmap_milestones_goal_id_idx  on mindmap_milestones(goal_id);
create index if not exists mindmap_weekly_goals_map_id_idx on mindmap_weekly_goals(map_id);
create index if not exists mindmap_weekly_goals_week_idx   on mindmap_weekly_goals(map_id, week_index);

-- ── RLS — owner-only, same requesting_user_id() helper as journal (001) ───────
alter table mindmaps              enable row level security;
alter table mindmap_goals         enable row level security;
alter table mindmap_milestones    enable row level security;
alter table mindmap_weekly_goals  enable row level security;

create policy "mindmaps_owner"             on mindmaps             for all using (user_id = requesting_user_id());
create policy "mindmap_goals_owner"        on mindmap_goals        for all using (user_id = requesting_user_id());
create policy "mindmap_milestones_owner"   on mindmap_milestones   for all using (user_id = requesting_user_id());
create policy "mindmap_weekly_goals_owner" on mindmap_weekly_goals for all using (user_id = requesting_user_id());
