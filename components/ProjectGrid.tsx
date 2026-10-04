import Link from "next/link";
import ProjectCard from "./ProjectCard";
import { CATEGORIES, CATEGORY_LABEL, type Project } from "@/lib/types";

/** Grid with skill + category filter chips driven by ?skill= and ?cat= (no client state). */
export default function ProjectGrid({
  projects, base, skill, cat,
}: { projects: Project[]; base: string; skill?: string; cat?: string }) {
  const skills = [...new Set(projects.flatMap((p) => p.skills))].sort();
  const cats = CATEGORIES.filter((c) => projects.some((p) => p.category === c));
  const shown = projects.filter(
    (p) => (!skill || p.skills.includes(skill)) && (!cat || p.category === cat),
  );
  const href = (next: { skill?: string; cat?: string }) => {
    const q = new URLSearchParams();
    if (next.skill) q.set("skill", next.skill);
    if (next.cat) q.set("cat", next.cat);
    const s = q.toString();
    return s ? `${base}?${s}` : base;
  };
  return (
    <>
      {cats.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-2">
          <Link href={href({ skill })} className={`chip ${!cat ? "chip-on" : ""}`}>All</Link>
          {cats.map((c) => (
            <Link key={c} href={href({ skill, cat: c === cat ? undefined : c })} className={`chip ${c === cat ? "chip-on" : ""}`}>
              {CATEGORY_LABEL[c]}
            </Link>
          ))}
        </div>
      )}
      {skills.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-1.5">
          <span className="mr-1 text-xs uppercase tracking-wide text-neutral-500">Skills</span>
          {skills.map((s) => (
            <Link key={s} href={href({ cat, skill: s === skill ? undefined : s })} className={`chip ${s === skill ? "chip-on" : ""}`}>
              {s}
            </Link>
          ))}
        </div>
      )}
      {shown.length === 0 ? (
        <p className="text-neutral-500">Nothing here yet.</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => <ProjectCard key={p.id} p={p} />)}
        </div>
      )}
    </>
  );
}
