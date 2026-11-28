-- Optional second photo per project that fades in over the cover on hover (e.g. a render on the card, the real
-- build on hover). Plain uuid, no foreign key: a second projects→media link makes PostgREST's `media(*)` embed
-- ambiguous. deleteMedia clears it instead.
-- Run in the Supabase SQL editor or via the Management API. Touches nothing outside schema `portfolio`.
alter table portfolio.projects add column if not exists hover_media uuid;
notify pgrst, 'reload schema';
