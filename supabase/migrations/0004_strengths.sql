-- Strengths replace categories on the site: what kind of strength a project shows, not what it is made of.
-- Up to two per project; the first is the main one (it sets the project's colour). `category` stays for old rows
-- and the intake, but nothing visitors see reads it any more.
-- Run in the Supabase SQL editor or via the Management API. Touches nothing outside schema `portfolio`.
alter table portfolio.projects
  add column if not exists strengths text[] not null default '{}';
alter table portfolio.projects drop constraint if exists projects_strengths_check;
alter table portfolio.projects add constraint projects_strengths_check
  check (strengths <@ array['systems','product','fabrication','teaching']::text[] and cardinality(strengths) <= 2);

-- First pass from the old categories; individual projects are then tagged by hand (docs/DECISIONS.md).
update portfolio.projects set strengths = case category
    when 'engineering' then array['product']
    when 'manufacturing-shop' then array['systems']
    else array['fabrication'] end
  where strengths = '{}';
notify pgrst, 'reload schema';
