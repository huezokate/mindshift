-- Mindmap milestones — add the two fields the create flow produces that 005
-- did not have a column for. Additive + idempotent; safe to re-run.
--
--   headline : the identity statement ("Become someone who …"), shown ABOVE the
--              measurable `outcome` on the review timeline and the map cards.
--              005 only had `outcome`, conflating the two — keep them separate.
--   month    : the timeline bucket gen2 (sequence-timeline) assigns — a month
--              index, or a week index for ≤1-month horizons. Lets us redraw the
--              sequenced plan after save instead of re-running the AI.

alter table mindmap_milestones add column if not exists headline text;
alter table mindmap_milestones add column if not exists month    int;
