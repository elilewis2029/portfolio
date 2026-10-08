import Image from "next/image";
import Link from "next/link";
import Md from "@/components/Md";
import Lightbox from "@/components/Lightbox";
import { contactEmail, publicUrl } from "@/lib/projects";
import { CATEGORY_LABEL, heroOf, type Media, type Project } from "@/lib/types";

function Figure({ m, sizes }: { m: Media; sizes: string }) {
  return (
    <figure className="avoid-break">
      <Lightbox src={publicUrl(m.original_path ?? m.path)} alt={m.caption || ""}>
        <span className="zoom block overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900">
          <Image src={m.path} alt={m.caption || ""} width={m.width ?? 1600} height={m.height ?? 1200} sizes={sizes} className="h-auto w-full" />
        </span>
      </Lightbox>
      {m.caption && <figcaption className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400">{m.caption}</figcaption>}
    </figure>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-neutral-500">{label}</dt>
      <dd className="mt-0.5 text-sm">{children}</dd>
    </div>
  );
}

/**
 * One project's article body in the RESEARCH.md template order. `level` "h1" is the page's own project;
 * "h2" is a part folded into a series page (headings step down one level, the hero is not prioritised).
 * `part` adds the "Part n of N" eyebrow and `id` the anchor the series tabs jump to.
 */
export default function ProjectBody({
  p, level = "h1", id, part, owner = false, editHref,
}: { p: Project; level?: "h1" | "h2"; id?: string; part?: { n: number; of: number }; owner?: boolean; editHref?: string }) {
  const media = p.media ?? [];
  const hero = heroOf(p);
  const rest = media.filter((m) => m.id !== hero?.id);
  // A "hero" photo that is no longer the cover still belongs on the page, with the process photos.
  const process = rest.filter((m) => !m.kind || ["hero", "process", "cad", "drawing", "test", "failure"].includes(m.kind));
  const results = rest.filter((m) => m.kind === "before" || m.kind === "after");
  const links = Object.entries(p.links ?? {}).filter(([, url]) => typeof url === "string" && url);
  const email = contactEmail();
  const Title = level;
  const H = level === "h1" ? "h2" : "h3";
  const first = level === "h1";

  return (
    <section id={id} className={id ? "scroll-mt-28" : undefined} aria-labelledby={id ? `${id}-title` : undefined}>
      {first && (
        <div className="print-only mb-3 text-xs">
          Eli Lewis · {email} · elilewisportfolio.info/work/{p.slug}
        </div>
      )}

      {/* 1. Impact title + tagline */}
      <header className={`${first ? "rise" : ""} mb-6`}>
        <p className="text-xs uppercase tracking-wide text-accent">
          {part && <span className="mr-2 rounded bg-accent px-1.5 py-0.5 text-white">Part {part.n} of {part.of}</span>}
          {CATEGORY_LABEL[p.category]}{p.year ? ` · ${p.year}` : ""}
        </p>
        <Title id={id ? `${id}-title` : undefined} className={`mt-1 font-bold tracking-tight ${first ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"}`}>{p.title}</Title>
        {p.tagline && <p className="mt-2 text-lg text-neutral-700 dark:text-neutral-300">{p.tagline}</p>}
        {owner && editHref && (
          <p className="no-print mt-2 text-sm"><Link href={editHref} className="btn">Edit this part</Link></p>
        )}
      </header>

      {/* 2. Hero */}
      {hero && (
        <div className={`print-hero ${first ? "rise rise-2" : ""} mb-8`}>
          <Lightbox src={publicUrl(hero.original_path ?? hero.path)} alt={hero.caption || p.title}>
            <Image
              src={hero.path}
              alt={hero.caption || p.title}
              width={hero.width ?? 1600}
              height={hero.height ?? 1200}
              priority={first}
              sizes="(min-width: 1024px) 896px, 100vw"
              className="h-auto w-full rounded-2xl bg-neutral-100 dark:bg-neutral-900"
            />
          </Lightbox>
          {hero.caption && <p className="mt-2 text-sm text-neutral-500">{hero.caption}</p>}
        </div>
      )}

      {/* 3. Outcome summary */}
      {p.summary && <p className={`${first ? "rise rise-3" : ""} mb-6 max-w-3xl text-lg leading-relaxed sm:text-xl`}>{p.summary}</p>}

      {/* 4. Quick facts */}
      <dl className="avoid-break mb-8 grid grid-cols-2 gap-4 rounded-lg border border-neutral-200 p-4 sm:grid-cols-4 dark:border-neutral-800">
        <Fact label="Role">
          {p.role_kind === "team" ? "Team" : p.role_kind === "solo" ? "Solo" : "—"}
          {p.role && <span className="block text-neutral-600 dark:text-neutral-400">{p.role}</span>}
        </Fact>
        <Fact label="Duration">{p.duration || "—"}</Fact>
        <Fact label="Tools">{p.tools.length ? p.tools.join(", ") : "—"}</Fact>
        <Fact label="Skills">{p.skills.length ? p.skills.join(", ") : "—"}</Fact>
      </dl>

      {/* 5. Goal & constraints */}
      {p.goal_constraints && (
        <section className="mb-8">
          <H className="mb-2 text-lg font-semibold">Goal &amp; constraints</H>
          <Md>{p.goal_constraints}</Md>
        </section>
      )}

      {/* 6. Process */}
      {(p.process_md || process.length > 0) && (
        <section className="mb-8">
          <H className="mb-2 text-lg font-semibold">Process</H>
          <Md>{p.process_md}</Md>
          {process.length > 0 && (
            <div className="print-grid mt-5 grid gap-5 sm:grid-cols-2">
              {process.map((m, i) => (
                <div key={m.id} className={process.length % 2 === 1 && i === 0 ? "sm:col-span-2" : ""}>
                  <Figure m={m} sizes={process.length % 2 === 1 && i === 0 ? "(min-width: 1024px) 896px, 100vw" : "(min-width: 1024px) 440px, 100vw"} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 7. Result */}
      {(p.result_metric || results.length > 0) && (
        <section className="mb-8 border-t border-neutral-200 pt-8 dark:border-neutral-800">
          <H className="mb-2 text-lg font-semibold">Result</H>
          {p.result_metric && (
            <p className="inline-block rounded-md bg-accent-soft px-3 py-2 text-xl font-semibold text-accent dark:bg-accent/15">{p.result_metric}</p>
          )}
          {results.length > 0 && (
            <>
              <p className="mt-6 mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">Before and after</p>
              <div className="print-grid grid gap-5 sm:grid-cols-2">
                {results.map((m) => (
                  <div key={m.id} className="relative">
                    <span className="absolute left-3 top-3 z-10 rounded-md bg-neutral-900/80 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
                      {m.kind === "before" ? "Before" : "After"}
                    </span>
                    <Figure m={m} sizes="(min-width: 1024px) 440px, 100vw" />
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* 8. What I'd change */}
      {p.lesson && (
        <section className="mb-8">
          <H className="mb-2 text-lg font-semibold">What I&rsquo;d change</H>
          <p>{p.lesson}</p>
        </section>
      )}

      {p.body_md && (
        <section className="mb-8">
          <H className="mb-2 text-lg font-semibold">Notes</H>
          <Md>{p.body_md}</Md>
        </section>
      )}

      {/* 9. Links */}
      {links.length > 0 && (
        <section className="mb-8">
          <H className="mb-2 text-lg font-semibold">Links</H>
          <ul className="flex flex-wrap gap-4">
            {links.map(([label, url]) => (
              <li key={label}><a href={url} className="text-accent underline underline-offset-2">{label}</a></li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}
