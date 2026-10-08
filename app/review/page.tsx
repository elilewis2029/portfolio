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

function todos(p: Project) {
  return countTodos(p.title, p.tagline, p.summary, p.role, p.goal_constraints, p.process_md, p.result_metric, p.lesson, p.body_md);
}

function Row({ p }: { p: Project }) {
  const hero = heroOf(p);
  const ready = isFeatureReady(p);
  const n = todos(p);
  const href = p.status === "draft" ? `/work/${p.slug}?edit=1` : `/work/${p.slug}`;
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
        <Link href={`/work/${p.slug}?edit=1`} className="mt-1 inline-block text-xs text-accent">Edit</Link>
      </div>
      <div className="flex shrink-0 flex-col gap-1">
        {p.status === "draft" ? (
          <form action={setStatus.bind(null, p.id, "published")}>
            {n > 0 ? (
              <ConfirmSubmit message={`“${p.title}” still has ${n} [TODO] placeholder(s), and visitors will see them as written. Publish anyway?`} className="btn btn-primary w-full">Publish</ConfirmSubmit>
            ) : (
              <button className="btn btn-primary w-full">Publish</button>
            )}
          </form>
        ) : (
          <form action={setStatus.bind(null, p.id, "draft")}><button className="btn w-full">Unpublish</button></form>
        )}
        {p.status === "published" && (
          <form action={setFeatured.bind(null, p.id, !p.featured)}>
            <button className="btn w-full" disabled={!p.featured && !ready} title={!ready ? "Needs a process, CAD or drawing photo" : ""}>
              {p.featured ? "Unfeature" : "Feature"}
            </button>
          </form>
        )}
      </div>
    </li>
  );
}

export default async function Review() {
  await requireOwner("/review");
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
      <h2 className="mb-1 font-semibold">Drafts ({drafts.length})</h2>
      {drafts.length === 0 && <p className="mb-6 text-sm text-neutral-500">No drafts. Tap + on any page to add one from photos.</p>}
      <ul className="mb-10">{drafts.map((p) => <Row key={p.id} p={p} />)}</ul>
      <h2 className="mb-1 font-semibold">Published ({published.length})</h2>
      <ul>{published.map((p) => <Row key={p.id} p={p} />)}</ul>
    </div>
  );
}
