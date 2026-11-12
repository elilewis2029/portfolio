import Image from "next/image";
import Link from "next/link";
import { CATEGORY_LABEL, categoryColor, heroOf, type Category, type Project } from "@/lib/types";

/**
 * Selected work on the home page: a dark band, every project given the same row (same photo size,
 * same text slots, same number style), so none outranks another. Rows alternate photo left / right. Deliberately unlike the light
 * /projects grid: rows, an index number and the outcome line read as a curated set, not a catalogue.
 */
export default function FeaturedList({ projects }: { projects: Project[] }) {
  return (
    <ol className="divide-y divide-white/15 border-y border-white/15">
      {projects.map((p, i) => (
        <li key={p.id}>
          <FeaturedRow p={p} n={i + 1} priority={i < 2} />
        </li>
      ))}
    </ol>
  );
}

function FeaturedRow({ p, n, priority }: { p: Project; n: number; priority: boolean }) {
  const hero = heroOf(p);
  const color = categoryColor(p.category);
  const cat = p.category ? CATEGORY_LABEL[p.category as Category] ?? p.category : null;
  const flip = n % 2 === 0; // even rows put the photo on the right, so the list alternates
  const meta = [cat, p.year, p.role_kind === "team" ? "Team" : p.role_kind === "solo" ? "Solo" : null].filter(Boolean).join(" · ");
  return (
    <Link href={`/projects/${p.slug}`} className="group grid gap-5 py-8 sm:grid-cols-12 sm:gap-8 sm:py-10">
      <div className={`zoom relative aspect-[3/2] overflow-hidden bg-neutral-800 sm:col-span-7 ${flip ? "sm:order-2" : ""}`}>
        {hero ? (
          <Image
            src={hero.path}
            alt={hero.caption || p.title}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 700px, (min-width: 640px) 58vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="label flex h-full items-center justify-center text-neutral-500">No photo yet</div>
        )}
        <span aria-hidden="true" className={`absolute inset-y-0 left-0 z-10 w-1.5 ${flip ? "sm:left-auto sm:right-0" : ""}`} style={{ background: color }} />
      </div>
      <div className={`flex flex-col sm:col-span-5 sm:py-1 ${flip ? "sm:order-1" : ""}`}>
        <div className="flex items-baseline gap-4">
          <span className="font-mono text-sm text-neutral-500">{String(n).padStart(2, "0")}</span>
          <p className="label flex items-center gap-2 text-neutral-400">
            <span className="swatch" style={{ background: color }} aria-hidden="true" />
            {meta}
          </p>
        </div>
        <h3 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.02em] text-white sm:text-[28px]">{p.title}</h3>
        {p.tagline && <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-neutral-300">{p.tagline}</p>}
        {p.result_metric && (
          <p className="mt-5 border-l-2 pl-3 text-[15px] text-white" style={{ borderColor: color }}>
            <span className="label block text-neutral-500">Result</span>
            {p.result_metric}
          </p>
        )}
        <span className="label mt-6 inline-flex items-center gap-2 text-white sm:mt-auto sm:pt-6">
          View project
          <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none">→</span>
        </span>
      </div>
    </Link>
  );
}
