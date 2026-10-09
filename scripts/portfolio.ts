/**
 * Portfolio helper for drafting entries in a Claude Code chat (see .claude/skills/portfolio-entry/SKILL.md).
 * Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (env or .env.local).
 *
 *   npm run portfolio -- pending                    batches saved "for chat"; photos -> .intake/<slug>/
 *   npm run portfolio -- list                       every project: id, status, slug, title
 *   npm run portfolio -- show <slug|id>             full project + photos -> .intake/<slug>/
 *   npm run portfolio -- update <slug|id> <file>    apply a JSON entry (fields + media kinds/captions)
 *   npm run portfolio -- new <file> <photo>...      create a draft from a JSON entry + local photos
 *   npm run portfolio -- add-photos <slug|id> <photo>...
 *   npm run portfolio -- merge <from slug|id> <into slug|id>   move photos, delete the "from" draft
 *   npm run portfolio -- delete <slug|id>           delete a draft and its photos (refuses published projects)
 *
 * Entry JSON uses the fields in prompts/intake.md (title, tagline, summary, role_kind, role, goal_constraints,
 * process_md, result_metric, lesson, category, tools, skills, audience, year, duration, links, body_md, era),
 * plus media: [{ id?, kind, caption }] (id when updating; in photo order when creating). `slug`, `status` and
 * `featured` may be set too (a new entry without a slug gets one from its title; `new` always starts as a draft
 * unless the entry says otherwise). Featuring still needs a process/cad/drawing photo (CLAUDE.md rule 7).
 */
import { config } from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { processImage } from "../lib/images";
import { slugify, uniqueSlug } from "../lib/slug";
import { CATEGORIES, MEDIA_KINDS, READY_KINDS } from "../lib/types";

config({ path: ".env.local" });
config();

// Tolerate a URL pasted with the REST path (".../rest/v1/"); supabase-js appends that itself.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/rest\/v1\/?$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
const db = createClient(url, key, { db: { schema: "portfolio" }, auth: { persistSession: false } });
const storage = db.storage.from("portfolio");

const FIELDS = [
  "title", "tagline", "summary", "role_kind", "role", "goal_constraints", "process_md", "result_metric",
  "lesson", "category", "tools", "skills", "audience", "year", "duration", "links", "body_md", "era", "series", "series_order",
  "slug", "status", "featured",
] as const;

type Media = { id: string; path: string; original_path?: string | null; kind: string | null; caption: string | null; sort: number };

async function find(ref: string) {
  const col = /^[0-9a-f-]{36}$/.test(ref) ? "id" : "slug";
  const { data, error } = await db.from("projects").select("*, media(id, path, original_path, kind, caption, sort)").eq(col, ref).maybeSingle();
  if (error || !data) throw new Error(`No project "${ref}" ${error?.message ?? ""}`);
  data.media.sort((a: Media, b: Media) => a.sort - b.sort);
  return data;
}

/** Download each photo as a 1024px jpeg the chat can look at. */
async function fetchPhotos(slug: string, media: Media[]) {
  const dir = path.join(".intake", slug);
  await fs.mkdir(dir, { recursive: true });
  const out = [];
  for (const [i, m] of media.entries()) {
    const { data } = await storage.download(m.path);
    if (!data) continue;
    const file = path.join(dir, `photo-${String(i + 1).padStart(2, "0")}.jpg`);
    await sharp(Buffer.from(await data.arrayBuffer())).resize({ width: 1024, height: 1024, fit: "inside" }).jpeg({ quality: 80 }).toFile(file);
    out.push({ photo: i + 1, media_id: m.id, kind: m.kind, caption: m.caption, file });
  }
  return out;
}

function pickFields(entry: Record<string, unknown>) {
  const row: Record<string, unknown> = {};
  for (const f of FIELDS) if (f in entry) row[f] = entry[f] === "" ? null : entry[f];
  if (row.category && !CATEGORIES.includes(row.category as never)) throw new Error(`Bad category ${row.category}`);
  if (row.role_kind && !["solo", "team"].includes(row.role_kind as string)) throw new Error("role_kind must be solo or team");
  if (row.status && !["draft", "published"].includes(row.status as string)) throw new Error("status must be draft or published");
  if (row.era && !["current", "archive"].includes(row.era as string)) throw new Error("era must be current or archive");
  if (row.slug) row.slug = slugify(String(row.slug));
  return row;
}

async function applyMedia(projectId: string, media: { id?: string; kind?: string | null; caption?: string }[], ids: string[]) {
  for (const [i, m] of media.entries()) {
    const id = m.id ?? ids[i];
    if (!id) continue;
    const kind = m.kind && MEDIA_KINDS.includes(m.kind as never) ? m.kind : null;
    await db.from("media").update({ kind, caption: m.caption || null }).eq("id", id).eq("project_id", projectId);
    if (kind === "hero") await db.from("projects").update({ cover_media: id }).eq("id", projectId);
  }
}

async function uploadPhotos(projectId: string, slug: string, files: string[], startSort: number) {
  const ids: string[] = [];
  for (const [i, file] of files.entries()) {
    const buf = await fs.readFile(file);
    const img = await processImage(buf);
    const base = `chat/${slug}/${Date.now()}-${i}-${path.basename(file).toLowerCase().replace(/[^a-z0-9.]+/g, "-")}`;
    const webpPath = base.replace(/\.[^./]+$/, "") + ".webp";
    await storage.upload(base, buf, { upsert: true });
    const up = await storage.upload(webpPath, img.webp, { contentType: "image/webp", upsert: true });
    if (up.error) throw new Error(up.error.message);
    const { data, error } = await db.from("media").insert({
      project_id: projectId, path: webpPath, original_path: base, width: img.width, height: img.height,
      taken_at: img.takenAt?.toISOString() ?? null, sort: startSort + i,
    }).select("id").single();
    if (error) throw new Error(error.message);
    ids.push(data.id);
  }
  return ids;
}

const readJson = async (file: string) => JSON.parse(await fs.readFile(file, "utf8"));
const print = (x: unknown) => console.log(JSON.stringify(x, null, 2));

async function main() {
  const [cmd, a, b, ...rest] = process.argv.slice(2);
  switch (cmd) {
    case "pending": {
      const { data } = await db.from("projects").select("*, media(id, path, kind, caption, sort)").eq("needs_drafting", true).order("created_at");
      const out = [];
      for (const p of data ?? []) {
        p.media.sort((x: Media, y: Media) => x.sort - y.sort);
        out.push({ id: p.id, slug: p.slug, note: p.intake_note, taps: p.intake_taps, year_from_photos: p.year, photos: await fetchPhotos(p.slug, p.media) });
      }
      const { data: all } = await db.from("projects").select("slug, title").eq("needs_drafting", false);
      print({ pending: out, existing_projects: all });
      break;
    }
    case "list": {
      const { data, error } = await db.from("projects").select("id, status, era, featured, needs_drafting, slug, title").order("updated_at", { ascending: false });
      if (error) throw new Error(error.message);
      (data ?? []).forEach((p) => console.log([p.id, p.status, p.era, p.featured ? "featured" : "", p.needs_drafting ? "needs-drafting" : "", p.slug, p.title].join("\t")));
      break;
    }
    case "show": {
      const p = await find(a);
      print({ ...p, media: undefined, photos: await fetchPhotos(p.slug, p.media) });
      break;
    }
    case "update": {
      const p = await find(a);
      const entry = await readJson(b);
      const row = pickFields(entry);
      if (Array.isArray(entry.media)) await applyMedia(p.id, entry.media, p.media.map((m: Media) => m.id));
      if (row.featured === true) {
        const { data: kinds } = await db.from("media").select("kind").eq("project_id", p.id);
        if (!(kinds ?? []).some((m) => READY_KINDS.includes(m.kind as never))) throw new Error(`${p.slug} needs a process, cad or drawing photo before it can be featured`);
      }
      const { error } = await db.from("projects").update({ ...row, needs_drafting: false }).eq("id", p.id);
      if (error) throw new Error(error.message);
      console.log(`updated ${p.slug} -> /review/${p.id}`);
      break;
    }
    case "new": {
      const entry = await readJson(a);
      const files = [b, ...rest].filter(Boolean);
      const { data: existing } = await db.from("projects").select("slug");
      const taken = new Set((existing ?? []).map((r) => r.slug));
      const slug = entry.slug ? uniqueSlug(String(entry.slug), taken) : uniqueSlug(entry.title ?? "project", taken);
      const { data: p, error } = await db.from("projects").insert({ status: "draft", ...pickFields(entry), slug }).select("id").single();
      if (error || !p) throw new Error(error?.message);
      const ids = await uploadPhotos(p.id, slug, files, 0);
      if (Array.isArray(entry.media)) await applyMedia(p.id, entry.media, ids);
      if (ids[0]) await db.from("projects").update({ cover_media: ids[0] }).eq("id", p.id).is("cover_media", null);
      console.log(`created draft ${slug} -> /review/${p.id}`);
      break;
    }
    case "add-photos": {
      const p = await find(a);
      const last = p.media.at(-1)?.sort ?? -1;
      const ids = await uploadPhotos(p.id, p.slug, [b, ...rest].filter(Boolean), last + 1);
      console.log(`added ${ids.length} photos to ${p.slug}: ${ids.join(", ")}`);
      break;
    }
    case "merge": {
      const from = await find(a);
      const into = await find(b);
      const last = into.media.at(-1)?.sort ?? -1;
      for (const [i, m] of from.media.entries()) {
        await db.from("media").update({ project_id: into.id, sort: last + 1 + i, kind: m.kind === "hero" ? "after" : m.kind }).eq("id", m.id);
      }
      await db.from("projects").delete().eq("id", from.id);
      console.log(`moved ${from.media.length} photos into ${into.slug}; deleted ${from.slug}`);
      break;
    }
    case "delete": {
      const p = await find(a);
      if (p.status !== "draft") throw new Error(`${p.slug} is ${p.status}; unpublish it in /review first`);
      const paths = p.media.flatMap((m: Media) => [m.path, m.original_path].filter((x): x is string => !!x));
      if (paths.length) await storage.remove(paths);
      const { error } = await db.from("projects").delete().eq("id", p.id);
      if (error) throw new Error(error.message);
      console.log(`deleted ${p.slug} and ${p.media.length} photos`);
      break;
    }
    default:
      console.log("commands: pending | list | show | update | new | add-photos | merge | delete (see top of scripts/portfolio.ts)");
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
