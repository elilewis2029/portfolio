import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { seriesByHubSlug } from "@/lib/projects";
import { isOwner } from "@/lib/owner";
import { CATEGORY_LABEL, heroOf, type Project } from "@/lib/types";

type Props = { params: Promise<{ series: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const parts = await seriesByHubSlug((await params).series, await isOwner());
  if (parts.length < 2) return {};
  return { title: parts[0].series!, description: parts.map((p) => p.title).join(" · ") };
}

/**
 * Series overview: photo-first tiles, one per part, each with a big hero, the title, the first lines of the
 * outcome sentence and the result number; the whole tile opens the part. With fewer than two visible parts
 * there is nothing to overview: one part redirects to that page, none is a 404.
 */
export default async function SeriesHub({ params }: Props) {
  const { series } = await params;
  const owner = await isOwner();
  const parts = await seriesByHubSlug(series, owner);
  if (parts.length === 0) notFound();
  if (parts.length === 1) redirect(`/work/${parts[0].slug}`);
  const name = parts[0].series!;
  const tools = [...new Set(parts.flatMap((p) => p.tools))];
  const skills = [...new Set(parts.flatMap((p) => p.skills))];
  const years = [...new Set(parts.map((p) => p.year).filter(Boolean))].sort();
  const lead = parts[0];

  return (
    <article className="mx-auto max-w-5xl">
      <nav aria-label="Breadcrumb" className="no-print mb-3 text-sm">
        <Link href="/work" className="inline-flex min-h-11 items-center text-neutral-600 hover:text-accent dark:text-neutral-400">← Work</Link>
      </nav>
      <header className="rise mb-6">
        <p className="text-xs uppercase tracking-wide text-accent">
          Project in {parts.length} parts{years.length ? ` · ${years.join("–")}` : ""}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{name}</h1>
        <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-neutral-600 dark:text-neutral-400">
          <div><dt className="inline text-xs uppercase tracking-wide text-neutral-500">Role </dt><dd className="inline">{lead.role_kind === "team" ? "Team" : lead.role_kind === "solo" ? "Solo" : "—"}</dd></div>
          {tools.length > 0 && <div><dt className="inline text-xs uppercase tracking-wide text-neutral-500">Tools </dt><dd className="inline">{tools.join(", ")}</dd></div>}
          {skills.length > 0 && <div><dt className="inline text-xs uppercase tracking-wide text-neutral-500">Skills </dt><dd className="inline">{skills.join(", ")}</dd></div>}
        </dl>
      </header>

      <ol className="grid gap-6 sm:grid-cols-2">
        {parts.map((p, n) => <PartTile key={p.id} p={p} n={n + 1} />)}
      </ol>

      {lead.role && (
        <p className="mt-8 max-w-3xl text-sm text-neutral-600 dark:text-neutral-400"><span className="text-xs uppercase tracking-wide text-neutral-500">My part </span>{lead.role}</p>
      )}
      <p className="no-print mt-8 text-sm">
        <Link href="/work" className="inline-flex min-h-11 items-center text-accent hover:underline">← Back to work</Link>
      </p>
    </article>
  );
}

function PartTile({ p, n }: { p: Project; n: number }) {
  const hero = heroOf(p);
  return (
    <li className="avoid-break">
      <Link href={`/work/${p.slug}`} className="group block h-full rounded-2xl ring-1 ring-neutral-200 transition-shadow hover:shadow-lg hover:ring-accent dark:ring-neutral-800">
        <div className="zoom relative aspect-[16/10] overflow-hidden rounded-t-2xl bg-neutral-100 dark:bg-neutral-900">
          {hero ? (
            <Image src={hero.path} alt={hero.caption || p.title} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" priority={n === 1} />
          ) : (
            <span className="flex h-full items-center justify-center text-sm text-neutral-400">No photo yet</span>
          )}
          <span className="on-accent absolute left-3 top-3 z-10 rounded-md bg-accent px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white shadow">Part {n}</span>
          {p.status === "draft" && <span className="absolute right-3 top-3 z-10 rounded-md bg-yellow-400 px-2 py-0.5 text-xs font-semibold text-neutral-900 shadow">Draft</span>}
        </div>
        <div className="p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">{CATEGORY_LABEL[p.category]}{p.duration ? ` · ${p.duration}` : ""}</p>
          <h2 className="mt-1 text-lg font-semibold leading-snug group-hover:text-accent sm:text-xl">{p.title}</h2>
          {p.tagline && <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{p.tagline}</p>}
          {p.summary && <p className="mt-3 line-clamp-3 text-sm leading-relaxed">{p.summary}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            {p.result_metric && <span className="inline-block rounded-md bg-accent-soft px-2.5 py-1 text-sm font-semibold text-accent dark:bg-accent/15">{p.result_metric}</span>}
            <span className="ml-auto text-sm font-medium text-accent">Read part {n} →</span>
          </div>
        </div>
      </Link>
    </li>
  );
}
