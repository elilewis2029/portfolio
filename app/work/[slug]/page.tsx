import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import OwnerToolbar from "@/components/owner/OwnerToolbar";
import ProjectEditor from "@/components/owner/ProjectEditor";
import ProjectBody from "@/components/ProjectBody";
import SeriesTabs from "@/components/SeriesTabs";
import { projectBySlug, seriesSiblings } from "@/lib/projects";
import { isOwner } from "@/lib/owner";

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

/**
 * Prototype B: a series is read as one page. The lead page (lowest series_order) folds every visible part in
 * as a section with an anchor (#part-2 …) under a sticky tab bar. The other parts keep their own URLs and
 * render on their own with a link to the whole series, so deep links, print and the owner's editor still work.
 */
export default async function ProjectPage({ params, searchParams }: Props) {
  const [{ slug }, { edit, saved, error }, owner] = await Promise.all([params, searchParams, isOwner()]);
  const p = await projectBySlug(slug, owner);
  if (!p) notFound();
  const siblings = await seriesSiblings(p, owner);
  const editing = owner && edit === "1";
  const inSeries = siblings.length > 1;
  const idx = siblings.findIndex((s) => s.id === p.id);
  const lead = inSeries && idx === 0;

  return (
    <article className="mx-auto max-w-4xl">
      {owner && <OwnerToolbar p={p} editing={editing} />}
      {owner && !editing && error && <p className="no-print mb-4 rounded-md border border-red-600/40 p-2 text-sm text-red-600">{error}</p>}

      {editing ? (
        <>
          <h1 className="mb-4 text-xl font-semibold">Edit project</h1>
          <ProjectEditor p={p} savedAt={saved} error={error} />
        </>
      ) : lead ? (
        <>
          <SeriesTabs series={p.series!} siblings={siblings} />
          {siblings.map((s, n) => (
            <div key={s.id} className={n > 0 ? "mt-12 border-t-4 border-neutral-200 pt-10 dark:border-neutral-800" : ""}>
              <ProjectBody
                p={s}
                level={n === 0 ? "h1" : "h2"}
                id={`part-${n + 1}`}
                part={{ n: n + 1, of: siblings.length }}
                owner={owner}
                editHref={n > 0 ? `/work/${s.slug}?edit=1` : undefined}
              />
              {n > 0 && (
                <p className="no-print text-sm text-neutral-500">
                  This part also has its own page: <Link href={`/work/${s.slug}`} className="text-accent hover:underline">/work/{s.slug}</Link>
                </p>
              )}
            </div>
          ))}
          <p className="no-print mt-10 text-sm text-neutral-500">Printing this page prints all {siblings.length} parts.</p>
        </>
      ) : (
        <>
          {inSeries && (
            <p className="no-print mb-4 rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800">
              Part {idx + 1} of {siblings.length} of <strong>{p.series}</strong>.{" "}
              <Link href={`/work/${siblings[0].slug}#part-${idx + 1}`} className="text-accent hover:underline">Read the whole project on one page →</Link>
            </p>
          )}
          <ProjectBody p={p} part={inSeries ? { n: idx + 1, of: siblings.length } : undefined} />
          {inSeries && (
            <p className="print-only mt-4 text-xs">Part {idx + 1} of {siblings.length} of &ldquo;{p.series}&rdquo;; the full series is at elilewisportfolio.info/work/{siblings[0].slug}</p>
          )}
          <p className="no-print mt-10 text-sm text-neutral-500">Printing this page gives a one-to-two page PDF.</p>
        </>
      )}
    </article>
  );
}
