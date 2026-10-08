import Image from "next/image";
import Link from "next/link";
import { heroOf, type Project } from "@/lib/types";

/**
 * Prototype A. A series (pages sharing `series`) is shown on every member page as an "In this project"
 * card strip right under the title, and as a previous / next pager at the end. Rendered only when 2+ pages
 * are visible to this reader, so a series with one published page looks like a plain project.
 */
export function SeriesMembers({ current, siblings }: { current: Project; siblings: Project[] }) {
  const i = siblings.findIndex((s) => s.id === current.id);
  return (
    <section aria-labelledby="series-members" className="no-print mb-8 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 id="series-members" className="text-sm font-semibold uppercase tracking-wide text-neutral-500">In this project</h2>
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{current.series} · {siblings.length} parts · you are on part {i + 1}</span>
      </div>
      <ol className="grid gap-3 sm:grid-cols-2">
        {siblings.map((s, n) => <MemberCard key={s.id} p={s} n={n + 1} current={s.id === current.id} />)}
      </ol>
    </section>
  );
}

function MemberCard({ p, n, current }: { p: Project; n: number; current: boolean }) {
  const hero = heroOf(p);
  const body = (
    <>
      <span className="relative block aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-200 dark:bg-neutral-800">
        {hero && <Image src={hero.path} alt="" fill sizes="96px" className="object-cover" />}
      </span>
      <span className="min-w-0">
        <span className="block text-xs uppercase tracking-wide text-neutral-500">
          Part {n}{current ? " · this page" : ""}{p.status === "draft" ? " · draft" : ""}
        </span>
        <span className={`mt-0.5 block font-semibold leading-snug ${current ? "" : "group-hover:text-accent"}`}>{p.title}</span>
        {(p.result_metric || p.tagline) && (
          <span className="mt-1 line-clamp-2 block text-sm text-neutral-600 dark:text-neutral-400">{p.result_metric ?? p.tagline}</span>
        )}
      </span>
    </>
  );
  const cls = "flex min-h-11 gap-3 rounded-lg bg-white p-2 ring-1 dark:bg-neutral-950";
  return (
    <li>
      {current ? (
        <div aria-current="page" className={`${cls} ring-2 ring-accent`}>{body}</div>
      ) : (
        <Link href={`/work/${p.slug}`} className={`group ${cls} ring-neutral-200 hover:ring-accent dark:ring-neutral-800`}>{body}</Link>
      )}
    </li>
  );
}

/** Previous / next page of the series, at the end of the article. */
export function SeriesPager({ current, siblings }: { current: Project; siblings: Project[] }) {
  const i = siblings.findIndex((s) => s.id === current.id);
  const prev = i > 0 ? siblings[i - 1] : null;
  const next = i < siblings.length - 1 ? siblings[i + 1] : null;
  const item = (p: Project, n: number, dir: "prev" | "next") => (
    <Link href={`/work/${p.slug}`} className={`group flex min-h-11 flex-col rounded-lg border border-neutral-200 p-3 hover:border-accent dark:border-neutral-800 ${dir === "next" ? "sm:text-right" : ""}`}>
      <span className="text-xs uppercase tracking-wide text-neutral-500">{dir === "prev" ? "← Previous" : "Next →"} · part {n}</span>
      <span className="mt-0.5 font-medium group-hover:text-accent">{p.title}</span>
    </Link>
  );
  return (
    <nav aria-label="Series pages" className="no-print mt-10 grid gap-3 border-t border-neutral-200 pt-6 sm:grid-cols-2 dark:border-neutral-800">
      <div>{prev && item(prev, i, "prev")}</div>
      <div>{next && item(next, i + 2, "next")}</div>
    </nav>
  );
}
