import "server-only";
import { publicDb, adminDb } from "./supabase";
import type { Project } from "./types";

const SELECT = "*, media(*)";

function sortMedia(list: Project[]) {
  list.forEach((p) => p.media?.sort((a, b) => a.sort - b.sort));
  return list;
}

export async function featuredProjects(): Promise<Project[]> {
  const { data, error } = await publicDb()
    .from("projects").select(SELECT)
    .eq("status", "published").eq("featured", true)
    .order("year", { ascending: false, nullsFirst: false }).limit(5);
  if (error) console.error(error);
  return sortMedia((data ?? []) as Project[]);
}

export async function listProjects(era: "current" | "archive"): Promise<Project[]> {
  const { data, error } = await publicDb()
    .from("projects").select(SELECT)
    .eq("status", "published").eq("era", era)
    .order("featured", { ascending: false })
    .order("year", { ascending: false, nullsFirst: false });
  if (error) console.error(error);
  return sortMedia((data ?? []) as Project[]);
}

export async function projectBySlug(slug: string): Promise<Project | null> {
  const { data } = await publicDb().from("projects").select(SELECT).eq("slug", slug).maybeSingle();
  return data ? sortMedia([data as Project])[0] : null;
}

/** Owner-only: everything, drafts first. */
export async function allProjectsAdmin(): Promise<Project[]> {
  const { data, error } = await adminDb()
    .from("projects").select(SELECT)
    .order("status", { ascending: true })
    .order("updated_at", { ascending: false });
  if (error) console.error(error);
  return sortMedia((data ?? []) as Project[]);
}

export async function projectByIdAdmin(id: string): Promise<Project | null> {
  const { data } = await adminDb().from("projects").select(SELECT).eq("id", id).maybeSingle();
  return data ? sortMedia([data as Project])[0] : null;
}

export function contactEmail() {
  return process.env.CONTACT_EMAIL || process.env.OWNER_EMAIL || "";
}

export function publicUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/portfolio/${path}`;
}
