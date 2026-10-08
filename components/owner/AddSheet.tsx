"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import AddForm from "@/app/add/AddForm";

/** Owner mode: floating "+" that opens the intake as a bottom sheet on any page. */
export default function AddSheet({ supabaseUrl, anonKey }: { supabaseUrl: string; anonKey: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  if (pathname === "/add") return null; // the page already is the sheet

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Add a project"
        title="Add a project"
        className="no-print fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-3xl font-light leading-none text-white shadow-lg shadow-accent/30 hover:bg-accent/90 active:scale-95"
        style={{ bottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
      >
        +
      </button>
      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        onClick={(e) => { if (e.target === ref.current) setOpen(false); }}
        className="sheet no-print m-0 mt-auto w-full max-w-none rounded-t-2xl bg-white p-0 text-neutral-900 backdrop:bg-black/40 sm:mx-auto sm:mb-6 sm:max-w-md sm:rounded-2xl dark:bg-neutral-950 dark:text-neutral-100"
      >
        <div className="max-h-[88vh] overflow-y-auto p-4 pb-8">
          <div className="mb-3 flex items-center">
            <h2 className="text-lg font-semibold">Add to portfolio</h2>
            <button type="button" onClick={() => setOpen(false)} className="btn ml-auto h-9 w-9 rounded-full p-0" aria-label="Close">×</button>
          </div>
          {/* Stays mounted while closed: closing keeps the chosen photos and note, and a send in progress still reports back. */}
          <AddForm supabaseUrl={supabaseUrl} anonKey={anonKey} onDone={() => setOpen(false)} />
        </div>
      </dialog>
    </>
  );
}
