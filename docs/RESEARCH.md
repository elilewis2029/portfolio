# What gets engineering & product-design portfolios interviews (research briefing, Oct 2026)

Sources: MIT MechE and AeroAstro Communication Labs, BYU Design Review (Mattson), NYU Tandon, BU ENG career office, Matt Trossen (Trossen Robotics hiring manager), Core77 boards, Michael DiTullo, Formlabs / Dyson / Tesla job postings.

## Key findings
1. Hiring managers open the portfolio first and decide in 30-60 seconds per page. No portfolio = deleted at Trossen; Formlabs ME/MfgE/EE internships require one.
2. Two audiences: recruiters skim for "what you did and the impact"; engineers look for thought process and craftsmanship. Each page needs a summary line up top and details below.
3. Process beats polish. Visuals should be ~70% of the page; include more than the hero shot: CAD, drawings, build-in-progress, test/inspection, failures.
4. Role clarity is non-negotiable: "I was responsible for..." down to which CAD model or test setup was yours.
5. Curate hard: 3-5 featured projects. A weak project sets the perceived "average operating level."
6. Make skills findable: a skills/tools list per project; filter by skill.
7. Provide a printable PDF per project ("so we can staple it to the resume").

## Per-project template (section order)
1. Impact title + one-line tagline naming the skill/process (e.g. "Restoring a 1970s drill press to 0.002 in runout").
2. Hero image (clean, landscape).
3. Outcome summary, 2 sentences: what it is, how it performed, your contribution.
4. Quick-facts strip: Role (solo / team of N + "I was responsible for...") - Duration - Tools/software - Processes/materials.
5. Goal & constraints: 2-3 bullets (requirements, budget, timeline, tolerances).
6. Process: 3-5 bullets + 2-4 annotated visuals (CAD/drawing, build, test, iteration).
7. Result: one number with units if real (tolerance held, cycle time, cost, weight, hours saved) + final photo.
8. What I'd change: 1-2 lines.
9. Links: video, CAD, GitHub (optional).
Target 150-300 words, 2-6 visuals total.

## Content-model changes (prioritized)
- ADD `role` (enum solo/team + text "I was responsible for...").
- ADD `goal_constraints` text (1-3 bullets).
- ADD `result_metric` text, nullable. Never AI-invented.
- ADD `lesson` text (one line).
- ADD `media.kind` enum: hero / process / cad / drawing / test / before / after / failure. AI classifies.
- SPLIT `tags` into `tools` text[] (fusion-360, cnc-mill, tig) and `skills` text[] (dfm, fixture-design, gdt, 5s).
- ADD `audience` text[] (pd / mech / mfg) so featured order can be tuned per application.
- ADD `links` jsonb and `duration` text.
- Collapse categories to: engineering / manufacturing-shop / electronics / design-craft. Makerspace = tag or separate section.
- Render body from structured fields in the template order above; keep `body_md` as optional free text.
- SKIP: budget (unless a real constraint), long narratives, brand lists, every intermediate photo.

## Intake-flow changes
Photos + one sentence, then three one-tap prompts: Solo or team? - Any number to brag about? - What went wrong / what would you change?
AI rules: outcome-first; bullets + strong verbs; 150-300 words; missing facts -> `[TODO]` not guesses; propose impact-style title; tag each photo by kind and pick the hero; flag entries with no process photo or no drawing/CAD as "not feature-ready".

## Shop / fixture work
Present fixtures as design projects: the part held and problem solved; drawing or CAD with datum scheme; tolerance held and how verified (calipers, CMM); setup time or scrap before vs after. For 5S: before/after photos + one number (minutes saved, floor area recovered); call it lean/5S explicitly. Clear proprietary customer parts with the shop owner.

Audience split: product design (IDEO, Dyson) -> lead with sketches, form exploration, user problem. Mech/manufacturing -> drawings, DFM, tolerances, test data.

## Home page
- Headline: name + one line ("Mechanical engineering student, Northwestern '29 - Machinist at Ely Tool building custom tooling").
- 3-5 featured cards: hero image, impact title, 3 skill tags.
- Resume PDF + copyable email in header; contact on every page.
- Skill filter; "Archive" link for high-school, craft, scrap builds.
- Printable one-page-per-project PDF export (print stylesheet is enough).

## Mistakes to avoid
Broken/permissioned links; text that can't be copied; projects buried behind animation; hero-only pages with no role; too many or 101-level projects; walls of text; uncompressed images; broken mobile; AI-sounding fluff (edit every draft in your own voice).
