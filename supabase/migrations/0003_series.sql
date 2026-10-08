-- Groups related project pages (e.g. the Ely Tool summer) into one card on /work.
-- Run in the Supabase SQL editor or via the Management API. Touches nothing outside schema `portfolio`.
alter table portfolio.projects
  add column if not exists series       text,
  add column if not exists series_order integer;
