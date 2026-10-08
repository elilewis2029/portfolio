"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminDb } from "@/lib/supabase";
import { requireOwner } from "@/lib/owner";
import { projectByIdAdmin } from "@/lib/projects";
import { CATEGORIES, MEDIA_KINDS, isFeatureReady, type Category, type MediaKind } from "@/lib/types";
import { slugify } from "@/lib/slug";
import { processImage } from "@/lib/images";

function refresh(slug?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/review");
  if (slug) revalidatePath(`/work/${slug}`);
}

const text = (f: FormData, k: string) => {
  const v = String(f.get(k) ?? "").trim();
  return v ? v : null;
};
const list = (f: FormData, k: string) =>
  [...new Set(String(f.get(k) ?? "").split(",").map((s) => s.trim().toLowerCase().replace(/\s+/g, "-")).filter(Boolean))];

// Where to come back to after signing in again, so a Save from a stale tab lands back in the editor.
const returnTo = (f: FormData) => {
  const v = String(f.get("return_to") ?? "");
  return v.startsWith("/") && !v.startsWith("//") ? v : "/";
};

export async function updateProject(id: string, f: FormData) {
  await requireOwner(returnTo(f));
  const category = String(f.get("category"));
  const roleKind = String(f.get("role_kind"));
  const yearStr = String(f.get("year") ?? "").trim();
  const links: Record<string, string> = {};
  String(f.get("links") ?? "").split("\n").forEach((line) => {
    const [label, url] = line.split("|").map((s) => s.trim());
    if (label && url) links[label] = url;
  });
  const db = adminDb();
  let slug = slugify(String(f.get("slug") ?? "")) || undefined;
  // A URL another project already uses: save everything else and say so, instead of failing the whole Save.
  let warning: string | null = null;
  if (slug) {
    const { data: taken } = await db.from("projects").select("id").eq("slug", slug).neq("id", id).maybeSingle();
    if (taken) {
      warning = `The URL /work/${slug} is already used by another project, so the URL was not changed. Everything else was saved.`;
      slug = undefined;
    }
  }
  const fields = {
    title: text(f, "title") ?? "Untitled",
    ...(slug ? { slug } : {}),
    tagline: text(f, "tagline"),
    summary: text(f, "summary"),
    category: CATEGORIES.includes(category as Category) ? category : "engineering",
    role_kind: roleKind === "solo" || roleKind === "team" ? roleKind : null,
    role: text(f, "role"),
    duration: text(f, "duration"),
    year: /^\d{4}$/.test(yearStr) ? Number(yearStr) : null,
    era: f.get("era") === "archive" ? "archive" : "current",
    goal_constraints: text(f, "goal_constraints"),
    process_md: text(f, "process_md"),
    result_metric: text(f, "result_metric"),
    lesson: text(f, "lesson"),
    body_md: text(f, "body_md"),
    tools: list(f, "tools"),
    skills: list(f, "skills"),
    audience: list(f, "audience").filter((a) => ["pd", "mech", "mfg"].includes(a)),
    links,
  };
  const seriesFields = {
    series: text(f, "series"),
    series_order: /^\d+$/.test(String(f.get("series_order") ?? "").trim()) ? Number(f.get("series_order")) : null,
  };
  // Series columns arrive with migration 0003; on a database without them, save everything else.
  let { error } = await db.from("projects").update({ ...fields, ...seriesFields }).eq("id", id);
  if (error && /series/.test(error.message)) ({ error } = await db.from("projects").update(fields).eq("id", id));
  if (error) {
    const cur = await projectByIdAdmin(id);
    redirect(`/work/${cur?.slug}?edit=1&error=${encodeURIComponent(`Not saved: ${error.message}`)}`);
  }
  // Photo kinds and captions are fields of the same form (media_kind:<id>, media_caption:<id>).
  const mediaIds = [...f.keys()].filter((k) => k.startsWith("media_kind:")).map((k) => k.slice("media_kind:".length));
  await Promise.all(mediaIds.map((mid) => {
    const kind = String(f.get(`media_kind:${mid}`));
    return db.from("media").update({
      kind: MEDIA_KINDS.includes(kind as MediaKind) ? kind : null,
      caption: text(f, `media_caption:${mid}`),
    }).eq("id", mid).eq("project_id", id);
  }));
  const p = await projectByIdAdmin(id);
  // Losing the last process photo also loses featured status.
  if (p?.featured && !isFeatureReady(p)) await db.from("projects").update({ featured: false }).eq("id", id);
  refresh(p?.slug);
  // `saved` is a fresh value on every Save, so the editor knows this Save (not an earlier one) went through.
  const extra = warning ? `&error=${encodeURIComponent(warning)}` : "";
  redirect(`/work/${p?.slug ?? slug}?edit=1&saved=${Date.now()}${extra}`);
}

export async function setStatus(id: string, status: "draft" | "published") {
  await requireOwner();
  const update: Record<string, unknown> = { status };
  if (status === "draft") update.featured = false;
  await adminDb().from("projects").update(update).eq("id", id);
  const p = await projectByIdAdmin(id);
  refresh(p?.slug);
}

export async function setFeatured(id: string, featured: boolean) {
  await requireOwner();
  const db = adminDb();
  if (featured) {
    const p = await projectByIdAdmin(id);
    const fail = (msg: string) => redirect(`/work/${p?.slug}?error=${encodeURIComponent(msg)}`);
    if (!p) redirect("/review");
    if (!isFeatureReady(p)) fail("Needs a process, CAD or drawing photo before it can be featured.");
    if (p.status !== "published") fail("Publish it first.");
    const { count } = await db.from("projects").select("id", { count: "exact", head: true }).eq("featured", true).neq("id", id);
    if ((count ?? 0) >= 5) fail("Five projects are already featured. Unfeature one first.");
  }
  await db.from("projects").update({ featured }).eq("id", id);
  refresh();
}

export async function deleteProject(id: string) {
  await requireOwner();
  const db = adminDb();
  const p = await projectByIdAdmin(id);
  if (p?.media?.length) {
    const paths = p.media.flatMap((m) => [m.path, m.original_path].filter((x): x is string => !!x));
    await db.storage.from("portfolio").remove(paths);
  }
  await db.from("projects").delete().eq("id", id);
  refresh(p?.slug);
  redirect("/review");
}

export async function moveMedia(projectId: string, mediaId: string, dir: -1 | 1) {
  await requireOwner();
  const p = await projectByIdAdmin(projectId);
  const media = p?.media ?? [];
  const i = media.findIndex((m) => m.id === mediaId);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= media.length) return;
  [media[i], media[j]] = [media[j], media[i]];
  const db = adminDb();
  await Promise.all(media.map((m, k) => db.from("media").update({ sort: k }).eq("id", m.id)));
  refresh(p?.slug);
}

export async function setCover(projectId: string, mediaId: string) {
  await requireOwner();
  const db = adminDb();
  await db.from("projects").update({ cover_media: mediaId }).eq("id", projectId);
  // The old cover was usually typed "hero"; left that way it would vanish from the page (only the cover shows as hero).
  await db.from("media").update({ kind: "process" }).eq("project_id", projectId).eq("kind", "hero").neq("id", mediaId);
  const p = await projectByIdAdmin(projectId);
  refresh(p?.slug);
}

export async function deleteMedia(projectId: string, mediaId: string) {
  await requireOwner();
  const db = adminDb();
  const { data: m } = await db.from("media").select("path, original_path").eq("id", mediaId).eq("project_id", projectId).maybeSingle();
  if (m) await db.storage.from("portfolio").remove([m.path, m.original_path].filter((x): x is string => !!x));
  await db.from("media").delete().eq("id", mediaId).eq("project_id", projectId);
  await db.from("projects").update({ cover_media: null }).eq("id", projectId).eq("cover_media", mediaId);
  const p = await projectByIdAdmin(projectId);
  if (p?.featured && !isFeatureReady(p)) await db.from("projects").update({ featured: false }).eq("id", projectId);
  refresh(p?.slug);
}

/** Photos uploaded straight from a project page (after prepareUploads): 1600px webp, appended after the last photo. */
export async function addPhotos(id: string, batch: string, paths: string[]): Promise<{ ok: true; added: number } | { ok: false; error: string }> {
  await requireOwner();
  const db = adminDb();
  const storage = db.storage.from("portfolio");
  const p = await projectByIdAdmin(id);
  if (!p) return { ok: false, error: "Project not found." };
  const mine = paths.filter((path) => path.startsWith(`inbox/${batch}/`)).slice(0, 12);
  if (mine.length === 0) return { ok: false, error: "No photos uploaded." };
  try {
    const processed = await Promise.all(
      mine.map(async (path) => {
        const { data, error } = await storage.download(path);
        if (error || !data) throw new Error(`Download failed for ${path}: ${error?.message}`);
        const img = await processImage(Buffer.from(await data.arrayBuffer()));
        const webpPath = path.replace(/\.[^./]+$/, "") + ".webp";
        const up = await storage.upload(webpPath, img.webp, { contentType: "image/webp", upsert: true });
        if (up.error) throw new Error(up.error.message);
        return { ...img, path: webpPath, original: path };
      }),
    );
    const start = Math.max(-1, ...(p.media ?? []).map((m) => m.sort)) + 1;
    const { data: rows, error } = await db.from("media").insert(
      processed.map((img, i) => ({
        project_id: id, path: img.path, original_path: img.original, width: img.width, height: img.height,
        taken_at: img.takenAt?.toISOString() ?? null, kind: "process", caption: null, sort: start + i,
      })),
    ).select("id");
    if (error) throw new Error(error.message);
    // A project with no photos yet gets its first upload as the cover.
    if (!p.cover_media && rows?.[0]) {
      await db.from("media").update({ kind: "hero" }).eq("id", rows[0].id);
      await db.from("projects").update({ cover_media: rows[0].id }).eq("id", id);
    }
    refresh(p.slug);
    return { ok: true, added: processed.length };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Upload failed" };
  }
}
