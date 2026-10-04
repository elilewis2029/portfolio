# Portfolio site — project context for Claude Code

Read `docs/PLAN.md` (the build plan, schema, prompts) and `docs/RESEARCH.md` (what recruiters want) before doing anything. This file lists what overrides the plan.

## Owner
Eli Lewis — engineering student, Northwestern '29; machinist at Ely Tool (custom tooling). Site: portfolio for engineering / product-design jobs and internships. Owner email for auth comes from env `OWNER_EMAIL`.

## Stack (do not change)
Next.js App Router + TypeScript + Tailwind, deployed on Vercel. Data in Supabase, schema `portfolio`, bucket `portfolio`. Anthropic API (claude-sonnet-4-6) for the `/add` intake. See PLAN.md "Stack decisions".

## Overrides to PLAN.md, from RESEARCH.md (apply these)
1. **Schema additions** on `portfolio.projects`: `role text`, `role_kind text check (role_kind in ('solo','team'))`, `goal_constraints text`, `result_metric text`, `lesson text`, `duration text`, `tools text[] default '{}'`, `skills text[] default '{}'`, `audience text[] default '{}'`, `links jsonb default '{}'`. Keep `tags` for compatibility but stop writing to it. On `portfolio.media` add `kind text check (kind in ('hero','process','cad','drawing','test','before','after','failure'))`.
2. **Categories**: `engineering`, `manufacturing-shop`, `electronics`, `design-craft`. Map old: shop-work→manufacturing-shop, making/craft→design-craft, makerspace→engineering with skill tag `leadership`.
3. **Project page layout** = the template in RESEARCH.md: impact title + tagline → hero → 2-sentence outcome → quick-facts strip (role, duration, tools, skills) → goal & constraints → process (photos of kind process/cad/drawing/test with captions) → result (result_metric highlighted) → "What I'd change" → links. Add a print stylesheet so each project page prints cleanly to one or two pages.
4. **Home page**: headline + one line, 3–5 featured cards (hero, title, 3 skill chips), résumé PDF + copyable email in the header, skill filter on /work, /archive link in the footer.
5. **Intake (`/add`)**: photos + one sentence, then three optional one-tap chips before Send: *Solo / Team* · *Number to brag about? (text)* · *What would you change? (text)*. Server passes these to the model. The intake prompt in `prompts/intake.md` supersedes the one in PLAN.md.
6. **Never invent facts.** result_metric, tolerances, dates, durations come only from the note or the taps; otherwise `[TODO]` in the text and null in the field. `/review` highlights every `[TODO]`.
7. **Feature-readiness flag**: a project with no media of kind process/cad/drawing shows a "needs a process photo" badge in `/review` and can't be set `featured`.

## Conventions
- Keep it simple: no CMS, no animations library, no client-side state libraries. Server components by default.
- Writes go through the service-role key on the server only. Public pages read with the anon key under RLS.
- Images: upload original to `inbox/{uuid}/`, store a 1600px webp alongside; serve via next/image + Supabase transforms.
- Commit after each working step with a one-line message. When done with a prompt, print the Vercel env vars needed and anything the owner must click in a dashboard.
