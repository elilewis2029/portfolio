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
 * Prototype C: the series gets an overview page of its own. Each part is shown with its hero, outcome
 * sentence and result number side by side, so both outcomes are seen in one skim; each part keeps its page.
 * With fewer than two visible parts there is nothing to overview: one part redirects to that page, none is a 404.
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

  return (
    <article className="mx-auto max-w-4xl">
      <nav aria-label="Breadcrumb" className="no-print mb-3 text-sm">
        <Link href="/work" className="inline-flex min-h-11 items-center text-neutral-600 hover:text-accent dark:text-neutral-400">← Work</Link>
      </nav>
      <header className="rise mb-8">
        <p className="text-xs uppercase tracking-wide text-accent">
          Project in {parts.length} parts{years.length ? ` · ${years.join("–")}` : ""}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{name}</h1>
        {parts[0].summary && <p className="mt-3 max-w-3xl text-lg text-neutral-700 dark:text-neutral-300">{parts[0].summary}</p>}
        <dl className="mt-5 grid grid-cols-2 gap-4 rounded-lg border border-neutral-200 p-4 text-sm sm:grid-cols-3 dark:border-neutral-800">
          <div><dt className="text-xs uppercase tracking-wide text-neutral-500">Role</dt><dd className="mt-0.5">{parts[0].role_kind === "team" ? "Team" : parts[0].role_kind === "solo" ? "Solo" : "—"}{parts[0].role && <span className="block text-neutral-600 dark:text-neutral-400">{parts[0].role}</span>}</dd></div>
          <div><dt className="text-xs uppercase tracking-wide text-neutral-500">Tools</dt><dd className="mt-0.5">{tools.join(", ") || "—"}</dd></div>
          <div><dt className="text-xs uppercase tracking-wide text-neutral-500">Skills</dt><dd className="mt-0.5">{skills.join(", ") || "—"}</dd></div>
        </dl>
      </header>

      <ol className="space-y-8">
        {parts.map((p, n) => <PartCard key={p.id} p={p} n={n + 1} />)}
      </ol>

      <p className="no-print mt-10 text-sm">
        <Link href="/work" className="inline-flex min-h-11 items-center text-accent hover:underline">← Back to work</Link>
      </p>
    </article>
  );
}

function PartCard({ p, n }: { p: Project; n: number }) {
  const hero = heroOf(p);
  const href = `/work/${p.slug}`;
  return (
    <li className="avoid-break grid gap-4 rounded-2xl border border-neutral-200 p-4 sm:grid-cols-[2fr_3fr] sm:gap-6 dark:border-neutral-800">
      <Link href={href} className="zoom relative block aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900" aria-label={`Part ${n}: ${p.title}`}>
        {hero ? <Image src={hero.path} alt={hero.caption || p.title} fill sizes="(min-width: 640px) 360px, 100vw" className="object-cover" priority={n === 1} /> : <span className="flex h-full items-center justify-center text-sm text-neutral-400">No photo yet</span>}
        {p.status === "draft" && <span className="absolute left-2 top-2 rounded-md bg-yellow-400 px-2 py-0.5 text-xs font-semibold text-neutral-900 shadow">Draft</span>}
      </Link>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-accent">Part {n} · {CATEGORY_LABEL[p.category]}{p.duration ? ` · ${p.duration}` : ""}</p>
        <h2 className="mt-1 text-xl font-semibold leading-snug"><Link href={href} className="hover:text-accent">{p.title}</Link></h2>
        {p.tagline && <p className="mt-1 text-neutral-600 dark:text-neutral-400">{p.tagline}</p>}
        {p.summary && <p className="mt-3 text-sm leading-relaxed">{p.summary}</p>}
        {p.result_metric && <p className="mt-3 inline-block rounded-md bg-accent-soft px-3 py-1.5 text-sm font-semibold text-accent dark:bg-accent/15">{p.result_metric}</p>}
        <p className="mt-4"><Link href={href} className="btn">Read part {n} →</Link></p>
      </div>
    </li>
  );
}
