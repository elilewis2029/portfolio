"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

/** Footer "Sign in" that brings the owner back to the page they were reading. */
export default function SignInLink() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const next = pathname === "/login" ? "/" : pathname + (search ? `?${search}` : "");
  return (
    <Link href={`/login?next=${encodeURIComponent(next)}`} className="inline-flex min-h-11 items-center text-xs text-neutral-500 hover:text-accent">
      Sign in
    </Link>
  );
}
