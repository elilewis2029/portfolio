import Link from "next/link";
import ProjectCard from "./ProjectCard";
import { CATEGORIES, CATEGORY_LABEL, categoryColor, type Project } from "@/lib/types";
import type { SeriesCard } from "./ProjectCard";

/** Grid with skill + category filter chips driven by ?skill= and ?cat= (no client state). */
export default function ProjectGrid({
  projects, base, skill, cat,
}: { projects: Project[]; base: string; skill?: string; cat?: string }) {
  const skills = [...new Set(projects.flatMap((p) => p.skills))].sort();
  const cats = CATEGORIES.filter((c) => projects.some((p) => p.category === c));
  const shown = projects.filter(
    (p) => (!skill || p.skills.includes(skill)) && (!cat || p.category === cat),
  );
  // Pages that share a series collapse into one card (the lead = lowest series_order among those shown).
  const seen = new Set<string>();
  const items = shown.flatMap((p): { p: Project; series?: SeriesCard }[] => {
    if (!p.series) return [{ p }];
    if (seen.has(p.series)) return [];
    seen.add(p.series);
    const members = shown
      .filter((x) => x.series === p.series)
      .sort((a, b) => (a.series_order ?? 99) - (b.series_order ?? 99));
    return members.length > 1 ? [{ p: members[0], series: { name: p.series, members } }] : [{ p: members[0] }];
  });
  const href = (next: { skill?: string; cat?: string }) => {
    const q = new URLSearchParams();
    if (next.skill) q.set("skill", next.skill);
    if (next.cat) q.set("cat", next.cat);
    const s = q.toString();
    return s ? `${base}?${s}` : base;
  };
  // Filter chips are links; py-1.5 + gap-2 gives them a tappable height on phones (they were 22 px tall).
  const chip = (on: boolean) => `chip py-1.5 ${on ? "chip-on" : ""}`;
  const skillChip = (on: boolean) => `chip border-transparent px-1.5 py-1 normal-case tracking-normal ${on ? "chip-on" : "text-neutral-500"}`;
  const filtered = !!(skill || cat);
  return (
    <>
      {cats.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-2">
          <Link href={href({ skill })} className={chip(!cat)} aria-current={!cat ? "true" : undefined}>All · {projects.length}</Link>
          {cats.map((c) => (
            <Link key={c} href={href({ skill, cat: c === cat ? undefined : c })} className={chip(c === cat)} aria-current={c === cat ? "true" : undefined}>
              <span className="swatch" style={{ background: categoryColor(c) }} aria-hidden="true" />
              {CATEGORY_LABEL[c]} · {projects.filter((p) => p.category === c).length}
            </Link>
          ))}
        </div>
      )}
      {skills.length > 0 && (
        // Skills sit behind a disclosure: 40 tags in the open read as noise. It opens itself when a skill is active.
        <details className="group/sk mb-4" open={!!skill}>
          <summary className="label inline-flex min-h-11 cursor-pointer list-none items-center gap-2 text-neutral-600 hover:text-ink [&::-webkit-details-marker]:hidden">
            <span aria-hidden="true" className="inline-block transition-transform group-open/sk:rotate-90">▸</span>
            Filter by skill · {skills.length}{skill ? ` · ${skill}` : ""}
          </summary>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {skills.map((s) => (
            <Link key={s} href={href({ cat, skill: s === skill ? undefined : s })} className={skillChip(s === skill)} aria-current={s === skill ? "true" : undefined}>
              {s}
            </Link>
          ))}
        </div>
        </details>
      )}
      {/* What the filter did, and one tap to undo it (the active chip also toggles off, but that is easy to miss). */}
      {filtered && (
        <p className="label mb-6 flex flex-wrap items-center gap-x-4 text-neutral-600" role="status">
          <span>
            {items.length} {items.length === 1 ? "project" : "projects"}
            {cat ? ` in ${CATEGORY_LABEL[cat as keyof typeof CATEGORY_LABEL] ?? cat}` : ""}{skill ? ` tagged ${skill}` : ""}
          </span>
          <Link href={base} className="inline-flex min-h-11 items-center text-ink underline">Clear filters ×</Link>
        </p>
      )}
      {!filtered && skills.length > 0 && <div className="mb-4" />}
      {shown.length === 0 ? (
        <p className="text-neutral-500">
          {filtered ? "No projects match this filter." : "Nothing here yet."}
        </p>
      ) : (
        <div className="grid gap-x-6 gap-y-12 border-t border-rule pt-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ p, series }) => <ProjectCard key={p.id} p={p} series={series} />)}
        </div>
      )}
    </>
  );
}
