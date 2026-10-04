"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminDb } from "@/lib/supabase";
import { requireOwner } from "@/lib/owner";
import { projectByIdAdmin } from "@/lib/projects";
import { CATEGORIES, MEDIA_KINDS, isFeatureReady, type Category, type MediaKind } from "@/lib/types";
import { slugify } from "@/lib/slug";

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

export async function updateProject(id: string, f: FormData) {
  await requireOwner();
  const category = String(f.get("category"));
  const roleKind = String(f.get("role_kind"));
  const yearStr = String(f.get("year") ?? "").trim();
  const links: Record<string, string> = {};
  String(f.get("links") ?? "").split("\n").forEach((line) => {
    const [label, url] = line.split("|").map((s) => s.trim());
    if (label && url) links[label] = url;
  });
  const slug = slugify(String(f.get("slug") ?? "")) || undefined;
  const { error } = await adminDb().from("projects").update({
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
  }).eq("id", id);
  if (error) {
    const cur = await projectByIdAdmin(id);
    redirect(`/work/${cur?.slug}?edit=1&error=${encodeURIComponent(error.message)}`);
  }
  const p = await projectByIdAdmin(id);
  refresh(p?.slug);
  redirect(`/work/${p?.slug ?? slug}?edit=1&saved=1`);
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

export async function updateMedia(projectId: string, mediaId: string, f: FormData) {
  await requireOwner();
  const kind = String(f.get("kind"));
  await adminDb().from("media").update({
    kind: MEDIA_KINDS.includes(kind as MediaKind) ? kind : null,
    caption: text(f, "caption"),
  }).eq("id", mediaId).eq("project_id", projectId);
  const p = await projectByIdAdmin(projectId);
  // Losing the last process photo also loses featured status.
  if (p?.featured && !isFeatureReady(p)) await adminDb().from("projects").update({ featured: false }).eq("id", projectId);
  refresh(p?.slug);
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
  await adminDb().from("projects").update({ cover_media: mediaId }).eq("id", projectId);
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
