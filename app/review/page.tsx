import Image from "next/image";
import Link from "next/link";
import { requireOwner } from "@/lib/owner";
import { allProjectsAdmin } from "@/lib/projects";
import { heroOf, isFeatureReady, type Project } from "@/lib/types";
import { HighlightTodo, countTodos } from "@/components/Todo";
import { setFeatured, setStatus } from "./actions";
import ConfirmSubmit from "@/components/owner/ConfirmSubmit";

export const metadata = { title: "Review", robots: { index: false } };
export const dynamic = "force-dynamic";

/** Reminder until the résumé PDF in the bucket is replaced; delete this once a newer PDF is uploaded. */
const RESUME_NOTE = {
  text: "Résumé PDF is the January 2026 version; upload a new one when ready.",
  href: "https://github.com/elilewis2029/portfolio/blob/main/docs/RESUME-UPDATE.md",
};

function todos(p: Project) {
  return countTodos(p.title, p.tagline, p.summary, p.role, p.goal_constraints, p.process_md, p.result_metric, p.lesson, p.body_md);
}

function Row({ p }: { p: Project }) {
  const hero = heroOf(p);
  const ready = isFeatureReady(p);
  const n = todos(p);
  const href = p.status === "draft" ? `/projects/${p.slug}?edit=1` : `/projects/${p.slug}`;
  return (
    <li className="flex gap-3 border-b border-neutral-200 py-3 dark:border-neutral-800">
      <Link href={href} className="relative h-16 w-20 shrink-0 overflow-hidden rounded bg-neutral-100 dark:bg-neutral-900">
        {hero && <Image src={hero.path} alt="" fill sizes="80px" className="object-cover" />}
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={href} className="font-medium hover:text-accent"><HighlightTodo text={p.title} /></Link>
        <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
          <span className="chip">{p.status}</span>
          {p.era === "archive" && <span className="chip">archive</span>}
          {p.featured && <span className="chip chip-on">featured</span>}
          {p.needs_drafting && <span className="chip border-blue-500 text-blue-700 dark:text-blue-400">needs drafting in chat</span>}
          {!ready && <span className="chip border-yellow-500 text-yellow-700 dark:text-yellow-400">needs a process photo</span>}
          {p.role_kind === "team" && !p.role && <span className="chip border-yellow-500 text-yellow-700 dark:text-yellow-400">team project: say what you owned</span>}
          {n > 0 && <mark className="todo text-xs">{n} TODO</mark>}
        </div>
        <Link href={`/projects/${p.slug}?edit=1`} className="-ml-2 inline-flex min-h-11 items-center px-2 text-xs text-accent">Edit</Link>
      </div>
      <div className="flex shrink-0 flex-col gap-1">
        {p.status === "draft" ? (
          <form action={setStatus.bind(null, p.id, "published")}>
            <ConfirmSubmit
              message={n > 0 ? `“${p.title}” still has ${n} [TODO] placeholder(s), and visitors will see them as written. Publish anyway?` : undefined}
              pending="Publishing…" className="btn btn-primary w-full"
            >
              Publish
            </ConfirmSubmit>
          </form>
        ) : (
          <form action={setStatus.bind(null, p.id, "draft")}><ConfirmSubmit pending="Unpublishing…" className="btn w-full">Unpublish</ConfirmSubmit></form>
        )}
        {p.status === "published" && (
          <form action={setFeatured.bind(null, p.id, !p.featured)}>
            {!p.featured && !ready ? (
              <button className="btn w-full" disabled title="Needs a process, CAD or drawing photo">Feature</button>
            ) : (
              <ConfirmSubmit pending="Saving…" className="btn w-full">{p.featured ? "Unfeature" : "Feature"}</ConfirmSubmit>
            )}
          </form>
        )}
      </div>
    </li>
  );
}

export default async function Review({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  await requireOwner("/review");
  const { deleted } = await searchParams;
  const all = await allProjectsAdmin();
  const drafts = all.filter((p) => p.status === "draft");
  const published = all.filter((p) => p.status === "published");
  const featured = published.filter((p) => p.featured).length;
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-4">
        <h1 className="text-xl font-semibold">Review</h1>
        <span className="text-sm text-neutral-500">{featured}/5 featured</span>
        <Link href="/add" className="btn btn-primary ml-auto">+ Add</Link>
      </div>
      {deleted && <p role="status" className="mb-4 rounded-md border border-green-600/40 p-2 text-sm">Deleted &ldquo;{deleted}&rdquo;.</p>}
      {RESUME_NOTE && (
        <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
          {RESUME_NOTE.text} <a href={RESUME_NOTE.href} className="text-accent hover:underline">Bullets to add →</a>
        </p>
      )}
      <h2 className="mb-1 font-semibold">Drafts ({drafts.length})</h2>
      {drafts.length === 0 && <p className="mb-6 text-sm text-neutral-500">No drafts. Tap + on any page to add one from photos.</p>}
      <ul className="mb-10">{drafts.map((p) => <Row key={p.id} p={p} />)}</ul>
      <h2 className="mb-1 font-semibold">Published ({published.length})</h2>
      <ul>{published.map((p) => <Row key={p.id} p={p} />)}</ul>
    </div>
  );
}
