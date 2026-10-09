"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/supabase";
import { ownerEmail } from "@/lib/supabase";
import { processImage } from "@/lib/images";
import { runIntake, type Taps } from "@/lib/intake";
import { uniqueSlug } from "@/lib/slug";

const MAX_PHOTOS = 12;
const BUCKET = "portfolio";

/** Step 1: hand the browser signed upload URLs, so big phone photos go straight to the bucket. */
// An expired sign-in is returned as { error: "signed-out" } rather than a redirect to /login, so the sheet
// keeps its photos and note and can say what happened (production hides thrown error messages from the client).
const signedOut = async () => !(await ownerEmail());

export async function prepareUploads(names: string[]): Promise<{ batch: string; uploads: { path: string; token: string }[] } | { error: "signed-out" }> {
  if (await signedOut()) return { error: "signed-out" };
  if (names.length === 0 || names.length > MAX_PHOTOS) throw new Error(`Pick 1–${MAX_PHOTOS} photos.`);
  const batch = randomUUID();
  const storage = adminDb().storage.from(BUCKET);
  const uploads = await Promise.all(
    names.map(async (name, i) => {
      const safe = name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").slice(-60) || "photo.jpg";
      const path = `inbox/${batch}/${String(i).padStart(2, "0")}-${safe}`;
      const { data, error } = await storage.createSignedUploadUrl(path);
      if (error) throw new Error(error.message);
      return { path, token: data.token };
    }),
  );
  return { batch, uploads };
}

export type IntakeOutcome =
  | { ok: true; action: "new" | "append" | "saved"; note?: string; projectId: string; slug: string; title: string; photos: number }
  | { ok: false; error: string };

/** Step 2: process uploaded originals, ask Claude for the draft, write rows. */
export async function submitIntake(input: {
  batch: string;
  paths: string[];
  note: string;
  taps: Taps;
  /** "now" = Claude API drafts it; "chat" = save for drafting later in a Claude Code chat. */
  mode: "now" | "chat";
}): Promise<IntakeOutcome> {
  if (await signedOut()) return { ok: false, error: "signed-out" };
  const db = adminDb();
  const storage = db.storage.from(BUCKET);
  const { batch, note } = input;
  const paths = input.paths.filter((p) => p.startsWith(`inbox/${batch}/`)).slice(0, MAX_PHOTOS);
  if (paths.length === 0) return { ok: false, error: "No photos uploaded." };

  try {
    // 1. Originals -> 1600px webp alongside + EXIF date + 1024px copy for the model.
    const processed = await Promise.all(
      paths.map(async (path) => {
        const { data, error } = await storage.download(path);
        if (error || !data) throw new Error(`Download failed for ${path}: ${error?.message}`);
        const img = await processImage(Buffer.from(await data.arrayBuffer()));
        const webpPath = path.replace(/\.[^./]+$/, "") + ".webp";
        const up = await storage.upload(webpPath, img.webp, { contentType: "image/webp", upsert: true });
        if (up.error) throw new Error(up.error.message);
        return { ...img, path: webpPath, original: path };
      }),
    );
    // Photo order: EXIF time when every photo has one, else picker order.
    if (processed.every((p) => p.takenAt)) processed.sort((a, b) => +a.takenAt! - +b.takenAt!);

    // 2. Existing projects for append detection.
    const { data: existing } = await db.from("projects").select("id, slug, title");
    const projects = existing ?? [];

    // 3. Save for chat (by choice, no API key, or API failure), else Claude drafts the entry now.
    const saveForChat = async (why?: string): Promise<IntakeOutcome> => {
      const title = note.trim().split(/\s+/).slice(0, 7).join(" ") || "Untitled draft";
      const { data: proj, error } = await db.from("projects").insert({
        slug: uniqueSlug(`draft ${title}`, new Set(projects.map((p) => p.slug))),
        title,
        role_kind: input.taps.roleKind,
        status: "draft",
        era: "current",
        needs_drafting: true,
        intake_note: note.trim() || null,
        intake_taps: input.taps,
        year: processed.map((p) => p.takenAt?.getFullYear()).find((y): y is number => typeof y === "number") ?? null,
      }).select("id, slug").single();
      if (error || !proj) throw new Error(error?.message ?? "insert failed");
      const { data: media, error: mErr } = await db.from("media").insert(
        processed.map((p, i) => ({
          project_id: proj.id, path: p.path, original_path: p.original, width: p.width, height: p.height,
          taken_at: p.takenAt?.toISOString() ?? null, sort: i,
        })),
      ).select("id, sort");
      if (mErr) throw new Error(mErr.message);
      const first = media?.find((m) => m.sort === 0);
      if (first) await db.from("projects").update({ cover_media: first.id }).eq("id", proj.id);
      revalidatePath("/review");
      return { ok: true, action: "saved", note: why, projectId: proj.id, slug: proj.slug, title, photos: processed.length };
    };

    if (input.mode === "chat") return await saveForChat();
    if (!process.env.ANTHROPIC_API_KEY) return await saveForChat("No API key is set, so it was saved for chat.");
    let r: Awaited<ReturnType<typeof runIntake>>;
    try {
      r = await runIntake({
        note: note.trim(),
        taps: input.taps,
        images: processed.map((p) => p.forModel),
        projects: projects.map(({ slug, title }) => ({ slug, title })),
      });
    } catch (e) {
      console.error("intake model call failed", e);
      return await saveForChat("Claude couldn't draft it right now, so it was saved for chat.");
    }

    const mediaRows = (projectId: string, startSort: number) =>
      processed.map((p, i) => ({
        project_id: projectId,
        path: p.path,
        original_path: p.original,
        width: p.width,
        height: p.height,
        taken_at: p.takenAt?.toISOString() ?? null,
        kind: r.media[i]?.kind ?? null,
        caption: r.media[i]?.caption || null,
        sort: startSort + i,
      }));

    // 4a. Append to an existing project.
    if (r.action === "append") {
      const target = projects.find((p) => p.slug === r.slug)!;
      const { data: last } = await db.from("media").select("sort").eq("project_id", target.id)
        .order("sort", { ascending: false }).limit(1).maybeSingle();
      // Appended photos never replace the existing hero.
      const rows = mediaRows(target.id, (last?.sort ?? -1) + 1).map((m) => ({ ...m, kind: m.kind === "hero" ? "after" : m.kind }));
      const { error } = await db.from("media").insert(rows);
      if (error) throw new Error(error.message);
      revalidatePath(`/projects/${target.slug}`);
      return { ok: true, action: "append", projectId: target.id, slug: target.slug, title: target.title, photos: rows.length };
    }

    // 4b. New draft project.
    const year =
      r.year ??
      processed.map((p) => p.takenAt?.getFullYear()).find((y): y is number => typeof y === "number") ??
      null;
    const slug = uniqueSlug(r.title, new Set(projects.map((p) => p.slug)));
    const { data: proj, error } = await db.from("projects").insert({
      slug,
      title: r.title,
      tagline: r.tagline || null,
      summary: r.summary || null,
      category: r.category,
      role_kind: r.role_kind,
      role: r.role,
      goal_constraints: r.goal_constraints,
      process_md: r.process_md,
      result_metric: r.result_metric,
      lesson: r.lesson,
      tools: r.tools,
      skills: r.skills,
      audience: r.audience,
      year,
      duration: r.duration,
      status: "draft",
      era: "current",
    }).select("id").single();
    if (error || !proj) throw new Error(error?.message ?? "insert failed");

    const { data: media, error: mErr } = await db.from("media").insert(mediaRows(proj.id, 0)).select("id, kind, sort");
    if (mErr) throw new Error(mErr.message);
    const hero = media?.find((m) => m.kind === "hero") ?? media?.sort((a, b) => a.sort - b.sort)[0];
    if (hero) await db.from("projects").update({ cover_media: hero.id }).eq("id", proj.id);

    revalidatePath("/review");
    return { ok: true, action: "new", projectId: proj.id, slug, title: r.title, photos: processed.length };
  } catch (e) {
    console.error("intake failed", e);
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong." };
  }
}
