# Portfolio Rebuild Plan

Oct 3, 2026 · @Eli

## The short version

Build a Next.js site on Vercel that reads projects from a `portfolio` schema in the Supabase project you already pay for, with one phone-friendly `/add` page where you drop photos and type a sentence; Claude turns that into a draft project you approve with one tap. The old Wix site is already exported (19 pages, 76 full-res photos, zipped in this chat), so migration is a paste, not a chore.

The reason Wix failed you was fields, not effort. The new site has one content type with six fields, and the AI fills five of them. Everything lives in plain Postgres tables and a plain storage bucket, so nothing here is hard to leave later.

Target: a live site with 4–5 featured projects by Sunday night, and the “add from phone” flow working by Monday.

## Stack decisions

Your friend's stack is right, with two edits: skip Cloudflare for now (Vercel already does CDN and HTTPS) and skip Namecheap unless you want a new domain. Each row says what the choice does and what it does *not* lock you into.

| Layer | Choice | Why | Exit cost later |
| --- | --- | --- | --- |
| Site framework | Next.js (App Router, TypeScript, Tailwind) | Best-supported on Vercel; Claude Code is very fluent in it; server routes can call Claude for intake | Pages are plain React; content is in Postgres, not in the code |
| Hosting | Vercel Hobby (free) | Git push = deploy; free tier is plenty for a portfolio | Any host runs Next.js; swap in an afternoon |
| Database + photos | Supabase, your **existing** project, new `portfolio` schema + `portfolio` storage bucket | You already pay for it; a second Pro project would add compute cost; Pro includes 100 GB file storage ([pricing](https://supabase.com/pricing)) | `pg_dump` the schema, download the bucket; both are open formats |
| Auth for `/add` | Supabase Auth, magic link, one allowed email | No passwords to manage; already in the project | None, it only guards one page |
| AI intake | Anthropic API (Claude Sonnet), called from a Next.js server route | Reads photos + your sentence, returns JSON for the project fields | Prompt is one file; swap model or vendor by editing it |
| Domain | Keep elilewisportfolio.info, point its DNS at Vercel | Already yours; zero cost; links on résumés stay valid | Buy a shorter domain later and redirect |
| Repo | GitHub, one repo, `main` deploys | Vercel watches it | Standard |

**Open question:** where is elilewisportfolio.info registered — Wix, or elsewhere? If Wix, you can still change its DNS records from the Wix dashboard; if that turns out painful, buy `elilewis.dev` or similar on Cloudflare Registrar (sold at cost) and redirect the old one.

One trade-off to know: the site reads from the database at request time (not a static build), so the Supabase project must stay awake. Yours will, because it's on Pro for your app. If you ever move the portfolio to a free Supabase project, switch to a static build so a paused database can't take the site down.

## Content model: one type, six fields

Everything on the site is a **project**. A blog post, a makerspace event, a shop reorganization and a carbon-fiber journal are all the same shape: a title, a few sentences, some photos, a category. Wix made you fill a different template for each; here the *category* and *era* fields do that job.

| Field | Who fills it | Notes |
| --- | --- | --- |
| Title | AI drafts, you confirm | “Carbon Fiber Journal” |
| Tagline (1 line) | AI drafts | The card text on the grid |
| Body (markdown) | AI drafts from your sentence + photos | Problem → what you did → result; a few paragraphs max |
| Category | AI picks, you confirm | `engineering` · `shop-work` · `electronics` · `making` (wood/leather/resin/3D print) · `craft` (ceramics, carving) · `makerspace` |
| Tags | AI picks | Free-form skills/tools: `cnc`, `arduino`, `fusion-360`, `tig-welding`… what recruiters search for |
| Year | AI from photo EXIF, you confirm | One number, no exact dates required |

Plus three switches you flip, never type: **status** (draft / published), **featured** (shows on the home page, cap at 5), and **era** (`current` or `archive`; archive = the high-school section, still viewable at `/archive`).

Photos are their own table (`media`): one row per image with a storage path, optional caption, sort order and the date the photo was taken. The cover image is just the media row you mark as cover. This is what makes “add three more photos to the drill press project” a single action later.

What's deliberately **not** here: separate blog/post types, rich-text fields, galleries vs. sliders, SEO fields, categories with sub-categories. If you want any of them in a year, it's one column added, and nothing already entered has to change.

## Phone intake flow

&#91;embedded content: phone intake flow - 6 steps, 1 decision\]

You never fill a form. The `/add` page (saved to your home screen like an app) has a photo picker, one text box and a Send button. If your line names a project that already exists ("more drill press pics"), the photos attach to it; otherwise Claude drafts a new project from the photos and your sentence, sets it to draft, and you publish from the review list whenever you have thirty seconds.

What makes this fast in practice:

- **Photos go in the bucket as-is.** Compression and thumbnails happen on the server, so uploading from a camera roll takes seconds.
- **EXIF does the dating.** Year and photo order come from the files. You never type a date.
- **Claude sees the photos, not just your words.** "Finished the fixture" plus six photos of a milled aluminum part is enough for a credible three-paragraph entry with the right tags. You edit, you don't author.
- **Drafts are free.** Dump ten batches on a Sunday, publish three. Nothing is public until you flip it.
- **The Wix import uses the same door.** A script pushes the export folders through the identical route, so migration isn't a separate system.

Cost: roughly a cent or two per batch of photos at Claude Sonnet prices; a year of heavy use is a few dollars.

## What to feature, what to archive

For engineering/shop job applications, the home page should show 4–5 projects that prove you can scope, build and finish real things, with process photos, not just results. Two of the strongest candidates aren't on the old site at all: your current work at Ely Tool and anything from Northwestern coursework. Those should be the first two things you add through `/add`.

Everything below is already exported, so “migrate” means “flip a switch and maybe rewrite two sentences.” My suggested sort; change anything.

| Old item | Suggest | Why |
| --- | --- | --- |
| Carbon Fiber Journal | **Feature** | Precision + planning + presentation, your own words say so |
| Ashida Portable Wii | **Feature** | Electronics + enclosure design; longest write-up on the old site (25 paragraphs) |
| 1970s Drill Press Restoration | **Feature** | Mechanical restoration, directly relevant to shop work |
| Customizable Car Kit | Publish | Design-for-assembly thinking; good second-tier |
| Metal Notebook V2 | Publish | Sheet-metal fabrication |
| Portable Monitor / Scrap Side Monitor | Publish | Shows resourcefulness; could merge into one “scrap builds” entry |
| Resin Pour Wood Table | Publish | Finishing and material work |
| Wooden planer, Speaker Stands, The Knobber | Archive | Fine, but they dilute the grid |
| Antique pen restoration, pen holder, mini sketchbook | Archive | Crafts; keep visible under `/archive` |
| Sculpture & Crafts gallery (12 photos) | Archive, one entry | One “Ceramics, carving and crafts” project with the gallery |
| Makerspace section + 5 blog posts (2023) | Publish, one entry | Fold into a single “Community makerspace” project: leadership + teaching, which employers like. The five posts become dated paragraphs in its body |

That leaves a home page of roughly: Ely Tool work, a Northwestern project, Carbon Fiber Journal, Portable Wii, Drill Press. Everything else sits one click away under Work, and the high-school era under Archive with a one-line note that it's there for history.

Two things to rewrite rather than paste: the home intro (the “for lack of a better word, I like to make stuff” voice is good, but lead with what you do now: engineering student, working machinist, builder) and the taglines on the three featured projects, which should name a skill (“CNC-milled aluminum enclosure, custom PCB” beats “a DIY Switch… but worse”, though keep the humor in the body).

## Weekend build order

Claude Code does the typing; you do accounts, keys and taste. Budget about 5 hours of your attention spread over two days, most of it waiting or reviewing. Do the steps in order; each one leaves something working.

**Step 1 — Accounts (20 min, you).** GitHub repo `portfolio`; Vercel account linked to GitHub; Anthropic API key from console.anthropic.com; in your existing Supabase project, run the SQL in the last section (creates the `portfolio` schema, tables and bucket). Copy the Supabase URL, anon key and service-role key.

**Step 2 — Scaffold the site (45 min, Claude Code).** Paste this into Claude Code in an empty folder:

```markdown
Build a Next.js 15 App Router + TypeScript + Tailwind portfolio site for Eli Lewis, an engineering student and machinist.
Data lives in Supabase, schema `portfolio` (tables `projects`, `media`; bucket `portfolio`). Use @supabase/ssr. Env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, OWNER_EMAIL.
Pages: `/` (intro + up to 5 featured published projects), `/work` (grid of published, era=current, filter chips by category), `/work/[slug]` (cover, body as markdown, photo grid with lightbox, tags), `/archive` (era=archive, same grid, one-line note at top), `/resume` (links to a PDF in the bucket).
Design: clean, lots of whitespace, big photos, one accent color, system font stack, dark mode via prefers-color-scheme. Mobile first. Use next/image with Supabase image transforms for thumbnails.
No CMS, no auth on public pages. Add a `scripts/import-wix.ts` that reads `export/content.json` (fields: kind, slug, title, date, text[], local_images[]) and inserts projects + uploads images to the bucket, era=archive, status=draft.
Commit, and tell me the Vercel env vars to set.
```

Then: push, import the repo in Vercel, paste the env vars, deploy. You should have a live (empty) site at a `.vercel.app` URL.

**Step 3 — Import the old site (15 min).** Unzip the export from this chat into `export/` in the repo and run the import script. Open the Supabase table editor, flip `status` to published on the rows from the table above, and set `featured` on three.

**Step 4 — The `/add` page (1 hour, Claude Code).** Second prompt:

```markdown
Add an owner-only intake flow. `/add` requires a Supabase Auth magic-link login and only allows OWNER_EMAIL. The page: multi-file photo picker (accept images, capture from camera allowed), one textarea, Send. It should work installed as a PWA on iPhone (manifest + icons).
On submit, a server action: (1) uploads originals to bucket path `inbox/{uuid}/`, reads EXIF date, generates a 1600px webp; (2) loads the list of existing project titles/slugs; (3) calls Anthropic Messages API, model claude-sonnet-4-6, with the photos (resized to 1024px for the call) plus the note plus the project list, using the system prompt in `prompts/intake.md`, and expects JSON: {action:'new'|'append', slug, title, tagline, body_md, category, tags[], year, captions[]}; (4) if append, add media rows to that project; if new, insert a draft project + media, first photo as cover. Show the result and a link to `/review`.
`/review`: list drafts, inline-edit title/tagline/category/year/body, reorder photos, pick cover, Publish and Delete buttons. Owner-only.
Use RLS: public can select published rows; only the owner can write. Write the migration.
```

**Step 5 — First real content (1 hour, you, on your phone).** Add Ely Tool work and a Northwestern project through `/add`. Rewrite the home intro and the three featured taglines in `/review`. Upload your current résumé PDF to the bucket.

**Step 6 — Domain (15 min).** In Vercel, add `elilewisportfolio.info`; it shows you two DNS records; set them wherever the domain's DNS lives (likely the Wix dashboard). Propagation takes minutes to a few hours. Leave Wix up until the new site resolves, then cancel Wix.

**If time runs short:** steps 1–3 plus the domain give you a job-ready site by Sunday. Step 4 can happen Monday evening without blocking applications.

## Paste-ready: schema and intake prompt

Run this in the Supabase SQL editor of your existing project. It touches nothing outside the `portfolio` schema.

```sql
create schema if not exists portfolio;

create type portfolio.category as enum
  ('engineering','shop-work','electronics','making','craft','makerspace');
create type portfolio.status as enum ('draft','published');
create type portfolio.era as enum ('current','archive');

create table portfolio.projects (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  tagline     text,
  body_md     text,
  category    portfolio.category not null default 'making',
  tags        text[] not null default '{}',
  year        int,
  status      portfolio.status not null default 'draft',
  era         portfolio.era not null default 'current',
  featured    boolean not null default false,
  cover_media uuid,
  source_url  text,            -- old Wix URL, for the import
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table portfolio.media (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references portfolio.projects(id) on delete cascade,
  path        text not null,   -- object key in bucket 'portfolio'
  caption     text,
  sort        int not null default 0,
  taken_at    timestamptz,
  width       int, height int,
  created_at  timestamptz not null default now()
);
create index on portfolio.media (project_id, sort);

insert into storage.buckets (id, name, public) values ('portfolio','portfolio', true)
  on conflict do nothing;

alter table portfolio.projects enable row level security;
alter table portfolio.media    enable row level security;
create policy "public reads published" on portfolio.projects
  for select using (status = 'published');
create policy "public reads media of published" on portfolio.media
  for select using (exists (select 1 from portfolio.projects p
                            where p.id = project_id and p.status = 'published'));
-- Writes go through the service-role key on the server, so no insert/update policies are needed.
```

Expose the schema: Supabase dashboard → Settings → API → “Exposed schemas” → add `portfolio`.

Save this as `prompts/intake.md`; Claude Code wires it in during step 4.

```markdown
You turn a maker's quick note and photos into a portfolio entry. The author is Eli Lewis, an engineering student at Northwestern who works at Ely Tool, a custom-tooling machine shop. Audience: engineering recruiters and shop managers.

You receive: the note, the photos (in order), and a list of existing projects as {slug, title}.

Decide: if the note clearly refers to one existing project (by name or obvious description), action is "append". Otherwise "new".

For "new", write:
- title: 2–6 words, concrete (what it is), no puns.
- tagline: one line naming the skill or process shown (tools, materials, method).
- body_md: 2–4 short paragraphs, first person, plain. Order: what the problem or goal was; what was done and how (name tools, materials, tolerances if visible); what resulted or what was learned. Do not invent measurements, dates or outcomes that are not in the note or visible in the photos. If something is unclear, write a short [confirm: ...] marker instead of guessing.
- category: one of engineering, shop-work, electronics, making, craft, makerspace.
- tags: 3–8 lowercase hyphenated skill/tool/material tags recruiters would search (e.g. cnc-milling, fusion-360, tig-welding, arduino, 3d-printing, leatherwork).
- year: from the note if stated, else null (the server fills it from photo metadata).
- captions: one short caption per photo, in order; empty string if nothing useful to say.

For "append", return slug and captions only.

Respond with JSON only, no prose, no code fences:
{"action":"new"|"append","slug":"","title":"","tagline":"","body_md":"","category":"","tags":[],"year":null,"captions":[]}
```

**Sources:** old site read from [elilewisportfolio.info](https://www.elilewisportfolio.info); Supabase plan limits from [supabase.com/pricing](https://supabase.com/pricing) as of today.
