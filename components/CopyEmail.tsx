"use client";
import { useState } from "react";

export default function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  if (!email) return null;
  return (
    <button
      type="button"
      className="text-sm hover:text-accent"
      title="Copy email"
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
