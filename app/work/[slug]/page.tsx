import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Md from "@/components/Md";
import Lightbox from "@/components/Lightbox";
import OwnerToolbar from "@/components/owner/OwnerToolbar";
import ProjectEditor from "@/components/owner/ProjectEditor";
import { contactEmail, projectBySlug, publicUrl } from "@/lib/projects";
import { isOwner } from "@/lib/owner";
import { CATEGORY_LABEL, heroOf, type Media } from "@/lib/types";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ edit?: string; saved?: string; error?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await projectBySlug((await params).slug, await isOwner());
  if (!p) return {};
  return {
    title: p.title,
    description: p.tagline ?? p.summary ?? undefined,
    robots: p.status === "draft" ? { index: false } : undefined,
  };
}

function Figure({ m, sizes }: { m: Media; sizes: string }) {
  return (
    <figure className="avoid-break">
      <Lightbox src={publicUrl(m.original_path ?? m.path)} alt={m.caption || ""}>
        <span className="zoom block overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900">
          <Image
            src={m.path}
            alt={m.caption || ""}
            width={m.width ?? 1600}
            height={m.height ?? 1200}
            sizes={sizes}
            className="h-auto w-full"
          />
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

export default async function ProjectPage({ params, searchParams }: Props) {
  const [{ slug }, { edit, saved, error }, owner] = await Promise.all([params, searchParams, isOwner()]);
  const p = await projectBySlug(slug, owner);
  if (!p) notFound();
  const editing = owner && edit === "1";

  const media = p.media ?? [];
  const hero = heroOf(p);
  const rest = media.filter((m) => m.id !== hero?.id);
  const process = rest.filter((m) => !m.kind || ["process", "cad", "drawing", "test", "failure"].includes(m.kind));
  const results = rest.filter((m) => m.kind === "before" || m.kind === "after");
  const links = Object.entries(p.links ?? {}).filter(([, url]) => typeof url === "string" && url);
  const email = contactEmail();

  return (
    <article className="mx-auto max-w-4xl">
      {owner && <OwnerToolbar p={p} editing={editing} />}
      {owner && !editing && error && <p className="no-print mb-4 rounded-md border border-red-600/40 p-2 text-sm text-red-600">{error}</p>}

      {editing ? (
        <>
          <h1 className="mb-4 text-xl font-semibold">Edit project</h1>
          <ProjectEditor p={p} saved={saved === "1"} error={error} />
        </>
      ) : (
        <>
          <div className="print-only mb-3 text-xs">
            Eli Lewis · {email} · elilewisportfolio.info/work/{p.slug}
          </div>

          {/* 1. Impact title + tagline */}
          <header className="rise mb-6">
            <p className="text-xs uppercase tracking-wide text-accent">
              {CATEGORY_LABEL[p.category]}{p.year ? ` · ${p.year}` : ""}
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{p.title}</h1>
            {p.tagline && <p className="mt-2 text-lg text-neutral-700 dark:text-neutral-300">{p.tagline}</p>}
          </header>

          {/* 2. Hero */}
          {hero && (
            <div className="print-hero rise rise-2 mb-8">
              <Lightbox src={publicUrl(hero.original_path ?? hero.path)} alt={hero.caption || p.title}>
                <Image
                  src={hero.path}
                  alt={hero.caption || p.title}
                  width={hero.width ?? 1600}
                  height={hero.height ?? 1200}
                  priority
                  sizes="(min-width: 1024px) 896px, 100vw"
                  className="h-auto w-full rounded-2xl bg-neutral-100 dark:bg-neutral-900"
                />
              </Lightbox>
              {hero.caption && <p className="mt-2 text-sm text-neutral-500">{hero.caption}</p>}
            </div>
          )}

          {/* 3. Outcome summary */}
          {p.summary && <p className="rise rise-3 mb-6 max-w-3xl text-lg leading-relaxed sm:text-xl">{p.summary}</p>}

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
              <h2 className="mb-2 text-lg font-semibold">Goal &amp; constraints</h2>
              <Md>{p.goal_constraints}</Md>
            </section>
          )}

          {/* 6. Process */}
          {(p.process_md || process.length > 0) && (
            <section className="mb-8">
              <h2 className="mb-2 text-lg font-semibold">Process</h2>
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
            <section className="mb-8">
              <h2 className="mb-2 text-lg font-semibold">Result</h2>
              {p.result_metric && (
                <p className="inline-block rounded-md bg-accent-soft px-3 py-2 text-xl font-semibold text-accent dark:bg-accent/15">
                  {p.result_metric}
                </p>
              )}
              {results.length > 0 && (
                <div className="print-grid mt-5 grid gap-5 sm:grid-cols-2">
                  {results.map((m) => <Figure key={m.id} m={m} sizes="(min-width: 1024px) 440px, 100vw" />)}
                </div>
              )}
            </section>
          )}

          {/* 8. What I'd change */}
          {p.lesson && (
            <section className="mb-8">
              <h2 className="mb-2 text-lg font-semibold">What I&rsquo;d change</h2>
              <p>{p.lesson}</p>
            </section>
          )}

          {/* Optional free text (e.g. imported write-ups) */}
          {p.body_md && (
            <section className="mb-8">
              <h2 className="mb-2 text-lg font-semibold">Notes</h2>
              <Md>{p.body_md}</Md>
            </section>
          )}

          {/* 9. Links */}
          {links.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-2 text-lg font-semibold">Links</h2>
              <ul className="flex flex-wrap gap-4">
                {links.map(([label, url]) => (
                  <li key={label}><a href={url} className="text-accent underline underline-offset-2">{label}</a></li>
                ))}
              </ul>
            </section>
          )}

          <p className="no-print mt-10 text-sm text-neutral-500">
            Printing this page gives a one-to-two page PDF.
          </p>
        </>
      )}
    </article>
  );
}
