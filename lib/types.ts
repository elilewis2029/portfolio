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
