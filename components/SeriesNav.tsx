import Link from "next/link";
import { seriesHref } from "@/lib/projects";
import type { Project } from "@/lib/types";

/** Prototype C, top of a part page: breadcrumb back to the series overview, with the part number. */
export function SeriesCrumb({ current, siblings }: { current: Project; siblings: Project[] }) {
  const i = siblings.findIndex((s) => s.id === current.id);
  return (
    <nav aria-label="Breadcrumb" className="no-print mb-3 flex flex-wrap items-center gap-x-2 text-sm">
      <Link href="/projects" className="inline-flex min-h-11 items-center text-neutral-600 hover:text-accent dark:text-neutral-400">Projects</Link>
      <span aria-hidden="true" className="text-neutral-400">/</span>
      <Link href={seriesHref(current.series!)} className="inline-flex min-h-11 items-center text-neutral-600 hover:text-accent dark:text-neutral-400">{current.series}</Link>
      <span aria-hidden="true" className="text-neutral-400">/</span>
      <span className="text-neutral-500">Part {i + 1} of {siblings.length}</span>
    </nav>
  );
}

/** Prototype C, end of a part page: previous / next part and a link to the overview. */
export function SeriesPager({ current, siblings }: { current: Project; siblings: Project[] }) {
  const i = siblings.findIndex((s) => s.id === current.id);
  const prev = i > 0 ? siblings[i - 1] : null;
  const next = i < siblings.length - 1 ? siblings[i + 1] : null;
  const item = (p: Project, n: number, dir: "prev" | "next") => (
    <Link href={`/projects/${p.slug}`} className={`group flex min-h-11 flex-col rounded-lg border border-neutral-200 p-3 hover:border-accent dark:border-neutral-800 ${dir === "next" ? "sm:text-right" : ""}`}>
      <span className="text-xs uppercase tracking-wide text-neutral-500">{dir === "prev" ? "← Previous" : "Next →"} · part {n}</span>
      <span className="mt-0.5 font-medium group-hover:text-accent">{p.title}{p.status === "draft" ? " (draft)" : ""}</span>
    </Link>
  );
  return (
    <nav aria-label="Series pages" className="no-print mt-10 border-t border-neutral-200 pt-6 dark:border-neutral-800">
      <p className="mb-3 text-sm text-neutral-500">
        Part {i + 1} of {siblings.length} of <Link href={seriesHref(current.series!)} className="text-accent hover:underline">{current.series}</Link>
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>{prev && item(prev, i, "prev")}</div>
        <div>{next && item(next, i + 2, "next")}</div>
      </div>
    </nav>
  );
}
