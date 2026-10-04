import Image from "next/image";
import Link from "next/link";
import { heroOf, type Project } from "@/lib/types";

export default function ProjectCard({ p, priority = false }: { p: Project; priority?: boolean }) {
  const hero = heroOf(p);
  const draft = p.status === "draft";
  return (
    <Link href={`/work/${p.slug}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100 ring-1 ring-neutral-900/5 dark:bg-neutral-900 dark:ring-white/10">
        {hero ? (
          <Image
            src={hero.path}
            alt={hero.caption || p.title}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
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
      <h3 className="mt-3 text-base font-semibold leading-snug group-hover:text-accent">{p.title}</h3>
      {p.tagline && <p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">{p.tagline}</p>}
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
