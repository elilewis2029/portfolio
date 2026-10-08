---
name: portfolio-entry
description: Draft or edit portfolio projects in chat — batches saved "for chat" from /add, photos attached in the conversation, or longer back-and-forth write-ups. Use when Eli asks to draft pending entries, add a project, or rework one.
---

# Drafting portfolio entries in chat

Rules come from `CLAUDE.md`, `docs/RESEARCH.md` and `prompts/intake.md` (field list, word budget, voice). Same output shape as the API intake; the difference is you can ask questions.

## Setup check
`NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` must be set (environment variables, or `.env.local`), and the project host `<ref>.supabase.co` must be in the environment's allowed domains. Behind a proxy (cloud sessions), run the helper with `NODE_USE_ENV_PROXY=1` (and `NODE_EXTRA_CA_CERTS` set to the proxy's CA bundle), or Node's fetch fails with "fetch failed". "Invalid schema: portfolio" means the URL/key point at the wrong Supabase project. Run `npm install` if `node_modules` is missing.

## Pending batches from /add
1. `npm run portfolio -- pending` — prints each batch's note, tap answers, and photo files under `.intake/<slug>/`. Read every photo file.
2. If a batch clearly belongs to an existing project, `npm run portfolio -- merge <pending slug> <existing slug>`, then set kinds/captions with `update`.
3. Otherwise ask Eli the questions the photos can't answer — one short message, all at once: solo or team and what he was responsible for; the one number to brag about (tolerance, time saved, cost); timeline; what he'd change. Skip what the note already says.
4. Write the entry JSON (fields from `prompts/intake.md`, plus `media: [{ "id": "<media_id>", "kind": "...", "caption": "..." }]`) to `.intake/<slug>.json` and run `npm run portfolio -- update <slug> .intake/<slug>.json`. This clears "needs drafting".

## New project from photos attached in chat, or from a conversation
Save the photos into `.intake/new/`, write the entry JSON (media in photo order, no ids), then `npm run portfolio -- new .intake/new/entry.json .intake/new/*.jpg`.

## Editing an existing project
`npm run portfolio -- show <slug>` → edit → `update`.

## Hard rules
- Never invent measurements, tolerances, dates, durations, team sizes, costs or outcomes. Facts come from the note, the tap answers, Eli's chat replies, or what photos plainly show. Unknown → `[TODO: ...]` in text, null in the field.
- Exactly one `hero` per project; at least one `process`/`cad`/`drawing` photo or the project can't be featured.
- Everything stays `draft`. Eli publishes in `/review`. Give him the `/review/<id>` link.
- `.intake/` is scratch space; it is gitignored. Never commit photos or keys.
