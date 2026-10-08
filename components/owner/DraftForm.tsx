"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";

type Values = Record<string, string>;
type Draft = { at: number; version: string; values: Values };

const PREFIX = "portfolio-draft:";

type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
const isField = (el: Element): el is Field =>
  (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) && !!el.name && el.type !== "hidden";

/** What the user currently sees in the fields. */
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

const same = (a: Values, b: Values) => Object.keys(a).every((k) => a[k] === b[k]);

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

/**
 * A form that keeps unsaved edits in this browser until the server has them, so a tab that
 * reloads (browser discarded it, sign-in expired, accidental refresh) doesn't lose typing.
 * `version` changes whenever the saved data changes; a draft equal to the saved values is dropped.
 */
export default function DraftForm({
  draftKey, version, action, className, children,
}: {
  draftKey: string;
  version: string;
  action: (f: FormData) => void | Promise<void>;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLFormElement>(null);
  const saved = useRef<Values>({});
  const dirty = useRef(false);
  const [restored, setRestored] = useState<{ at: number; stale: boolean } | null>(null);

  // Remember the server values, then restore the local draft or drop it if the server already has it.
  function reconcile() {
    const form = ref.current;
    if (!form) return;
    saved.current = readSaved(form);
    const d = load(draftKey);
    if (!d || same(d.values, saved.current)) {
      drop(draftKey);
      dirty.current = false;
      setRestored(null);
      return;
    }
    write(form, d.values);
    dirty.current = true;
    setRestored({ at: d.at, stale: d.version !== version });
  }

  // On load and whenever the saved data changes.
  useEffect(reconcile, [draftKey, version]);

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
    } else {
      store(draftKey, { at: Date.now(), version, values });
      dirty.current = true;
    }
  }

  function discard() {
    if (ref.current) write(ref.current, saved.current);
    drop(draftKey);
    dirty.current = false;
    setRestored(null);
  }

  return (
    <form
      ref={ref}
      action={action}
      onInput={onChange}
      onChange={onChange}
      // Leaving via Save is fine; the draft stays until the saved version matches it.
      onSubmit={() => { dirty.current = false; }}
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
  );
}
