import "server-only";
import { publicDb, adminDb } from "./supabase";
import type { Project } from "./types";
import { slugify } from "./slug";

const SELECT = "*, media(*)";

function sortMedia(list: Project[]) {
  list.forEach((p) => p.media?.sort((a, b) => a.sort - b.sort));
  return list;
}

const TODO = /\[TODO[^\]]*\]/gi;

/** Text with every [TODO…] marker removed; null when nothing real is left. Markdown bullets left empty are dropped. */
export function scrubTodo(v: string | null | undefined): string | null {
  if (!v) return v ?? null;
  if (!/\[TODO/i.test(v)) return v;
  const out = v
    .replace(TODO, "")
    .split("\n")
    .map((l) => l.replace(/[ \t]+$/, "").replace(/\s+([.,;:])/g, "$1"))
    .filter((l) => !/^\s*([-*•]|\d+[.)])?\s*$/.test(l) || l === "")
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return out && /[A-Za-z0-9]/.test(out) ? out : null;
}

const TEXT_FIELDS = ["title", "tagline", "summary", "body_md", "role", "goal_constraints", "process_md", "result_metric", "lesson", "duration"] as const;

/**
 * What visitors get: no [TODO…] placeholder ever reaches a public page. A field that was only a placeholder
 * becomes null, so its section is not drawn at all; captions get the same treatment. The owner sees raw rows.
 */
function forVisitors(list: Project[]): Project[] {
  for (const p of list) {
    const r = p as unknown as Record<string, unknown>;
    for (const f of TEXT_FIELDS) if (typeof r[f] === "string") r[f] = scrubTodo(r[f] as string);
    if (!p.title) p.title = "Untitled project";
    p.media?.forEach((m) => { m.caption = scrubTodo(m.caption); });
    p.tools = (p.tools ?? []).filter((t) => !/\[TODO/i.test(t));
    p.skills = (p.skills ?? []).filter((t) => !/\[TODO/i.test(t));
  }
  return list;
}
const shape = (list: Project[], owner: boolean) => (owner ? sortMedia(list) : forVisitors(sortMedia(list)));

export async function featuredProjects(): Promise<Project[]> {
  const { data, error } = await publicDb()
    .from("projects").select(SELECT)
    .eq("status", "published").eq("featured", true)
    .order("year", { ascending: false, nullsFirst: false }).limit(5);
  if (error) console.error(error);
  return shape((data ?? []) as Project[], false);
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
  return shape((data ?? []) as Project[], owner);
}

/** A project by slug. Visitors only ever get published rows (RLS); the owner also sees drafts. */
export async function projectBySlug(slug: string, owner = false): Promise<Project | null> {
  const { data } = await (owner ? adminDb() : publicDb()).from("projects").select(SELECT).eq("slug", slug).maybeSingle();
  return data ? shape([data as Project], owner)[0] : null;
}

/** Other pages in the same series, in series_order (visitors only get published rows). Empty when the project has no series. */
export async function seriesSiblings(p: Project, owner = false): Promise<Project[]> {
  if (!p.series) return [];
  const { data, error } = await (owner ? adminDb() : publicDb())
    .from("projects").select(SELECT).eq("series", p.series)
    .order("series_order", { ascending: true, nullsFirst: false })
    .order("year", { ascending: true, nullsFirst: false });
  if (error) console.error(error);
  return shape((data ?? []) as Project[], owner);
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

/** URL of a series' overview page (prototype C): /projects/series/<slugified series name>. No schema change. */
export function seriesHref(series: string) {
  return `/projects/series/${slugify(series)}`;
}

/** Every visible page of the series whose slugified name is `slug`, in series_order; [] when there is no such series. */
export async function seriesByHubSlug(slug: string, owner = false): Promise<Project[]> {
  const { data, error } = await (owner ? adminDb() : publicDb())
    .from("projects").select(SELECT).not("series", "is", null)
    .order("series_order", { ascending: true, nullsFirst: false })
    .order("year", { ascending: true, nullsFirst: false });
  if (error) console.error(error);
  return shape(((data ?? []) as Project[]).filter((p) => p.series && slugify(p.series) === slug), owner);
}
