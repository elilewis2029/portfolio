import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { CATEGORIES, MEDIA_KINDS, type Category, type MediaKind } from "./types";

export const INTAKE_MODEL = "claude-sonnet-4-6";

export type Taps = { roleKind: "solo" | "team" | null; metric: string; change: string };

export type IntakeResult = {
  action: "new" | "append";
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  role_kind: "solo" | "team" | null;
  role: string | null;
  goal_constraints: string | null;
  process_md: string | null;
  result_metric: string | null;
  lesson: string | null;
  category: Category;
  tools: string[];
  skills: string[];
  audience: string[];
  year: number | null;
  duration: string | null;
  media: { kind: MediaKind | null; caption: string }[];
};

let systemPrompt: string | null = null;
async function loadPrompt() {
  systemPrompt ??= await fs.readFile(path.join(process.cwd(), "prompts/intake.md"), "utf8");
  return systemPrompt;
}

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
const tags = (v: unknown) =>
  Array.isArray(v)
    ? [...new Set(v.filter((x) => typeof x === "string").map((x) => x.toLowerCase().trim().replace(/[\s_]+/g, "-")).filter(Boolean))].slice(0, 6)
    : [];

/** Replace measurements (number + unit) not found in the source with [TODO]. */
const MEASURE = /[±+-]?\d+(?:\.\d+)?\s?(?:in(?:ch(?:es)?)?\b|"|mm\b|µm|um\b|thou\b|%|min(?:utes)?\b|h(?:rs?|ours?)\b|sec(?:onds)?\b|days?\b|weeks?\b|months?\b|lbs?\b|kg\b|g\b|\$)/gi;
function scrubMeasures(text: string, source: string) {
  const src = source.replace(/,/g, "");
  return text.replace(MEASURE, (m) => {
    const n = m.match(/\d+(?:\.\d+)?/)![0];
    return src.includes(n) ? m : "[TODO]";
  });
}

const scrubOpt = (t: string | null, source: string) => (t ? scrubMeasures(t, source) : null);

/** Every number in `value` must appear in the source text; otherwise it was invented. */
function grounded(value: string | null, source: string): string | null {
  if (!value) return null;
  const nums = value.match(/\d+(?:\.\d+)?/g) ?? [];
  const src = source.replace(/,/g, "");
  return nums.every((n) => src.includes(n)) ? value : null;
}

export async function runIntake(input: {
  note: string;
  taps: Taps;
  images: string[]; // base64 jpeg, in order
  projects: { slug: string; title: string }[];
}): Promise<IntakeResult> {
  const client = new Anthropic();
  const { note, taps, images, projects } = input;

  const answers = [
    `Role: ${taps.roleKind ?? "(not answered)"}`,
    `Number to brag about: ${taps.metric || "(not answered)"}`,
    `What I'd change: ${taps.change || "(not answered)"}`,
  ].join("\n");

  const content: Anthropic.ContentBlockParam[] = [];
  images.forEach((data, i) => {
    content.push({ type: "text", text: `Photo ${i + 1}:` });
    content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data } });
  });
  content.push({
    type: "text",
    text: `Note: ${note || "(no note)"}\n\nPrompt answers:\n${answers}\n\nExisting projects:\n${JSON.stringify(projects)}\n\nThere are ${images.length} photos; return exactly ${images.length} media objects.`,
  });

  const msg = await client.messages.create({
    model: INTAKE_MODEL,
    max_tokens: 2000,
    system: await loadPrompt(),
    messages: [{ role: "user", content }],
  });
  const text = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(json);
  } catch {
    throw new Error(`Model did not return JSON: ${text.slice(0, 200)}`);
  }

  // Normalize and enforce "never invent facts" (CLAUDE.md rule 6).
  const source = `${note}\n${taps.metric}\n${taps.change}`;
  const rawMedia = Array.isArray(raw.media) ? (raw.media as Record<string, unknown>[]) : [];
  const media = images.map((_, i) => {
    const m = rawMedia[i] ?? {};
    const kind = MEDIA_KINDS.includes(m.kind as MediaKind) ? (m.kind as MediaKind) : null;
    return { kind, caption: str(m.caption) ?? "" };
  });
  // Exactly one hero; never overwrite a process/cad/drawing tag to get one (heroOf falls back to photo 1).
  const heroes = media.filter((m) => m.kind === "hero");
  heroes.slice(1).forEach((m) => (m.kind = "after"));
  if (!heroes.length) {
    const pick = media.find((m) => m.kind === null || m.kind === "after");
    if (pick) pick.kind = "hero";
  }

  const category = CATEGORIES.includes(raw.category as Category) ? (raw.category as Category) : "engineering";
  const yearRaw = typeof raw.year === "number" ? raw.year : null;
  const roleKindRaw = raw.role_kind === "solo" || raw.role_kind === "team" ? raw.role_kind : null;
  const projectSlugs = new Set(projects.map((p) => p.slug));
  const slug = str(raw.slug) ?? "";
  const action = raw.action === "append" && projectSlugs.has(slug) ? "append" : "new";

  return {
    action,
    slug,
    title: scrubMeasures(str(raw.title) ?? "[TODO: title]", source),
    tagline: scrubMeasures(str(raw.tagline) ?? "", source),
    summary: scrubMeasures(str(raw.summary) ?? "", source),
    role_kind: taps.roleKind ?? roleKindRaw,
    role: str(raw.role),
    goal_constraints: scrubOpt(str(raw.goal_constraints), source),
    process_md: scrubOpt(str(raw.process_md), source),
    result_metric: grounded(str(raw.result_metric), source) ?? (taps.metric.trim() || null),
    lesson: str(raw.lesson) ?? (taps.change.trim() || null),
    category,
    tools: tags(raw.tools),
    skills: tags(raw.skills),
    audience: tags(raw.audience).filter((a) => ["pd", "mech", "mfg"].includes(a)),
    year: yearRaw && note.includes(String(yearRaw)) ? yearRaw : null,
    duration: grounded(str(raw.duration), source),
    media,
  };
}
