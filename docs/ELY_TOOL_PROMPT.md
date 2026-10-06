# Prompt: turn the Ely Tool material into site entries (for ChatGPT)

Paste everything below the line into the ChatGPT project that holds the Ely Tool notes and photos. It refines the content there, the same way entries get refined in the portfolio session. When it prints the final blocks, copy them into the portfolio session (Claude) and they go straight onto the site.

---

You're helping Eli Lewis turn his Ely Tool material (the notes, photos and conversations already in this project) into entries for his engineering portfolio site, elilewisportfolio.info. Eli is a Manufacturing & Design Engineering (MaDE) student at Northwestern, class of 2029. Ely Tool is a custom-tooling machine shop where he worked one summer as a machinist. The job is **not** his identity: it goes in the Experience section of his About page, and the specific things he made there become project pages.

You are doing the full job a portfolio editor would do: inventory, questions, drafting, and a refinement loop, ending in paste-ready blocks. Work in this order and don't skip steps.

## 1. Inventory what's here

Go through everything in this project. List every distinct thing Eli made, fixed, set up or improved at Ely Tool: parts, fixtures, soft jaws, setups, process changes, tooling, measurements. For each, note which photos exist and what they show. Then sort them:

- **Project page**: a specific thing he made or built, with at least one photo that shows the process (setup, in-progress machining, CAD, a drawing, a test, a before/after, a failure). Each gets its own page.
- **Experience bullet only**: shop-wide duties, general skills, things without photos. These become bullets under Ely Tool on his About page.
- **Fold together**: several small parts of one job or one setup can be one project page.

Show Eli the sorted list and ask him to confirm it before drafting. Also ask once: is any part, customer or drawing confidential? If so, describe it generically ("a stainless fixture plate for a customer's inspection setup") and never name the customer.

## 2. Ask what the material can't answer, once per project

One short message per project, all the questions at once, short answers expected. Skip anything the notes already say. The questions that matter:

- Solo or part of a team, and what exactly was his part of it.
- The one number to brag about: tolerance held, parts made, setup time cut, scrap reduced, cycle time, cost. Only a number he actually knows.
- Machines, materials and tooling used (manual or CNC mill, lathe, model if he knows it, the material, the cutters, the inspection tools).
- Timeline: roughly how long, and when (month and year).
- What he would change if he did it again.
- The hardest part or the thing that went wrong.

For the Experience entry, also get: the months he worked, the city, and the three things he'd want a recruiter to know about the job.

Eli's answers always win over anything you inferred from the material.

## 3. Draft each project in the site's exact schema

Each project is one JSON object with these fields, nothing else:

```
{
  "title": "",            // 2–7 words, impact-style: what it is and ideally the key result. "Soft jaws that held ±0.001 in on a 40-part run"
  "slug": "",             // lowercase-hyphenated from the title
  "tagline": "",          // one line naming the skill or process shown: tools, materials, method
  "summary": "",          // exactly 2 sentences: what it is and how it performed; what Eli's contribution was
  "role_kind": "solo" | "team",
  "role": "",             // one line starting "I was responsible for…"
  "goal_constraints": "", // 1–3 markdown bullets ("- ") of requirement, tolerance, budget, timeline, only if known
  "process_md": "",       // 3–5 markdown bullets of what was done and how; name tools, materials, processes; reference photos by number "(photo 3)"
  "result_metric": null,  // one number with units as a string, or null
  "lesson": null,         // one line, "What I'd change", or null
  "category": "manufacturing-shop", // or engineering | electronics | design-craft if it fits better
  "tools": [],            // 2–6 lowercase-hyphenated tags: haas-vf2, bridgeport, manual-lathe, fusion-360, cmm, surface-grinder
  "skills": [],           // 2–6 lowercase-hyphenated tags recruiters search: fixture-design, gdt, dfm, workholding, inspection, setup-reduction, 5s-lean
  "audience": [],         // subset of ["pd","mech","mfg"]
  "year": null,           // number, only if known
  "duration": null,       // string like "3 days", only if known
  "media": [              // one per photo, in the order Eli should upload them
    { "file": "<photo name as it appears in this project>", "kind": "hero", "caption": "" }
  ]
}
```

Media kinds: `hero` (exactly one: the cleanest finished shot), `process`, `cad`, `drawing`, `test`, `before`, `after`, `failure`. A project needs at least one `process`, `cad` or `drawing` photo to be featured on the home page, so prefer those over more finished shots. Captions are short and say what the viewer is looking at and why it mattered.

Word budget: 150–300 words across all text fields per project. Voice: first person, plain, strong verbs (designed, machined, held, cut, measured, fixed). No "leveraged", "passionate", "spearheaded", "responsible for" except in the role line. Write outcome-first; a recruiter reads this page for 30 seconds.

**Never invent facts.** Measurements, tolerances, dates, durations, counts, costs and outcomes come only from Eli or from what a photo plainly shows. Where a fact is expected but missing, write `[TODO: what's missing]` in the text and `null` in the field. A `[TODO]` is better than a plausible number.

## 4. Draft the Experience entry

In this exact shape:

```ts
{
  org: "Ely Tool",
  title: "Machinist (summer job)",
  dates: "Jun–Aug 2025",            // real months from Eli
  location: "City, ST",              // from Eli
  bullets: [
    "What he actually ran and made: machines, materials, part types.",
    "One number: tolerance held, parts made, setup time cut, scrap reduced.",
    "Anything he designed or improved: fixtures, soft jaws, a process change.",
  ],
}
```

Three bullets, each under 25 words, each naming something concrete. The bullets summarize the job; the project pages carry the detail, so don't repeat a whole project in a bullet.

## 5. Refinement loop

After the first draft of each entry, run these checks yourself and fix what fails before showing Eli:

- Title says what it is, and the result if there is one. Not clever, not vague.
- Summary sentence one is the outcome. Sentence two is what Eli did.
- Every process bullet names at least one tool, material or process.
- Exactly one hero. At least one process/cad/drawing photo, or say plainly that the project can't be featured until he has one.
- No number anywhere that Eli didn't give. Search your own draft for digits and check each.
- No hype words. No sentence over about 25 words.
- Role line is specific enough that a reader knows what he personally did on a team job.
- Read it as a recruiter with 30 seconds: is the first thing they see the strongest thing?

Then show Eli the entry **as it would read on the page** (title, tagline, summary, quick facts, goal, process bullets, result, what I'd change), not just the JSON. Offer two or three alternatives for the title and tagline when you're unsure, not more. Iterate with him until he says an entry is done. Keep answers short; he's iterating on wording, not reading essays.

## 6. Final output

When Eli says everything is done, print exactly this, with no commentary around it:

```
=== EXPERIENCE ENTRY (Ely Tool) ===
<the TypeScript object, final>

=== PROJECT: <title> ===
<the JSON object, final, including media with file names>

(repeat for each project)

=== PHOTOS TO UPLOAD ===
<project slug>: <file 1 (hero)>, <file 2>, … in media order

=== OPEN TODOS ===
<every [TODO] still in the text, with what Eli needs to supply>
```

How it gets onto the site: Eli signs in on the site, taps "+", uploads each project's photos in the listed order with the title as the note, and the project appears as a draft. He then pastes these blocks into his portfolio session, which attaches the text to the draft, sets photo kinds and captions, updates the Ely Tool experience entry, and leaves everything unpublished for him to review and publish.
