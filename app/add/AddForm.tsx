"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { prepareUploads, submitIntake, type IntakeOutcome } from "./actions";

export default function AddForm({ supabaseUrl, anonKey }: { supabaseUrl: string; anonKey: string }) {
  const storage = useMemo(() => createClient(supabaseUrl, anonKey).storage.from("portfolio"), [supabaseUrl, anonKey]);
  const [files, setFiles] = useState<File[]>([]);
  const [note, setNote] = useState("");
  const [roleKind, setRoleKind] = useState<"solo" | "team" | null>(null);
  const [showMetric, setShowMetric] = useState(false);
  const [metric, setMetric] = useState("");
  const [showChange, setShowChange] = useState(false);
  const [change, setChange] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<IntakeOutcome | null>(null);

  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);

  async function send(mode: "now" | "chat") {
    if (!files.length) return;
    setResult(null);
    try {
      setBusy("Uploading photos…");
      const { batch, uploads } = await prepareUploads(files.map((f) => f.name));
      await Promise.all(
        uploads.map(async (u, i) => {
          const { error } = await storage.uploadToSignedUrl(u.path, u.token, files[i], { contentType: files[i].type || "image/jpeg" });
          if (error) throw new Error(error.message);
        }),
      );
      setBusy(mode === "now" ? "Drafting with Claude…" : "Saving…");
      const r = await submitIntake({ batch, paths: uploads.map((u) => u.path), note, taps: { roleKind, metric, change }, mode });
      setResult(r);
      if (r.ok) {
        setFiles([]); setNote(""); setRoleKind(null); setMetric(""); setChange(""); setShowMetric(false); setShowChange(false);
      }
    } catch (e) {
      setResult({ ok: false, error: e instanceof Error ? e.message : "Upload failed" });
    } finally {
      setBusy(null);
    }
  }

  const chip = (on: boolean) => `chip cursor-pointer py-1.5 text-sm ${on ? "chip-on" : ""}`;

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="btn w-full py-6 text-base">{files.length ? `${files.length} photo${files.length > 1 ? "s" : ""} selected` : "Choose photos"}</span>
        <input
          type="file" accept="image/*" multiple className="sr-only"
          onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 12))}
        />
      </label>
      {previews.length > 0 && (
        <div className="grid grid-cols-4 gap-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {previews.map((src, i) => <img key={src} src={src} alt={`photo ${i + 1}`} className="aspect-square w-full rounded object-cover" />)}
        </div>
      )}

      <textarea
        value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="input text-base"
        placeholder="One sentence: what is it? (e.g. “Finished the 5C collet fixture for the Haas”, or “more drill press pics”)"
      />

      <div className="flex flex-wrap gap-2">
        <button type="button" className={chip(roleKind === "solo")} onClick={() => setRoleKind(roleKind === "solo" ? null : "solo")}>Solo</button>
        <button type="button" className={chip(roleKind === "team")} onClick={() => setRoleKind(roleKind === "team" ? null : "team")}>Team</button>
        <button type="button" className={chip(showMetric || !!metric)} onClick={() => setShowMetric(!showMetric)}>Number to brag about?</button>
        <button type="button" className={chip(showChange || !!change)} onClick={() => setShowChange(!showChange)}>What would you change?</button>
      </div>
      {showMetric && (
        <input value={metric} onChange={(e) => setMetric(e.target.value)} className="input text-base" placeholder="e.g. held ±0.001 in, setup 40 → 10 min" />
      )}
      {showChange && (
        <input value={change} onChange={(e) => setChange(e.target.value)} className="input text-base" placeholder="One line" />
      )}

      <button type="button" className="btn btn-primary w-full py-3 text-base" disabled={!files.length || !!busy} onClick={() => send("now")}>
        {busy ?? "Send"}
      </button>
      <button type="button" className="btn w-full" disabled={!files.length || !!busy} onClick={() => send("chat")}>
        Save for chat (draft it later with Claude Code)
      </button>

      {result && (result.ok ? (
        <div className="rounded-md border border-green-600/40 p-3 text-sm">
          {result.note && <span className="block text-neutral-500">{result.note}</span>}
          {result.action === "new" ? "New draft: " : result.action === "saved" ? "Saved for chat: " : `Added ${result.photos} photo(s) to `}
          <strong>{result.title}</strong>.{" "}
          <Link href={`/review/${result.projectId}`} className="text-accent underline">Review →</Link>
        </div>
      ) : (
        <p className="rounded-md border border-red-600/40 p-3 text-sm text-red-600">{result.error}</p>
      ))}

      <p className="pt-4 text-center text-sm"><Link href="/review" className="text-accent">All drafts →</Link></p>
    </div>
  );
}
