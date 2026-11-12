import Image from "next/image";
import Link from "next/link";
import CategoryTag from "./CategoryTag";
import { categoryColor, heroOf, type Project } from "@/lib/types";
import { seriesHref } from "@/lib/projects";

export type SeriesCard = { name: string; members: Project[] };

/**
 * Gallery tile on /projects: photo, a colour bar in the discipline's accent that runs out on hover,
 * then the mono category line, the title and two lines of tagline. Square corners, no chips:
 * the filters above the grid carry the skills, the card carries the work.
 */
export default function ProjectCard({ p, priority = false, series }: { p: Project; priority?: boolean; series?: SeriesCard }) {
  if (series) return <SeriesTile series={series} />;
  const hero = heroOf(p);
  const draft = p.status === "draft";
  return (
    <Link href={`/projects/${p.slug}`} className="group block min-w-0">
      <div className="zoom relative aspect-[4/3] overflow-hidden bg-wash">
        {hero ? (
          <Image
            src={hero.path}
            alt={hero.caption || p.title}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="label flex h-full items-center justify-center text-neutral-400">No photo yet</div>
        )}
        {draft && <DraftBadge />}
        <AccentBar category={p.category} />
      </div>
      <CategoryTag category={p.category} extra={[p.year]} className="mt-3" />
      <h3 className="mt-1.5 text-[17px] font-semibold leading-snug tracking-[-0.01em] group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">{p.title}</h3>
      {p.tagline && <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{p.tagline}</p>}
    </Link>
  );
}

/** Hairline in the category colour along the photo's bottom edge; widens on hover. */
export function AccentBar({ category }: { category: string | null }) {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 z-10 h-1 origin-left scale-x-[0.18] transition-transform duration-300 ease-out group-hover:scale-x-100 motion-reduce:transition-none"
      style={{ background: categoryColor(category) }}
    />
  );
}

export function DraftBadge() {
  return <span className="label absolute left-0 top-0 z-10 bg-yellow-300 px-2 py-1 text-neutral-900">Draft</span>;
}

/**
 * A series on /projects, drawn like an album cover: a static mosaic of the parts' photos (the lead part large,
 * the others in a column beside it), a part-count badge, and the same text grammar as every other card.
 * No motion: auto-cycling photos can't be skimmed and need a pause control (WCAG 2.2.2). Links to the series overview.
 */
function SeriesTile({ series }: { series: SeriesCard }) {
  const members = series.members;
  const heroes = members.map((m) => ({ m, hero: heroOf(m) }));
  const [lead, ...rest] = heroes;
  const shown = rest.slice(0, 2);
  const extra = rest.length - shown.length;
  const anyDraft = members.some((m) => m.status === "draft");
  const cat = lead.m.category;
  // Each cell carries its own hover zoom, so only the part under the pointer moves: the parts read as separate things.
  const cell = "zoom relative overflow-hidden bg-wash";
  return (
    <Link href={seriesHref(series.name)} className="group block min-w-0">
      <div className="relative grid aspect-[4/3] grid-cols-3 grid-rows-2 gap-px overflow-hidden bg-paper">
        <div className={`${cell} col-span-2 row-span-2`}>
          {lead.hero ? (
            <Image src={lead.hero.path} alt={`${series.name}: ${lead.hero.caption || lead.m.title}`} fill sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 66vw" className="object-cover" />
          ) : (
            <span className="label flex h-full items-center justify-center text-neutral-400">No photo yet</span>
          )}
        </div>
        {shown.map(({ m, hero }, i) => (
          <div key={m.id} className={`${cell} ${shown.length === 1 ? "row-span-2" : ""}`}>
            {hero && <Image src={hero.path} alt="" fill sizes="(min-width: 1024px) 11vw, (min-width: 640px) 17vw, 33vw" className="object-cover" />}
            {i === shown.length - 1 && extra > 0 && (
              <span className="absolute inset-0 z-10 flex items-center justify-center bg-black/55 text-lg font-semibold text-white">+{extra}</span>
            )}
          </div>
        ))}
        <span className="label absolute bottom-1 right-0 z-20 bg-ink px-2 py-1 text-white">{members.length} parts</span>
        {anyDraft && <DraftBadge />}
        <AccentBar category={cat} />
      </div>
      <CategoryTag category={cat} extra={["Series"]} className="mt-3" />
      <h3 className="mt-1.5 text-[17px] font-semibold leading-snug tracking-[-0.01em] group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">{series.name}</h3>
      {/* One line per part, truncated: two parts take the same two lines a tagline does on the other cards */}
      <ol className="mt-1 text-sm text-neutral-600">
        {members.slice(0, 3).map((m, i) => (
          <li key={m.id} className="truncate">{String(i + 1).padStart(2, "0")} {m.title}{m.status === "draft" ? " (draft)" : ""}</li>
        ))}
        {members.length > 3 && <li>and {members.length - 3} more</li>}
      </ol>
    </Link>
  );
}
