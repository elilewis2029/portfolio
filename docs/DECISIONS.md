# Decisions log

Decisions made while building, where CLAUDE.md / PLAN.md / RESEARCH.md left room. Newest at the bottom.

## 2026-10-04 — owner mode

1. **Owner mode is server-rendered, not client-detected.** Every page reads the Supabase auth cookie on the server (`lib/supabase.ts → ownerEmail()`, cached per request) and renders owner controls inline. This makes all pages dynamic. Home, Work and Archive were already dynamic (they read `searchParams`); the project page loses its 60 s ISR cache. Cost: one Supabase query per request, which is nothing at portfolio traffic. Benefit: no flash of owner UI, no client-side auth code, drafts in grids come from the same query. Visitors with no `sb-*-auth-token` cookie skip the auth round-trip entirely (middleware and `ownerEmail()` both short-circuit).
2. **One editor, on the project page.** `/work/[slug]?edit=1` renders `components/owner/ProjectEditor` in place of the article. `/review/[id]` now redirects there, so there is exactly one edit form. `/review` stays as the list (drafts, TODO counts, "needs a process photo", Publish / Feature) and `/add` stays as a full page (same `AddForm` as the "+" sheet) so it can be pinned to the phone home screen. Draft projects are reachable by the owner at their final `/work/<slug>` URL, with `robots: noindex`.
3. **"+" sheet is a native `<dialog>`**, no library (CLAUDE.md: no animation or state libraries). Bottom sheet on phones, centred card on desktop. After a successful add it calls `router.refresh()` so the grid behind it shows the new Draft card.
4. **Delete asks for confirmation** via a tiny client `ConfirmSubmit` button around the existing server action, instead of a two-step page.
5. **Middleware now runs on every page** (except static assets and `/api`) so the session cookie is refreshed wherever the owner is; it returns immediately when there is no auth cookie.
6. **After sign-in the owner lands where they started** (`next` defaults to `/`, not `/review`), since there is no separate admin area any more. Footer shows a small "Sign in" to visitors and "Review · Sign out" to the owner; the header shows an "Owner" chip.
7. **Supabase project is on the free plan** (the Management API refuses email-template edits with "not available for free tier"), which changes three things PLAN.md assumed:
   - **Image transforms are off** (`/storage/v1/render/image` returns `FeatureNotEnabled`), so the loader serves the stored 1600 px webp directly. The old loader produced broken images on the live site. `NEXT_PUBLIC_SUPABASE_IMAGE_TRANSFORMS=1` switches resizing back on after an upgrade.
   - **Free projects pause after a week without API traffic.** Added `/api/keepalive` and a daily Vercel cron (`vercel.json`, 09:00 UTC) that runs one cheap query.
   - **The magic-link email cannot include the 6-digit code** on the default mailer, so sign-in is link-first; the code field stays on the page for when custom SMTP is configured later. The home-screen "Add project" app therefore opens in Safari's session: sign in once in Safari, and the installed app shares nothing with it on iOS, so the practical path is to use the site in Safari (owner mode works on every page) or install the home-screen app *after* signing in from the same Safari session is not reliable — keep Safari.
   - Supabase Auth `site_url` was `http://localhost:3000`; set to `https://elilewisportfolio.info` via the Management API. Redirect allow-list already covered the domain, `*.vercel.app` and localhost.
8. **Wix import skipped.** `export/content.json` is not in the repo (the zip exceeded GitHub's upload limit), per CLAUDE.md 5b. `scripts/import-wix.ts` stays for when the export is dropped in locally.
9. **Deploys.** Vercel project `portfolio` is git-linked to `elilewis2029/portfolio`, production branch `main`. The feature branch gets an automatic preview deployment on push; production was deployed from the CLI (`vercel --prod`) so the live site carries this work before the PR merges. Merging the PR to `main` redeploys the same code.
10. **Home page copy.** Added one explanatory sentence under the headline and a "Featured work" label; no new sections. Header shows the copyable email on desktop only (space on phones), the footer carries it everywhere.
11. **Favicon**: `app/icon.png` is the same 192 px icon as the PWA icon, to stop the 404 on `/favicon.ico`.
12. **Function timeout lives in the root layout** (`maxDuration = 60`). The intake action runs under whichever page the "+" sheet was opened on, so a per-page setting on `/add` alone would not cover it.

## 2026-10-05 — reviewer pass, profile content, placeholders

13. **Independent review first.** A separate reviewer agent compared the site with 12 real engineering-student portfolio sites and three career-centre guides (MIT CommLab, USU, Duke). Its checklist drove this round: About, experience with dates, education with coursework, grouped skills, social links, 3+ projects, share images, 404, sitemap/robots, a public manifest that was named "Add project".
14. **Profile content lives in `content/profile.ts`**, a typed object in the repo, not in Supabase. It changes a few times a year, is edited in chat or a text editor, and is reviewed in git. Projects stay in Supabase because they are added from a phone.
15. **Placeholders are `[TODO: …]` strings** in that file. `components/Todo.tsx → Field` renders them highlighted for the signed-in owner and hides them from visitors, so the live site is never embarrassing while it is incomplete; a section whose every value is a TODO disappears for visitors. `docs/INPUTS.md` lists every open TODO with the question to answer.
16. **Placeholder projects are real draft rows** (`todo-*` slugs, `needs_drafting = true`) so they show as Draft cards with "No photo yet" in owner mode; adding photos through "+" with the project named in the note appends to them. Delete any you don't want.
17. **Framing.** Ely Tool was a summer job: it lives in Experience with dates, the headline says "Mechanical engineering student, Northwestern ’29", and the hero carries the ask ("seeking …") because reviewed sites put it first. `docs/RESEARCH.md` was corrected so the old headline cannot be copied back.
18. **Share images are generated** (`app/opengraph-image.tsx`, `app/work/[slug]/opengraph-image.tsx` from the hero photo) rather than uploaded, so they never go stale.

## 2026-10-05 — facts, photo-first pass

19. **Only Eli is a source of truth about Eli.** `docs/PLAN.md` and `docs/RESEARCH.md` called him a mechanical engineering student and a machinist; both were wrong. He is in Northwestern's Manufacturing & Design Engineering (MaDE) program. Anything about him now lives in `content/profile.ts`, written or confirmed by him; the hero pitch line became a TODO rather than my wording.
20. **Photo-first layout.** Wider page (max-w-6xl), the first featured project as a 21:9 banner card, project hero at full column width with caption, odd process photo sets lead with one full-width photo, and a native `<dialog>` lightbox (`components/Lightbox.tsx`) so a build photo opens full-size without leaving the page.
21. **Motion is CSS-only and small**: a 0.6 s fade-and-rise on page load for the hero, title and summary; a slow zoom on image hover; a short fade for the lightbox. All of it is disabled under `prefers-reduced-motion`. A scroll-triggered reveal was built and removed: in full-page captures it left photos invisible, and every guide lists "projects buried behind animation" as a mistake. No page transitions, parallax or loaders.
22. **Structure stays conventional on purpose.** The site reads like a detailed résumé with photos because reviewers spend 30–60 s and want contact, role, process, result in a known place. Personality comes from the photos, the captions and the bio in his own voice, not from layout novelty.

## 2026-10-06 — photos from the project page

23. **"Add photos" on every project page** (owner toolbar, draft or published, viewing or editing). It uploads straight to that project through the same signed-URL path as the "+" intake, skips the AI, and appends the photos as `process` at the end; a project with no photos gets its first upload as the cover. The "+" sheet still decides new vs. append from the note.

## 2026-10-07 — Ely Tool corrected

24. **Ely Tool is a continuous improvement internship, not machining.** Eli had no official title and accepted "Continuous Improvement Intern"; every "machinist" mention (profile, intake prompt, CLAUDE.md, interview prompt) is corrected. The Experience entry carries the job: 5S coordination, the adopted SketchUp layout, phased moves (an *estimated* $5,000 shutdown avoided), and the barcode mockup as a prototype with buy-in, not a deployed system. Experience entries are text-only, so photos of the layout and the back room can only appear on a project page; whether to make one is Eli's call. The `todo-ely-tool-fixture` placeholder came from the wrong framing and should be repurposed or deleted.
