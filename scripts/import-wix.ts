/**
 * Import the old Wix site export into Supabase.
 *
 *   1. Unzip the export into ./export (so ./export/content.json exists).
 *   2. Put the env vars in .env.local.
 *   3. npm run import-wix            (add --dry to only print the plan)
 *
 * content.json: [{ kind, slug, title, date, text: string[], local_images: string[] }]
 * Everything lands as status=draft. Items PLAN.md marks Feature/Publish go to era=current,
 * the rest to era=archive. The makerspace section + blog posts fold into one project.
 * Re-running skips slugs that already exist.
 */
import { config } from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import exifr from "exifr";

// .env.local beats the shell: the cloud session-start hook pulls it from Vercel production, while the
// environment's own variables can point at a retired project. Plain .env still only fills gaps.
config({ path: ".env.local", override: true });
config();

type Item = { kind: string; slug: string; title: string; date?: string | null; text?: string[]; local_images?: string[] };
type Category = "engineering" | "manufacturing-shop" | "electronics" | "design-craft";

const EXPORT = path.resolve("export");
const DRY = process.argv.includes("--dry");

// From PLAN.md "What to feature, what to archive". Matched against lowercase title.
const CURRENT = [/carbon fiber journal/, /portable wii|ashida/, /drill press/, /car kit/, /metal notebook/, /monitor/, /resin/];
const CATEGORY: [RegExp, Category][] = [
  [/drill press|metal notebook|planer/, "manufacturing-shop"],
  [/wii|monitor|electronic|arduino|speaker/, "electronics"],
  [/car kit/, "engineering"],
];
const isMakerspace = (it: Item) => /makerspace/i.test(`${it.slug} ${it.title}`) || /blog|post/i.test(it.kind);

function categoryOf(title: string): Category {
  const t = title.toLowerCase();
  return CATEGORY.find(([re]) => re.test(t))?.[1] ?? "design-craft";
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "project";
}

function yearOf(date?: string | null) {
  const m = date?.match(/(19|20)\d{2}/);
  return m ? Number(m[0]) : null;
}

async function main() {
  const items: Item[] = JSON.parse(await fs.readFile(path.join(EXPORT, "content.json"), "utf8"));

  // Fold the makerspace section and its blog posts into one project.
  const maker = items.filter(isMakerspace);
  const projects: (Item & { category: Category; era: "current" | "archive"; skills: string[] })[] = items
    .filter((it) => !isMakerspace(it))
    .map((it) => ({
      ...it,
      slug: slugify(it.slug || it.title),
      category: categoryOf(it.title),
      era: CURRENT.some((re) => re.test(it.title.toLowerCase())) ? "current" : "archive",
      skills: [],
    }));
  if (maker.length) {
    const sorted = [...maker].sort((a, b) => String(a.date ?? "").localeCompare(String(b.date ?? "")));
    projects.push({
      kind: "project",
      slug: "community-makerspace",
      title: "Community makerspace",
      date: sorted.find((m) => m.date)?.date ?? null,
      text: sorted.flatMap((m) => [
        `**${m.title}${m.date ? ` (${String(m.date).slice(0, 10)})` : ""}**`,
        ...(m.text ?? []),
      ]),
      local_images: sorted.flatMap((m) => m.local_images ?? []),
      category: "engineering",
      era: "current",
      skills: ["leadership"],
    });
  }

  console.log(`${projects.length} projects (${maker.length} makerspace items folded into one)`);
  for (const p of projects) {
    console.log(`  ${p.era.padEnd(7)} ${p.category.padEnd(18)} ${p.slug}  [${p.local_images?.length ?? 0} photos]`);
  }
  if (DRY) return;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  const db = createClient(url, key, { db: { schema: "portfolio" }, auth: { persistSession: false } });
  const storage = db.storage.from("portfolio");

  const { data: existing, error: exErr } = await db.from("projects").select("slug");
  if (exErr) throw new Error(`Can't read portfolio.projects (is the schema exposed?): ${exErr.message}`);
  const taken = new Set((existing ?? []).map((r) => r.slug));

  for (const p of projects) {
    if (taken.has(p.slug)) {
      console.log(`skip ${p.slug} (exists)`);
      continue;
    }
    const { data: row, error } = await db.from("projects").insert({
      slug: p.slug,
      title: p.title,
      body_md: (p.text ?? []).filter((t) => t.trim()).join("\n\n") || null,
      category: p.category,
      skills: p.skills,
      year: yearOf(p.date),
      status: "draft",
      era: p.era,
    }).select("id").single();
    if (error || !row) {
      console.error(`fail ${p.slug}: ${error?.message}`);
      continue;
    }

    const media = [];
    for (const [i, rel] of (p.local_images ?? []).entries()) {
      try {
        const file = path.resolve(EXPORT, rel);
        const buf = await fs.readFile(file);
        const base = `wix/${p.slug}/${String(i).padStart(2, "0")}-${path.basename(file).toLowerCase().replace(/[^a-z0-9.]+/g, "-")}`;
        const webpPath = base.replace(/\.[^./]+$/, "") + ".webp";
        let takenAt: Date | null = null;
        try {
          const ex = await exifr.parse(buf, ["DateTimeOriginal", "CreateDate"]);
          takenAt = ex?.DateTimeOriginal ?? ex?.CreateDate ?? null;
        } catch { /* no EXIF */ }
        const { data: webp, info } = await sharp(buf, { failOn: "none" }).rotate()
          .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
          .webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
        const ext = path.extname(file).slice(1).toLowerCase();
        await storage.upload(base, buf, { contentType: `image/${ext === "jpg" ? "jpeg" : ext}`, upsert: true });
        const up = await storage.upload(webpPath, webp, { contentType: "image/webp", upsert: true });
        if (up.error) throw new Error(up.error.message);
        media.push({
          project_id: row.id, path: webpPath, original_path: base, sort: i,
          width: info.width, height: info.height, taken_at: takenAt?.toISOString() ?? null,
          kind: i === 0 ? "hero" : null, // tag the rest in /review
        });
      } catch (e) {
        console.error(`  photo ${rel}: ${e instanceof Error ? e.message : e}`);
      }
    }
    if (media.length) {
      const { data: inserted, error: mErr } = await db.from("media").insert(media).select("id, sort");
      if (mErr) console.error(`  media ${p.slug}: ${mErr.message}`);
      const cover = inserted?.find((m) => m.sort === 0) ?? inserted?.[0];
      if (cover) await db.from("projects").update({ cover_media: cover.id }).eq("id", row.id);
    }
    console.log(`ok   ${p.slug} (${media.length} photos)`);
  }
  console.log("Done. Open /review to tag photos, fill the structured fields, and publish.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
