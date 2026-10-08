import Image from "next/image";
import Link from "next/link";
import { heroOf, type Project } from "@/lib/types";

export type SeriesCard = { name: string; members: Project[] };

export default function ProjectCard({
  p, priority = false, banner = false, series,
}: { p: Project; priority?: boolean; banner?: boolean; series?: SeriesCard }) {
  const hero = heroOf(p);
  const draft = p.status === "draft";
  const title = series ? series.name : p.title;
  const tagline = series ? series.members.map((m) => m.title).join(" · ") : p.tagline;
  return (
    <Link href={`/work/${p.slug}`} className={`group block ${banner ? "sm:col-span-2 lg:col-span-3" : ""}`}>
      <div className={`zoom relative overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-neutral-900/5 dark:bg-neutral-900 dark:ring-white/10 ${banner ? "aspect-[4/3] sm:aspect-[21/9]" : "aspect-[4/3]"}`}>
        {hero ? (
          <Image
            src={hero.path}
            alt={hero.caption || p.title}
            fill
            priority={priority}
            sizes={banner ? "(min-width: 1152px) 1152px, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400">No photo yet</div>
        )}
        {draft && (
          <span className="absolute left-2 top-2 rounded-md bg-yellow-400 px-2 py-0.5 text-xs font-semibold text-neutral-900 shadow">
            Draft
          </span>
        )}
      </div>
      <h3 className={`mt-3 font-semibold leading-snug group-hover:text-accent ${banner ? "text-xl sm:text-2xl" : "text-base sm:text-lg"}`}>{title}</h3>
      {tagline && <p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">{tagline}</p>}
      {(series || p.skills.length > 0) && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {series && <span className="chip chip-on">{series.members.length} parts</span>}
          {p.skills.slice(0, series ? 2 : 3).map((s) => (
            <span key={s} className="chip">{s}</span>
          ))}
        </div>
      )}
    </Link>
  );
}
