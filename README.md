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
| `/add` | Owner only. Photos + one sentence + optional Solo/Team, number, "what I'd change" → Claude draft |
| `/add` → *Save for chat* | Uploads photos + note without calling the API; draft it later in a Claude Code chat (uses your subscription, not API credit) |
| `/review` | Owner only. Drafts, TODO highlights, "needs a process photo" badge, publish / feature / delete, photo kinds, order, cover |

## Setup (one time)
1. **Supabase → SQL editor:** run `supabase/migrations/0001_portfolio.sql` (safe on an empty project or on top of the PLAN.md SQL), then `0002_chat_intake.sql`.
2. **Supabase → Settings → API → Exposed schemas:** add `portfolio`.
3. **Supabase → Authentication → URL Configuration:** Site URL = `https://elilewisportfolio.info`; add Redirect URLs `https://elilewisportfolio.info/auth/callback`, `https://*.vercel.app/auth/callback`, `http://localhost:3000/auth/callback`.
4. **Supabase → Authentication → Email Templates → Magic Link:** add `Your code: {{ .Token }}` to the body, so you can sign in inside the home-screen app by typing the code.
5. **Supabase → Storage → portfolio:** upload your résumé as `resume.pdf`.
6. **Vercel:** import the repo, set the env vars below, deploy. Then add the domain (Settings → Domains) and set the two DNS records it shows.
7. **iPhone:** open `/add`, sign in, Share → Add to Home Screen.

## Env vars (Vercel → Settings → Environment Variables, and `.env.local` for dev)
```
NEXT_PUBLIC_SUPABASE_URL      Supabase → Settings → API → Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY Supabase → Settings → API → anon public key
SUPABASE_SERVICE_ROLE_KEY     Supabase → Settings → API → service_role key (server only)
ANTHROPIC_API_KEY             console.anthropic.com
OWNER_EMAIL                   the one email allowed into /add and /review
CONTACT_EMAIL                 optional; public email in the header (defaults to OWNER_EMAIL)
```

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
- Photos upload straight from the phone to the bucket (signed URLs), then the server makes a 1600px webp and a 1024px copy for Claude. iOS converts HEIC to JPEG when picking photos; HEIC files from other sources may fail to process.
- The intake prompt is `prompts/intake.md`. The server also enforces "never invent facts": a result, duration or year the model returns is dropped unless its numbers appear in your note or answers, and invented measurements in titles and text become `[TODO]`.
