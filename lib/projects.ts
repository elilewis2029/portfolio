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

/** Published projects of an era; in owner mode drafts are included (first, so they get finished). */
export async function listProjects(era: "current" | "archive", owner = false): Promise<Project[]> {
  let q = (owner ? adminDb() : publicDb()).from("projects").select(SELECT).eq("era", era);
  if (!owner) q = q.eq("status", "published");
  const { data, error } = await q
    .order("status", { ascending: true }) // draft < published
    .order("featured", { ascending: false })
    .order("year", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false });
  if (error) console.error(error);
  return sortMedia((data ?? []) as Project[]);
}

/** A project by slug. Visitors only ever get published rows (RLS); the owner also sees drafts. */
export async function projectBySlug(slug: string, owner = false): Promise<Project | null> {
  const { data } = await (owner ? adminDb() : publicDb()).from("projects").select(SELECT).eq("slug", slug).maybeSingle();
  return data ? sortMedia([data as Project])[0] : null;
}

/** Other pages in the same series, in series_order (visitors only get published rows). Empty when the project has no series. */
export async function seriesSiblings(p: Project, owner = false): Promise<Project[]> {
  if (!p.series) return [];
  const { data, error } = await (owner ? adminDb() : publicDb())
    .from("projects").select(SELECT).eq("series", p.series)
    .order("series_order", { ascending: true, nullsFirst: false })
    .order("year", { ascending: true, nullsFirst: false });
  if (error) console.error(error);
  return sortMedia((data ?? []) as Project[]);
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
