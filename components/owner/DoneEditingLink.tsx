"use client";
import Link from "next/link";

/**
 * "Done editing" that asks before leaving unsaved edits behind. iOS Safari ignores the browser's own
 * "leave site?" prompt, and the kept copy (DraftForm) would otherwise surprise you next time.
 */
export default function DoneEditingLink({ href, draftKey }: { href: string; draftKey: string }) {
  return (
    <Link
      href={href}
      className="btn"
      onClick={(e) => {
        let unsaved = false;
        try { unsaved = !!localStorage.getItem("portfolio-draft:" + draftKey); } catch { /* storage blocked */ }
        if (unsaved && !window.confirm("You have unsaved changes. Leave anyway? They stay on this device and come back next time you edit.")) e.preventDefault();
      }}
    >
      Done editing
    </Link>
  );
}
