import Link from "next/link";
import { deleteProject, setFeatured, setStatus } from "@/app/review/actions";
import { isFeatureReady, type Project } from "@/lib/types";
import { countTodos } from "@/components/Todo";
import ConfirmSubmit from "./ConfirmSubmit";
import AddPhotos from "./AddPhotos";
import DoneEditingLink from "./DoneEditingLink";

/** Owner mode controls at the top of a project page: status, Edit, Add photos, Publish, Feature, Delete. */
export default function OwnerToolbar({ p, editing }: { p: Project; editing: boolean }) {
  const ready = isFeatureReady(p);
  const todos = countTodos(p.title, p.tagline, p.summary, p.role, p.goal_constraints, p.process_md, p.result_metric, p.lesson, p.body_md);
  return (
    <div className="no-print mb-6 rounded-lg border border-dashed border-accent/50 bg-accent-soft/60 p-3 text-sm dark:bg-accent/10">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`chip ${p.status === "draft" ? "border-yellow-500 text-yellow-700 dark:text-yellow-400" : "border-green-600 text-green-700 dark:text-green-400"}`}>
          {p.status === "draft" ? "Draft" : "Published"}
        </span>
        {p.featured && <span className="chip chip-on">Featured</span>}
        {p.needs_drafting && <span className="chip border-blue-500 text-blue-700 dark:text-blue-400">needs drafting in chat</span>}
        {!ready && <span className="chip border-yellow-500 text-yellow-700 dark:text-yellow-400">needs a process photo</span>}
        {todos > 0 && <mark className="todo text-xs">{todos} TODO</mark>}
        <span className="ml-auto flex flex-wrap gap-2">
          {editing ? (
            <DoneEditingLink href={`/work/${p.slug}`} draftKey={`project:${p.id}`} />
          ) : (
            <Link href={`/work/${p.slug}?edit=1`} className="btn btn-primary">Edit</Link>
          )}
          <AddPhotos projectId={p.id} supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!} anonKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!} />
          {p.status === "draft" ? (
            <form action={setStatus.bind(null, p.id, "published")}>
              <ConfirmSubmit
                message={todos > 0 ? `This page still has ${todos} [TODO] placeholder(s), and visitors will see them as written. Publish anyway?` : undefined}
                pending="Publishing…" className="btn"
              >
                Publish
              </ConfirmSubmit>
            </form>
          ) : (
            <form action={setStatus.bind(null, p.id, "draft")}><ConfirmSubmit pending="Unpublishing…" className="btn">Unpublish</ConfirmSubmit></form>
          )}
          {p.status === "published" && (
            <form action={setFeatured.bind(null, p.id, !p.featured)}>
              {!p.featured && !ready ? (
                <button className="btn" disabled title="Needs a process, CAD or drawing photo">Feature</button>
              ) : (
                <ConfirmSubmit pending="Saving…" className="btn">{p.featured ? "Unfeature" : "Feature"}</ConfirmSubmit>
              )}
            </form>
          )}
          <form action={deleteProject.bind(null, p.id)}>
            <ConfirmSubmit message={`Delete “${p.title}” and its ${p.media?.length ?? 0} photo(s)? This can't be undone.`} pending="Deleting…" className="btn text-red-600">
              Delete
            </ConfirmSubmit>
          </form>
        </span>
      </div>
    </div>
  );
}
