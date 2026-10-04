# elilewisportfolio.info

Next.js (App Router, TypeScript, Tailwind) on Vercel; data in Supabase schema `portfolio`, photos in bucket `portfolio`; Claude drafts entries from `/add`. Build plan and content rules: `docs/PLAN.md`, `docs/RESEARCH.md`, `CLAUDE.md`.

## Pages
| Route | What |
| --- | --- |
| `/` | Headline + up to 5 featured projects. `/?for=pd` · `mech` · `mfg` puts that audience's projects first (for tailored application links). |
| `/work` | Published current projects, filter by category and skill |
| `/work/[slug]` | Project page in the RESEARCH.md template order; prints to a 1–2 page PDF |
| `/archive` | High-school / craft / scrap builds |
| `/resume` | Redirects to `resume.pdf` in the bucket |
| **Owner mode** | Sign in (footer link, magic link to `OWNER_EMAIL`). Then every page shows a floating **+** (photos + one sentence + Solo/Team · number · what you'd change → Claude draft, or *Save for chat*), draft cards with a **Draft** badge, and on each project page an owner bar: **Edit** (inline: all fields, photo kinds, captions, order, cover), Publish/Unpublish, Feature, Delete. |
| `/add` | Alias of the + sheet as a full page (pin it to the phone home screen) |
| `/review` | Alias list: drafts with TODO counts and "needs a process photo" badges, published, featured count |
| `/review/[id]` | Redirects to `/work/[slug]?edit=1` |
| `/api/keepalive` | Daily cron (`vercel.json`) so a free-tier Supabase project is never paused |

## Setup (done once; here for a rebuild)
1. **Supabase → SQL editor:** run `supabase/migrations/0001_portfolio.sql` (safe on an empty project or on top of the PLAN.md SQL), then `0002_chat_intake.sql`. Or `supabase db push` with the CLI.
2. **Supabase → Settings → API → Exposed schemas:** add `portfolio` (done; also settable with the Management API `PATCH /v1/projects/{ref}/postgrest`).
3. **Supabase → Authentication → URL Configuration:** Site URL = `https://elilewisportfolio.info`; Redirect URLs `https://elilewisportfolio.info/**`, `https://*.vercel.app/**`, `http://localhost:3000/**` (done).
4. **Optional, needs custom SMTP (free plan can't edit templates):** Magic Link template with `Your code: {{ .Token }}` so you can sign in by typing a code.
5. **Supabase → Storage → portfolio:** upload your résumé as `resume.pdf` (done; replace when it changes).
6. **Vercel:** repo is linked; env vars below are set; domain `elilewisportfolio.info` is added (DNS at the registrar must point at Vercel).
7. **iPhone:** open the site in Safari, Sign in (footer), tap **+**. Optional: `/add` → Share → Add to Home Screen.

## Env vars (Vercel → Settings → Environment Variables, and `.env.local` for dev)
```
NEXT_PUBLIC_SUPABASE_URL      Supabase → Settings → API → Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY Supabase → Settings → API → anon public key
SUPABASE_SERVICE_ROLE_KEY     Supabase → Settings → API → service_role key (server only)
ANTHROPIC_API_KEY             console.anthropic.com
OWNER_EMAIL                   the one email allowed into /add and /review
CONTACT_EMAIL                 optional; public email in the header (defaults to OWNER_EMAIL)
NEXT_PUBLIC_SUPABASE_IMAGE_TRANSFORMS  optional; set to 1 after upgrading Supabase to use on-the-fly image resizing
```
Decisions and their reasons are in `docs/DECISIONS.md`.

## Import the old Wix site
Unzip the export into `export/` (so `export/content.json` exists), then:
```
npm install
npm run import-wix -- --dry   # print the plan
npm run import-wix
```
Everything arrives as a draft. PLAN.md's Feature/Publish items go to Work, the rest to Archive; the makerspace section and its posts become one "Community makerspace" project. In `/review`, tag photo kinds, fill the structured fields, publish, and feature 3–5.

## Drafting in chat (Claude Code)
For projects worth a conversation, or when you'd rather not spend API credit: on `/add` tap **Save for chat**, then in a Claude Code session on this repo say *"draft my pending portfolio entries"*. The `portfolio-entry` skill (`.claude/skills/portfolio-entry/SKILL.md`) looks at the photos, asks what it can't see, and writes the entry with `scripts/portfolio.ts`. You can also attach photos straight into the chat and say *"add this as a project"*.
The session's environment needs `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as environment variables, and `<ref>.supabase.co` in Allowed domains. If an API draft fails (no key, no credit), `/add` falls back to Save for chat automatically, so photos are never lost.

## Notes
- Photos upload straight from the phone to the bucket (signed URLs), then the server makes a 1600px webp (served as-is; Supabase image transforms are a paid feature) and a 1024px copy for Claude. iOS converts HEIC to JPEG when picking photos; HEIC files from other sources may fail to process.
- The intake prompt is `prompts/intake.md`. The server also enforces "never invent facts": a result, duration or year the model returns is dropped unless its numbers appear in your note or answers, and invented measurements in titles and text become `[TODO]`.
