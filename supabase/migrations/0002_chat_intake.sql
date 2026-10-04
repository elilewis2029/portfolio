-- Lets /add save a batch for drafting later in a Claude Code chat instead of calling the API.
alter table portfolio.projects
  add column if not exists needs_drafting boolean not null default false,
  add column if not exists intake_note    text,
  add column if not exists intake_taps    jsonb;
