import Link from "next/link";
import type { Project } from "@/lib/types";

/**
 * Prototype B. On the lead page of a series every part is folded in as a section; this bar lists them as
 * anchor links and stays under the site header while you scroll. Each part also keeps its own URL.
 */
export default function SeriesTabs({ series, siblings }: { series: string; siblings: Project[] }) {
  return (
    <nav aria-label="Parts of this project" className="no-print sticky top-[57px] z-20 -mx-4 mb-6 border-b border-neutral-200 bg-white/90 px-4 py-2 backdrop-blur sm:mx-0 sm:rounded-lg sm:border dark:border-neutral-800 dark:bg-neutral-950/90">
      <p className="text-xs uppercase tracking-wide text-neutral-500">{series} · {siblings.length} parts on this page</p>
      <ol className="mt-1 flex gap-2 overflow-x-auto">
        {siblings.map((s, n) => (
          <li key={s.id} className="shrink-0">
            <a href={`#part-${n + 1}`} className="chip inline-flex min-h-9 items-center py-1">
              <span className="mr-1 font-semibold">{n + 1}.</span> {s.title.length > 40 ? s.title.slice(0, 38) + "…" : s.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
