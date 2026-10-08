"use client";
import { useFormStatus } from "react-dom";

/**
 * Submit button for a server-action form. With `message` it asks first (irreversible actions);
 * while the action runs it is disabled and shows `pending` (default "…"), so a tap is visibly doing something.
 */
export default function ConfirmSubmit({ message, pending, className, children }: { message?: string; pending?: string; className?: string; children: React.ReactNode }) {
  const status = useFormStatus();
  return (
    <button
      type="submit"
      className={className}
      disabled={status.pending}
      aria-busy={status.pending || undefined}
      onClick={(e) => { if (message && !window.confirm(message)) e.preventDefault(); }}
    >
      {status.pending ? (pending ?? "…") : children}
    </button>
  );
}
