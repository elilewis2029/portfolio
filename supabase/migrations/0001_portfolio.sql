-- Portfolio schema: PLAN.md schema with the CLAUDE.md overrides applied.
-- Safe to run on an empty project OR on top of the original PLAN.md SQL (it upgrades in place).
-- Run in the Supabase SQL editor. Touches nothing outside schema `portfolio` and bucket `portfolio`.

create schema if not exists portfolio;

do $$ begin create type portfolio.status as enum ('draft','published');
exception when duplicate_object then null; end $$;
do $$ begin create type portfolio.era as enum ('current','archive');
exception when duplicate_object then null; end $$;

create table if not exists portfolio.projects (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  tagline     text,
  body_md     text,                 -- optional free text; page renders from structured fields
  category    text not null default 'design-craft',
  tags        text[] not null default '{}',  -- legacy; no longer written
  year        int,
  status      portfolio.status not null default 'draft',
  era         portfolio.era not null default 'current',
  featured    boolean not null default false,
  cover_media uuid,
  source_url  text,                 -- old Wix URL, for the import
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Structured fields from RESEARCH.md
alter table portfolio.projects
  add column if not exists summary          text,
  add column if not exists role             text,
  add column if not exists role_kind        text,
  add column if not exists goal_constraints text,
  add column if not exists process_md       text,
  add column if not exists result_metric    text,
  add column if not exists lesson           text,
  add column if not exists duration         text,
  add column if not exists tools            text[] not null default '{}',
  add column if not exists skills           text[] not null default '{}',
  add column if not exists audience         text[] not null default '{}',
  add column if not exists links            jsonb  not null default '{}';

-- Upgrade path: old enum categories -> new text categories.
update portfolio.projects
   set skills = array_append(skills, 'leadership')
 where category::text = 'makerspace' and not ('leadership' = any(skills));
alter table portfolio.projects alter column category drop default;
alter table portfolio.projects alter column category type text using (
  case category::text
    when 'shop-work'  then 'manufacturing-shop'
    when 'making'     then 'design-craft'
    when 'craft'      then 'design-craft'
    when 'makerspace' then 'engineering'
    else category::text end);
alter table portfolio.projects alter column category set default 'design-craft';
drop type if exists portfolio.category;

alter table portfolio.projects drop constraint if exists projects_category_check;
alter table portfolio.projects add constraint projects_category_check
  check (category in ('engineering','manufacturing-shop','electronics','design-craft'));
alter table portfolio.projects drop constraint if exists projects_role_kind_check;
alter table portfolio.projects add constraint projects_role_kind_check
  check (role_kind is null or role_kind in ('solo','team'));

create table if not exists portfolio.media (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references portfolio.projects(id) on delete cascade,
  path        text not null,        -- object key in bucket 'portfolio' (the 1600px webp)
  caption     text,
  sort        int not null default 0,
  taken_at    timestamptz,
  width       int, height int,
  created_at  timestamptz not null default now()
);
alter table portfolio.media
  add column if not exists kind text,
  add column if not exists original_path text;
alter table portfolio.media drop constraint if exists media_kind_check;
alter table portfolio.media add constraint media_kind_check
  check (kind is null or kind in ('hero','process','cad','drawing','test','before','after','failure'));
create index if not exists media_project_sort_idx on portfolio.media (project_id, sort);

-- updated_at
create or replace function portfolio.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists projects_touch on portfolio.projects;
create trigger projects_touch before update on portfolio.projects
  for each row execute function portfolio.touch_updated_at();

-- Storage bucket (public read; writes only via service role / signed upload URLs)
insert into storage.buckets (id, name, public) values ('portfolio','portfolio', true)
  on conflict do nothing;

-- API access for the exposed schema
grant usage on schema portfolio to anon, authenticated, service_role;
grant select on all tables in schema portfolio to anon, authenticated;
grant all on all tables in schema portfolio to service_role;
alter default privileges in schema portfolio grant select on tables to anon, authenticated;
alter default privileges in schema portfolio grant all on tables to service_role;

-- RLS: public reads published; writes go through the service-role key on the server.
alter table portfolio.projects enable row level security;
alter table portfolio.media    enable row level security;
drop policy if exists "public reads published" on portfolio.projects;
create policy "public reads published" on portfolio.projects
  for select using (status = 'published');
drop policy if exists "public reads media of published" on portfolio.media;
create policy "public reads media of published" on portfolio.media
  for select using (exists (select 1 from portfolio.projects p
                            where p.id = project_id and p.status = 'published'));
