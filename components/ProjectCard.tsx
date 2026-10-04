import Image from "next/image";
import Link from "next/link";
import { heroOf, type Project } from "@/lib/types";

export default function ProjectCard({ p, priority = false }: { p: Project; priority?: boolean }) {
  const hero = heroOf(p);
  return (
    <Link href={`/work/${p.slug}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900">
        {hero && (
          <Image
            src={hero.path}
            alt={hero.caption || p.title}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-opacity group-hover:opacity-90"
          />
        )}
      </div>
      <h3 className="mt-3 font-semibold leading-snug group-hover:text-accent">{p.title}</h3>
      {p.tagline && <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{p.tagline}</p>}
      {p.skills.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {p.skills.slice(0, 3).map((s) => (
            <span key={s} className="chip">{s}</span>
          ))}
        </div>
      )}
    </Link>
  );
}
