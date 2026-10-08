import Image from "next/image";
import { CATEGORIES, CATEGORY_LABEL, MEDIA_KINDS, heroOf, type Project } from "@/lib/types";
import { HighlightTodo, TODO_RE, countTodos } from "@/components/Todo";
import { deleteMedia, moveMedia, setCover, updateMedia, updateProject } from "@/app/review/actions";
import ConfirmSubmit from "./ConfirmSubmit";
import DraftForm from "./DraftForm";

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

/** Inline editor for a project page (owner mode, ?edit=1): fields, then photos with kind/caption/order/cover. */
export default function ProjectEditor({ p, saved, error }: { p: Project; saved?: boolean; error?: string }) {
  const hero = heroOf(p);
  const textFields: [string, string | null][] = [
    ["Title", p.title], ["Tagline", p.tagline], ["Summary", p.summary], ["Role", p.role],
    ["Goal & constraints", p.goal_constraints], ["Process", p.process_md], ["Result", p.result_metric],
    ["What I'd change", p.lesson], ["Notes", p.body_md],
  ];
  const todoFields = textFields.filter(([, v]) => v && new RegExp(TODO_RE.source, "i").test(v));
  const nTodo = countTodos(...textFields.map(([, v]) => v));
  const back = `/work/${p.slug}?edit=1`;
  const linksText = Object.entries(p.links ?? {}).map(([k, v]) => `${k} | ${v}`).join("\n");

  return (
    <div className="no-print">
      {saved && <p className="mb-4 rounded-md border border-green-600/40 p-2 text-sm">Saved.</p>}
      {error && <p className="mb-4 rounded-md border border-red-600/40 p-2 text-sm text-red-600">{error}</p>}

      {p.intake_note && (
        <p className="mb-4 rounded-md bg-neutral-100 p-3 text-sm dark:bg-neutral-900">
          <span className="text-neutral-500">Your note: </span>{p.intake_note}
        </p>
      )}

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

      <DraftForm draftKey={`project:${p.id}`} version={p.updated_at} action={updateProject.bind(null, p.id)} className="space-y-4">
        <input type="hidden" name="return_to" value={back} />
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
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Series" name="series" value={p.series} hint="same name on each related page; they share one card on /work" />
          <Field label="Series order" name="series_order" value={p.series_order?.toString()} hint="1 = lead page" />
        </div>
        <Field label="Slug" name="slug" value={p.slug} hint="URL: /work/…" />
        <div className="sticky bottom-0 -mx-1 bg-white/90 px-1 py-3 pr-20 backdrop-blur sm:pr-1 dark:bg-neutral-950/90">
          <button className="btn btn-primary w-full sm:w-auto">Save</button>
        </div>
      </DraftForm>

      <h2 className="mb-3 mt-10 font-semibold">Photos ({p.media?.length ?? 0})</h2>
      <ul className="space-y-4">
        {(p.media ?? []).map((m, i, all) => (
          <li key={m.id} className="flex gap-3 border-b border-neutral-200 pb-4 dark:border-neutral-800">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded bg-neutral-100 sm:w-32 dark:bg-neutral-900">
              <Image src={m.path} alt="" fill sizes="128px" className="object-cover" />
              {hero?.id === m.id && <span className="absolute left-1 top-1 rounded bg-accent px-1 text-[10px] text-white">cover</span>}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <DraftForm draftKey={`media:${m.id}`} version={`${m.kind ?? ""}|${m.caption ?? ""}`} action={updateMedia.bind(null, p.id, m.id)} className="flex flex-wrap gap-2">
                <input type="hidden" name="return_to" value={back} />
                <select name="kind" defaultValue={m.kind ?? ""} className="input w-auto">
                  <option value="">(untyped)</option>
                  {MEDIA_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
                <input name="caption" defaultValue={m.caption ?? ""} placeholder="caption" className="input min-w-0 flex-1" />
                <button className="btn">Save</button>
              </DraftForm>
              <div className="flex flex-wrap gap-2">
                <form action={moveMedia.bind(null, p.id, m.id, -1)}><button className="btn" disabled={i === 0} aria-label="Move up">↑</button></form>
                <form action={moveMedia.bind(null, p.id, m.id, 1)}><button className="btn" disabled={i === all.length - 1} aria-label="Move down">↓</button></form>
                {hero?.id !== m.id && <form action={setCover.bind(null, p.id, m.id)}><button className="btn">Make cover</button></form>}
                <form action={deleteMedia.bind(null, p.id, m.id)}>
                  <ConfirmSubmit message="Remove this photo?" className="btn text-red-600">Remove</ConfirmSubmit>
                </form>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-neutral-500">
        To add photos, use <strong>Add photos</strong> at the top of this page. They land at the end as process photos.
      </p>
    </div>
  );
}
