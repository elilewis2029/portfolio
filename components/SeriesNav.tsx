import Link from "next/link";
import type { Project } from "@/lib/types";

/** "Part 2 of 3 · Series name" plus a chip per sibling page. Rendered only when a series has 2+ visible pages. */
export default function SeriesNav({ current, siblings }: { current: Project; siblings: Project[] }) {
  const i = siblings.findIndex((s) => s.id === current.id);
  return (
    <nav aria-label="Series" className="no-print mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
      <span className="text-neutral-500">
        Part {i + 1} of {siblings.length} · {current.series}
      </span>
      <ul className="flex flex-wrap gap-1.5">
        {siblings.map((s, n) => (
          <li key={s.id}>
            {s.id === current.id ? (
              <span className="chip chip-on" aria-current="page">{n + 1}. {s.title}</span>
            ) : (
              <Link href={`/work/${s.slug}`} className="chip">{n + 1}. {s.title}{s.status === "draft" ? " (draft)" : ""}</Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
