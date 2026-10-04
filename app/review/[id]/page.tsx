import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/owner";
import { projectByIdAdmin } from "@/lib/projects";
import { CATEGORIES, CATEGORY_LABEL, MEDIA_KINDS, heroOf, isFeatureReady } from "@/lib/types";
import { HighlightTodo, TODO_RE, countTodos } from "@/components/Todo";
import {
  deleteMedia, deleteProject, moveMedia, setCover, setFeatured, setStatus, updateMedia, updateProject,
} from "../actions";

export const metadata = { title: "Edit", robots: { index: false } };
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> };

function Field({ label, name, value, rows, hint }: { label: string; name: string; value: string | null | undefined; rows?: number; hint?: string }) {
  const todo = !!value && new RegExp(TODO_RE.source, "i").test(value);
  const cls = `input ${todo ? "border-yellow-500 ring-2 ring-yellow-300/60" : ""}`;
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500">
        {label} {hint && <span className="normal-case tracking-normal text-neutral-400">— {hint}</span>}
      </span>
      {rows ? (
        <textarea name={name} defaultValue={value ?? ""} rows={rows} className={cls} />
      ) : (
        <input name={name} defaultValue={value ?? ""} className={cls} />
      )}
    </label>
  );
}

export default async function EditProject({ params, searchParams }: Props) {
  const { id } = await params;
  await requireOwner(`/review/${id}`);
  const { saved, error } = await searchParams;
  const p = await projectByIdAdmin(id);
  if (!p) notFound();

  const ready = isFeatureReady(p);
  const hero = heroOf(p);
  const textFields: [string, string | null][] = [
    ["Title", p.title], ["Tagline", p.tagline], ["Summary", p.summary], ["Role", p.role],
    ["Goal & constraints", p.goal_constraints], ["Process", p.process_md], ["Result", p.result_metric],
    ["What I'd change", p.lesson], ["Notes", p.body_md],
  ];
  const todoFields = textFields.filter(([, v]) => v && new RegExp(TODO_RE.source, "i").test(v));
  const nTodo = countTodos(...textFields.map(([, v]) => v));
  const linksText = Object.entries(p.links ?? {}).map(([k, v]) => `${k} | ${v}`).join("\n");

  return (
    <div className="mx-auto max-w-3xl">
      <p className="mb-4 text-sm"><Link href="/review" className="text-accent">← Review</Link></p>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h1 className="mr-2 text-xl font-semibold"><HighlightTodo text={p.title} /></h1>
        <span className="chip">{p.status}</span>
        {p.featured && <span className="chip chip-on">featured</span>}
        {p.needs_drafting && <span className="chip border-blue-500 text-blue-700 dark:text-blue-400">needs drafting in chat</span>}
          {!ready && <span className="chip border-yellow-500 text-yellow-700 dark:text-yellow-400">needs a process photo</span>}
      </div>

      {saved && <p className="mb-4 rounded-md border border-green-600/40 p-2 text-sm">Saved.</p>}
      {error && <p className="mb-4 rounded-md border border-red-600/40 p-2 text-sm text-red-600">{error}</p>}

      <div className="mb-6 flex flex-wrap gap-2">
        {p.status === "draft" ? (
          <form action={setStatus.bind(null, p.id, "published")}><button className="btn btn-primary">Publish</button></form>
        ) : (
          <>
            <form action={setStatus.bind(null, p.id, "draft")}><button className="btn">Unpublish</button></form>
            <Link href={`/work/${p.slug}`} className="btn">View live</Link>
          </>
        )}
        {p.status === "published" && (
          <form action={setFeatured.bind(null, p.id, !p.featured)}>
            <button className="btn" disabled={!p.featured && !ready}>{p.featured ? "Unfeature" : "Feature on home"}</button>
          </form>
        )}
      </div>

      {nTodo > 0 && (
        <section className="mb-6 rounded-lg border border-yellow-500/60 p-3 text-sm">
          <p className="mb-2 font-medium">{nTodo} TODO{nTodo > 1 ? "s" : ""} to fill before publishing</p>
          <ul className="space-y-1">
            {todoFields.map(([label, v]) => (
              <li key={label}><span className="text-neutral-500">{label}:</span> <HighlightTodo text={v!} /></li>
            ))}
          </ul>
        </section>
      )}

      <form action={updateProject.bind(null, p.id)} className="space-y-4">
        <Field label="Title" name="title" value={p.title} hint="impact-style, 2–7 words" />
        <Field label="Tagline" name="tagline" value={p.tagline} hint="names the skill or process" />
        <Field label="Summary" name="summary" value={p.summary} rows={3} hint="2 sentences: what, how it performed, your part" />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500">Category</span>
            <select name="category" defaultValue={p.category} className="input">
              {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500">Solo / team</span>
            <select name="role_kind" defaultValue={p.role_kind ?? ""} className="input">
              <option value="">—</option><option value="solo">Solo</option><option value="team">Team</option>
            </select>
          </label>
        </div>
        <Field label="Role" name="role" value={p.role} hint="“I was responsible for…”" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Year" name="year" value={p.year?.toString()} />
          <Field label="Duration" name="duration" value={p.duration} />
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500">Section</span>
            <select name="era" defaultValue={p.era} className="input">
              <option value="current">Work</option><option value="archive">Archive</option>
            </select>
          </label>
        </div>
        <Field label="Goal & constraints" name="goal_constraints" value={p.goal_constraints} rows={3} hint="markdown bullets" />
        <Field label="Process" name="process_md" value={p.process_md} rows={6} hint="3–5 markdown bullets" />
        <Field label="Result" name="result_metric" value={p.result_metric} hint="one real number with units" />
        <Field label="What I'd change" name="lesson" value={p.lesson} />
        <Field label="Tools" name="tools" value={p.tools.join(", ")} hint="comma-separated" />
        <Field label="Skills" name="skills" value={p.skills.join(", ")} hint="comma-separated" />
        <Field label="Audience" name="audience" value={p.audience.join(", ")} hint="pd, mech, mfg" />
        <Field label="Links" name="links" value={linksText} rows={2} hint="one per line: Label | https://…" />
        <Field label="Notes" name="body_md" value={p.body_md} rows={4} hint="optional free text" />
        <Field label="Slug" name="slug" value={p.slug} hint="URL: /work/…" />
        <button className="btn btn-primary">Save</button>
      </form>

      <h2 className="mb-3 mt-10 font-semibold">Photos ({p.media?.length ?? 0})</h2>
      <ul className="space-y-4">
        {(p.media ?? []).map((m, i, all) => (
          <li key={m.id} className="flex gap-3 border-b border-neutral-200 pb-4 dark:border-neutral-800">
            <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded bg-neutral-100 dark:bg-neutral-900">
              <Image src={m.path} alt="" fill sizes="128px" className="object-cover" />
              {hero?.id === m.id && <span className="absolute left-1 top-1 rounded bg-accent px-1 text-[10px] text-white">cover</span>}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <form action={updateMedia.bind(null, p.id, m.id)} className="flex flex-wrap gap-2">
                <select name="kind" defaultValue={m.kind ?? ""} className="input w-auto">
                  <option value="">(untyped)</option>
                  {MEDIA_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
                <input name="caption" defaultValue={m.caption ?? ""} placeholder="caption" className="input min-w-0 flex-1" />
                <button className="btn">Save</button>
              </form>
              <div className="flex flex-wrap gap-2">
                <form action={moveMedia.bind(null, p.id, m.id, -1)}><button className="btn" disabled={i === 0}>↑</button></form>
                <form action={moveMedia.bind(null, p.id, m.id, 1)}><button className="btn" disabled={i === all.length - 1}>↓</button></form>
                {hero?.id !== m.id && <form action={setCover.bind(null, p.id, m.id)}><button className="btn">Make cover</button></form>}
                <form action={deleteMedia.bind(null, p.id, m.id)}><button className="btn text-red-600">Remove</button></form>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-neutral-500">
        To add photos, use <Link href="/add" className="text-accent">/add</Link> and name this project in the note.
      </p>

      <form action={deleteProject.bind(null, p.id)} className="mt-12 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <button className="btn text-red-600">Delete project and its photos</button>
      </form>
    </div>
  );
}
