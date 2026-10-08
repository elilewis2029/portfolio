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
 * A series on /work, drawn like an album cover: a static mosaic of the parts' photos (the lead part large,
 * the others in a column beside it), a stacked-squares badge with the part count, and the same
 * text grammar as every other card (title, one line, chips) so the grid still scans evenly. No motion:
 * auto-cycling photos can't be skimmed and need a pause control (WCAG 2.2.2). Links to the series overview.
 */
function SeriesTile({ series }: { series: SeriesCard }) {
  const members = series.members;
  const heroes = members.map((m) => ({ m, hero: heroOf(m) }));
  const [lead, ...rest] = heroes;
  const shown = rest.slice(0, 2);
  const extra = rest.length - shown.length;
  const anyDraft = members.some((m) => m.status === "draft");
  const skills = [...new Set(members.flatMap((m) => m.skills))].slice(0, 3);
  // Each cell carries its own hover zoom, so only the part under the pointer moves: the parts read as separate things.
  const cell = "zoom relative overflow-hidden bg-neutral-200 dark:bg-neutral-800";
  return (
    <Link href={seriesHref(series.name)} className="group block min-w-0">
      <div className="relative grid aspect-[4/3] grid-cols-3 grid-rows-2 gap-0.5 overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-neutral-900/5 dark:bg-neutral-900 dark:ring-white/10">
        <div className={`${cell} col-span-2 row-span-2`}>
          {lead.hero ? (
            <Image src={lead.hero.path} alt={`${series.name}: ${lead.hero.caption || lead.m.title}`} fill sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 66vw" className="object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-sm text-neutral-400">No photo yet</span>
          )}
        </div>
        {shown.map(({ m, hero }, i) => (
          <div key={m.id} className={`${cell} ${shown.length === 1 ? "row-span-2" : ""}`}>
            {hero && <Image src={hero.path} alt="" fill sizes="(min-width: 1024px) 11vw, (min-width: 640px) 17vw, 33vw" className="object-cover" />}
            {i === shown.length - 1 && extra > 0 && (
              <span className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 text-lg font-semibold text-white">+{extra}</span>
            )}
          </div>
        ))}
        {/* Count badge with the stacked-squares glyph (the multi-item marker people know from photo apps) */}
        <span className="absolute bottom-2 right-2 z-10 inline-flex items-center gap-1 rounded-md bg-white/90 px-2 py-0.5 text-xs font-semibold text-neutral-900 shadow dark:bg-neutral-950/85 dark:text-neutral-100">
          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="1.5" y="4.5" width="10" height="10" rx="1.5" />
            <path d="M5 4.5V3a1.5 1.5 0 0 1 1.5-1.5H13A1.5 1.5 0 0 1 14.5 3v6.5A1.5 1.5 0 0 1 13 11h-1.5" />
          </svg>
          {members.length} parts
        </span>
        {anyDraft && <DraftBadge />}
      </div>
      <h3 className="mt-3 text-base font-semibold leading-snug group-hover:text-accent sm:text-lg">{series.name}</h3>
      {/* One line per part, truncated: two parts take the same two lines a tagline does on the other cards */}
      <ol className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        {members.slice(0, 3).map((m, i) => (
          <li key={m.id} className="truncate">{i + 1}. {m.title}{m.status === "draft" ? " (draft)" : ""}</li>
        ))}
        {members.length > 3 && <li>and {members.length - 3} more</li>}
      </ol>
      {skills.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {skills.map((s) => <span key={s} className="chip">{s}</span>)}
        </div>
      )}
    </Link>
  );
}
