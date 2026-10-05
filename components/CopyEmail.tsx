"use client";
import { useState } from "react";

export default function CopyEmail({ email, className = "text-sm hover:text-accent" }: { email: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  if (!email) return null;
  return (
    <button
      type="button"
      className={className}
      title="Copy email"
      aria-live="polite"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(email);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          window.location.href = `mailto:${email}`;
        }
      }}
    >
      {copied ? "Copied ✓" : email}
    </button>
  );
}
