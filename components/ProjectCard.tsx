import Image from "next/image";
import Link from "next/link";
import { heroOf, type Project } from "@/lib/types";
import { seriesHref } from "@/lib/projects";

export type SeriesCard = { name: string; members: Project[] };

export default function ProjectCard({
  p, priority = false, banner = false, series,
}: { p: Project; priority?: boolean; banner?: boolean; series?: SeriesCard }) {
  if (series) return <SeriesTile series={series} />;
  const hero = heroOf(p);
  const draft = p.status === "draft";
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
        {draft && <DraftBadge />}
      </div>
      <h3 className={`mt-3 font-semibold leading-snug group-hover:text-accent ${banner ? "text-xl sm:text-2xl" : "text-base sm:text-lg"}`}>{p.title}</h3>
      {p.tagline && <p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">{p.tagline}</p>}
      {p.skills.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {p.skills.slice(0, 3).map((s) => <span key={s} className="chip">{s}</span>)}
        </div>
      )}
    </Link>
  );
}

function DraftBadge() {
  return <span className="absolute left-2 top-2 z-10 rounded-md bg-yellow-400 px-2 py-0.5 text-xs font-semibold text-neutral-900 shadow">Draft</span>;
}

/**
 * A series on /work: one tile that reads as a small stack of cards. The photo cycles through every part's
 * hero (CSS keyframes in globals.css, `.series-flip`; still under prefers-reduced-motion, where only the
 * first photo shows), and a strip of numbered thumbnails names the parts, so the other items are visible
 * without opening anything. Links to the series overview.
 */
function SeriesTile({ series }: { series: SeriesCard }) {
  const members = series.members;
  const heroes = members.map((m) => ({ m, hero: heroOf(m) }));
  const anyDraft = members.some((m) => m.status === "draft");
  const skills = [...new Set(members.flatMap((m) => m.skills))].slice(0, 3);
  return (
    <Link href={seriesHref(series.name)} className="group block min-w-0">
      {/* The stack: two offset edges behind the tile */}
      <div className="relative pt-2 pr-2">
        <span aria-hidden="true" className="absolute inset-0 translate-x-2 -translate-y-2 rounded-2xl bg-neutral-200/80 ring-1 ring-neutral-900/5 dark:bg-neutral-800 dark:ring-white/10" />
        <span aria-hidden="true" className="absolute inset-0 translate-x-1 -translate-y-1 rounded-2xl bg-neutral-100 ring-1 ring-neutral-900/5 dark:bg-neutral-900 dark:ring-white/10" />
        <div className="series-flip zoom relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-neutral-900/5 dark:bg-neutral-900 dark:ring-white/10" data-n={Math.min(members.length, 4)}>
          {heroes.map(({ m, hero }, i) =>
            hero ? (
              <Image
                key={m.id}
                src={hero.path}
                alt={i === 0 ? `${series.name}: ${hero.caption || m.title}` : ""}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div key={m.id} className="absolute inset-0 flex items-center justify-center text-sm text-neutral-400">No photo yet</div>
            ),
          )}
          <span className="on-accent absolute right-2 top-2 z-10 rounded-md bg-accent px-2 py-0.5 text-xs font-semibold text-white shadow">
            {members.length} parts
          </span>
          {anyDraft && <DraftBadge />}
        </div>
      </div>
      <h3 className="mt-3 text-base font-semibold leading-snug group-hover:text-accent sm:text-lg">{series.name}</h3>
      {/* The parts, by number, with a thumbnail each */}
      <ol className="mt-2 space-y-1.5">
        {heroes.map(({ m, hero }, i) => (
          <li key={m.id} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <span className="relative h-9 w-12 shrink-0 overflow-hidden rounded bg-neutral-200 dark:bg-neutral-800">
              {hero && <Image src={hero.path} alt="" fill sizes="48px" className="object-cover" />}
            </span>
            <span className="min-w-0 truncate"><span className="font-medium text-neutral-800 dark:text-neutral-200">{i + 1}.</span> {m.title}{m.status === "draft" ? " (draft)" : ""}</span>
          </li>
        ))}
      </ol>
      {skills.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {skills.map((s) => <span key={s} className="chip">{s}</span>)}
        </div>
      )}
    </Link>
  );
}
