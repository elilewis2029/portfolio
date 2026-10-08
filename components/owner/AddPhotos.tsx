"use client";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { prepareUploads } from "@/app/add/actions";
import { addPhotos } from "@/app/review/actions";

/** "Add photos" on a project page: uploads straight to this project, no intake note needed. */
export default function AddPhotos({ projectId, supabaseUrl, anonKey }: { projectId: string; supabaseUrl: string; anonKey: string }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const storage = useMemo(() => createClient(supabaseUrl, anonKey).storage.from("portfolio"), [supabaseUrl, anonKey]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function upload(files: File[]) {
    if (!files.length) return;
    setBusy(true);
    setMsg(null);
    try {
      const prep = await prepareUploads(files.map((f) => f.name));
      if ("error" in prep) { setMsg("Your sign-in has expired. Reload the page, sign in, then add the photos again."); return; }
      const { batch, uploads } = prep;
      await Promise.all(
        uploads.map(async (u, i) => {
          const { error } = await storage.uploadToSignedUrl(u.path, u.token, files[i], { contentType: files[i].type || "image/jpeg" });
          if (error) throw new Error(error.message);
        }),
      );
      const r = await addPhotos(projectId, batch, uploads.map((u) => u.path));
      setMsg(r.ok ? `Added ${r.added} photo${r.added > 1 ? "s" : ""}. Set kind and caption under Edit.` : r.error);
      if (r.ok) router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <>
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => upload([...(e.target.files ?? [])])} />
      <button type="button" className="btn" disabled={busy} onClick={() => input.current?.click()}>
        {busy ? "Uploading…" : "Add photos"}
      </button>
      {msg && <span className="basis-full text-xs text-neutral-500" role="status">{msg}</span>}
    </>
  );
}
