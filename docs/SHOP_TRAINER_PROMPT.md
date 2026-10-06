# Prompt: add the Northwestern shop trainer role

Paste everything below the line into a new chat (Claude with web search, or a Claude Code session on this repo). Copy the final block it prints back into the main portfolio session, or let it edit `content/profile.ts` directly if it has the repo.

---

You're helping Eli Lewis add one job to his engineering portfolio site: his work as a **shop trainer at Northwestern University**. He's a Manufacturing & Design Engineering (MaDE) student, Northwestern '29. The site is at elilewisportfolio.info; the profile lives in `content/profile.ts` in the repo elilewis2029/portfolio.

Your job: research the role so Eli doesn't have to explain the basics, confirm the specifics with him in one short batch of questions, then write the Experience entry in his voice.

## Step 1: research first, before asking anything

Use web search. Do not rely on memory for anything about Northwestern. Find out:

- Which shops at Northwestern use student trainers or shop staff. Start with the Segal Design Institute, the Ford Motor Company Engineering Design Center prototyping shops, the MaDE program, The Garage, and any makerspace or machine shop under McCormick School of Engineering. Search terms: "Northwestern shop trainer", "Northwestern Segal shop student staff", "Ford Design Center prototyping shop Northwestern", "Northwestern McCormick machine shop training".
- What a student shop trainer actually does there: safety and equipment training, certifications or "checkouts", open shop hours, supervising students, maintaining machines, helping with class projects.
- What equipment the shops have: manual and CNC mills and lathes, waterjet, laser cutters, 3D printers, woodshop, welding, sheet metal, composites, and so on.
- How the job is usually described in Northwestern's own postings or pages, and the official title if there is one (shop trainer, shop assistant, shop monitor, student technician).
- Which courses or programs run through those shops (DTC, MaDE studio courses, senior capstone) so the context is accurate.

Keep a list of the sources you used with URLs. Prefer northwestern.edu pages, then official job postings, then student newspaper articles. Ignore anything you can't source.

## Step 2: play it back and ask, once

Write a short summary of what you found: which shop or shops, what trainers do, what equipment is there. Then ask Eli, in one batch, only the things research can't answer. Yes/no or one-line answers. Something like:

1. Which shop or shops do you work in, and what's your exact title?
2. When did you start, and is it ongoing? (month and year)
3. Roughly how many hours a week, or shifts?
4. Which machines are you certified to train people on? Which do you train most often?
5. Any numbers: students trained, checkouts run, hours of open shop covered, classes supported.
6. Anything you built, fixed, or improved for the shop: a fixture, a training guide, a maintenance process, a jig, a tool organization system.
7. One story: the hardest thing to teach, a mistake you caught, a moment you're proud of.
8. Did you have to get certified yourself first? How?
9. Do you have photos: you at the machine, the shop, something you made for it?

Don't ask more than ten questions. If Eli's answers contradict the research, Eli wins.

## Step 3: draft the entry

Write the Experience entry in the exact shape the profile uses:

```ts
{
  org: "Northwestern University — <shop name from research, confirmed by Eli>",
  title: "<exact title>",
  dates: "<e.g. “Sep 2025 – present”>",
  location: "Evanston, IL",
  bullets: [
    "<what he does, concretely: machines, who he trains, what a checkout involves>",
    "<one number, only if Eli gave one>",
    "<something he built, fixed or improved for the shop, only if real>",
  ],
}
```

Rules for the bullets:

- First person implied, plain, specific. No "responsible for", "leveraged", "passionate", "spearheaded".
- Three bullets, each under 25 words. Lead with the verb and the thing: "Train students on the Haas CNC mill and manual lathes; run safety checkouts before they can book shop time."
- Every number, date, machine name and course name comes from Eli or from a source you cited. If it's missing, write `[TODO: …]` in its place, don't guess.
- Research can tell you what the shop is and what trainers generally do. It cannot tell you what Eli did. Don't attribute shop-wide facts to him as if they were his work.
- Offer two or three alternative wordings for any bullet he's unsure about, not more.

Also suggest, as a separate optional item, whether this belongs in `involvement` too (for example if it's tied to a student org) and whether any photo would make a good project page on its own (a fixture or guide he made for the shop is a project; the job itself is not).

## Step 4: output

When Eli approves the wording, print:

```
EXPERIENCE ENTRY
<the TypeScript object above, final>

SOURCES
<URLs you relied on, one per line>

PHOTOS TO GATHER
<list, or "none">
```

If you're running inside the repo: add the entry to `profile.experience` in `content/profile.ts` as the first item (most recent first), keep the Ely Tool entry after it, remove the `[TODO: other jobs…]` placeholder entry if this fills it, run `npx tsc --noEmit`, commit with a one-line message, push, and open a PR. Don't merge; don't touch anything else in the repo.
