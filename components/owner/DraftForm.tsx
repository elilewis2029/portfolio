"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";

type Values = Record<string, string>;
// `submitted`: these exact values were sent with Save; once the server confirms the save they are dropped,
// even when the saved text differs (the server trims, lowercases tags, slugifies the URL, …).
type Draft = { at: number; version: string; values: Values; submitted?: boolean };
type Status = "clean" | "dirty" | "saving" | "saved";

const PREFIX = "portfolio-draft:";

type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
const isField = (el: Element): el is Field =>
  (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) && !!el.name && el.type !== "hidden";

/** What the user currently sees in the fields (including fields outside the form tag that use `form="…"`). */
function read(form: HTMLFormElement): Values {
  const out: Values = {};
  for (const el of Array.from(form.elements)) if (isField(el)) out[el.name] = el.value;
  return out;
}

/** What the server rendered (the fields' defaults), i.e. the saved version. */
function readSaved(form: HTMLFormElement): Values {
  const out: Values = {};
  for (const el of Array.from(form.elements)) {
    if (!isField(el)) continue;
    out[el.name] = el instanceof HTMLSelectElement
      ? (Array.from(el.options).find((o) => o.defaultSelected) ?? el.options[0])?.value ?? ""
      : el.defaultValue;
  }
  return out;
}

function write(form: HTMLFormElement, values: Values) {
  for (const [name, value] of Object.entries(values)) {
    const el = form.elements.namedItem(name);
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) el.value = value;
  }
}

// Only fields still on the page count: a removed photo's old caption is not an unsaved change.
const same = (draft: Values, saved: Values) => Object.keys(saved).every((k) => !(k in draft) || draft[k] === saved[k]);

function load(key: string): Draft | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}
function store(key: string, d: Draft) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(d)); } catch { /* storage full or blocked: nothing to do */ }
}
function drop(key: string) {
  try { localStorage.removeItem(PREFIX + key); } catch { /* ignore */ }
}

const time = (at: number) => new Date(at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

/**
 * A form that keeps unsaved edits in this browser until the server has them, so a tab that
 * reloads (browser discarded it, sign-in expired, accidental refresh) doesn't lose typing.
 * `version` changes whenever the saved data changes; `savedAt` is set (from the URL) right after a
 * successful Save, which drops the copy that was sent. `after` renders below the form (photo rows,
 * whose fields join this form with `form={id}`), and the sticky Save bar comes last so it stays
 * on screen over both.
 */
export default function DraftForm({
  id, draftKey, version, savedAt, error, action, className, children, after,
}: {
  id: string;
  draftKey: string;
  version: string;
  savedAt?: string;
  error?: string;
  action: (f: FormData) => void | Promise<void>;
  className?: string;
  children: ReactNode;
  after?: ReactNode;
}) {
  const ref = useRef<HTMLFormElement>(null);
  const saved = useRef<Values>({});
  const dirty = useRef(false);
  const [restored, setRestored] = useState<{ at: number; stale: boolean } | null>(null);
  const [status, setStatus] = useState<Status>(savedAt ? "saved" : "clean");

  // Remember the server values, then restore the local draft or drop it if the server already has it.
  function reconcile() {
    const form = ref.current;
    if (!form) return;
    saved.current = readSaved(form);
    const d = load(draftKey);
    if (!d || same(d.values, saved.current) || (savedAt && d.submitted)) {
      if (d) drop(draftKey);
      write(form, saved.current); // show what the server stored (it may have tidied the text)
      dirty.current = false;
      setRestored(null);
      setStatus(savedAt ? "saved" : "clean");
      return;
    }
    write(form, d.values);
    // Edits typed on this page (e.g. before Make cover re-rendered it) are not "restored"; only ones from an earlier visit are.
    if (!dirty.current) setRestored({ at: d.at, stale: d.version !== version });
    dirty.current = true;
    setStatus("dirty");
  }

  // On load, whenever the saved data changes, and after each successful Save.
  useEffect(reconcile, [draftKey, version, savedAt]);

  // "Saved" is for this visit only: take it out of the URL so a reload or a shared link doesn't repeat it.
  useEffect(() => {
    if (!savedAt) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("saved");
    url.searchParams.delete("error");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }, [savedAt]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty.current) e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  function onChange() {
    const form = ref.current;
    if (!form) return;
    const values = read(form);
    if (same(values, saved.current)) {
      drop(draftKey);
      dirty.current = false;
      setStatus("clean");
    } else {
      store(draftKey, { at: Date.now(), version, values });
      dirty.current = true;
      setStatus("dirty");
    }
  }

  // Photo fields live outside the <form> tag (attached with form={id}), so their events don't bubble through it.
  useEffect(() => {
    const listen = (e: Event) => { if ((e.target as Field | null)?.form === ref.current) onChange(); };
    document.addEventListener("input", listen);
    document.addEventListener("change", listen);
    return () => { document.removeEventListener("input", listen); document.removeEventListener("change", listen); };
  });

  function onSubmit() {
    const form = ref.current;
    if (form) {
      const values = read(form);
      if (!same(values, saved.current)) store(draftKey, { at: Date.now(), version, values, submitted: true });
    }
    dirty.current = false; // leaving via Save is fine
    setStatus("saving");
  }

  function discard() {
    if (ref.current) write(ref.current, saved.current);
    drop(draftKey);
    dirty.current = false;
    setRestored(null);
    setStatus("clean");
  }

  const label =
    status === "saving" ? "Saving…"
    : status === "dirty" ? "Unsaved changes"
    : status === "saved" && error ? "Saved, with one problem: see the top of the page"
    : status === "saved" ? `Saved ✓ ${time(Number(savedAt) || Date.now())}`
    : error ? "Not saved: see the top of the page"
    : "";

  return (
    <>
      <form
        id={id}
        ref={ref}
        action={action}
        onSubmit={onSubmit}
        // React resets the form after the action (even one that failed and came back); re-apply the draft after it.
        onReset={() => setTimeout(reconcile, 0)}
        className={className}
      >
        {restored && (
          <p className="basis-full rounded-md border border-yellow-500/60 p-2 text-sm">
            Restored unsaved changes from {new Date(restored.at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}. Press Save to keep them.
            {restored.stale && " The saved version has changed since; check nothing newer gets overwritten."}{" "}
            <button type="button" onClick={discard} className="underline">Discard</button>
          </p>
        )}
        {children}
      </form>
      {after}
      <div className="sticky bottom-0 z-30 -mx-1 mt-6 flex items-center gap-3 bg-white/90 px-1 py-3 pr-20 backdrop-blur sm:pr-1 dark:bg-neutral-950/90">
        <button form={id} className="btn btn-primary min-w-28" disabled={status === "saving"}>
          {status === "saving" ? "Saving…" : "Save"}
        </button>
        <span role="status" className={`min-w-0 text-sm ${status === "dirty" || error ? "text-yellow-700 dark:text-yellow-400" : "text-neutral-500"}`}>
          {label}
        </span>
      </div>
    </>
  );
}
