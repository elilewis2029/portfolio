export const CATEGORIES = ["engineering", "manufacturing-shop", "electronics", "design-craft"] as const;
export type Category = (typeof CATEGORIES)[number];

export const MEDIA_KINDS = ["hero", "process", "cad", "drawing", "test", "before", "after", "failure"] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

export const PROCESS_KINDS: MediaKind[] = ["process", "cad", "drawing", "test"];
export const READY_KINDS: MediaKind[] = ["process", "cad", "drawing"];

export const CATEGORY_LABEL: Record<Category, string> = {
  engineering: "Engineering",
  "manufacturing-shop": "Manufacturing & shop",
  electronics: "Electronics",
  "design-craft": "Design & craft",
};

/**
 * Strengths: what a project shows Eli is good at, not what it is made of. Up to two per project, the first is the
 * main one and sets the project's colour. Teaching & communication is kept strict: direct teaching roles, or work
 * that rested on presenting it (docs/DECISIONS.md 40).
 */
export const STRENGTHS = ["systems", "product", "fabrication", "teaching"] as const;
export type Strength = (typeof STRENGTHS)[number];

export const STRENGTH_LABEL: Record<Strength, string> = {
  systems: "System design",
  product: "Product design",
  fabrication: "Building & fabrication",
  teaching: "Teaching & communication",
};

export const STRENGTH_COLOR: Record<Strength, string> = {
  systems: "var(--color-s-systems)",
  product: "var(--color-s-product)",
  fabrication: "var(--color-s-fabrication)",
  teaching: "var(--color-s-teaching)",
};

export function strengthsOf(p: { strengths?: string[] | null }): Strength[] {
  return (p.strengths ?? []).filter((s): s is Strength => (STRENGTHS as readonly string[]).includes(s)).slice(0, 2);
}

/** The project's colour: its main strength's accent, ink when it has none. */
export function strengthColor(s: string | null | undefined): string {
  return (s && STRENGTH_COLOR[s as Strength]) || "var(--color-ink)";
}
export const projectColor = (p: { strengths?: string[] | null }) => strengthColor(strengthsOf(p)[0]);

/**
 * Background for a project's colour bar, split into equal hard-edged bands, one per strength, in order (main first),
 * so a project tagged with two strengths shows both colours. One strength is a plain colour; none is ink.
 * `dir` follows the bar: "to right" for the horizontal bar under card photos, "to bottom" for the vertical one on featured rows.
 */
export function strengthBar(list: readonly string[], dir: "to right" | "to bottom" = "to right"): string {
  const colors = [...new Set(list)].map(strengthColor);
  if (colors.length <= 1) return colors[0] ?? strengthColor(null);
  const step = 100 / colors.length;
  return `linear-gradient(${dir}, ${colors.map((c, i) => `${c} ${+(i * step).toFixed(3)}% ${+((i + 1) * step).toFixed(3)}%`).join(", ")})`;
}
export const projectBar = (p: { strengths?: string[] | null }, dir?: "to right" | "to bottom") => strengthBar(strengthsOf(p), dir);

export type Media = {
  id: string;
  project_id: string;
  path: string;
  original_path: string | null;
  caption: string | null;
  sort: number;
  kind: MediaKind | null;
  taken_at: string | null;
  width: number | null;
  height: number | null;
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  summary: string | null;
  body_md: string | null;
  category: Category;
  strengths: Strength[];
  year: number | null;
  status: "draft" | "published";
  era: "current" | "archive";
  featured: boolean;
  cover_media: string | null;
  role: string | null;
  role_kind: "solo" | "team" | null;
  goal_constraints: string | null;
  process_md: string | null;
  result_metric: string | null;
  lesson: string | null;
  duration: string | null;
  tools: string[];
  skills: string[];
  audience: string[];
  links: Record<string, string>;
  /** Pages with the same series collapse into one card on /projects and link to each other. */
  series: string | null;
  series_order: number | null;
  needs_drafting: boolean;
  intake_note: string | null;
  intake_taps: { roleKind: "solo" | "team" | null; metric: string; change: string } | null;
  created_at: string;
  updated_at: string;
  media?: Media[];
};

/** Hero = the cover_media row, else the media of kind hero, else the first photo. */
export function heroOf(p: Project): Media | undefined {
  const m = [...(p.media ?? [])].sort((a, b) => a.sort - b.sort);
  return m.find((x) => x.id === p.cover_media) ?? m.find((x) => x.kind === "hero") ?? m[0];
}

export function isFeatureReady(p: Project): boolean {
  return (p.media ?? []).some((m) => m.kind && READY_KINDS.includes(m.kind));
}
